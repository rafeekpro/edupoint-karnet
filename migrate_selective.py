#!/usr/bin/env python3

import os
import sys
import subprocess
import getpass
from datetime import datetime

def run_command(command, capture_output=True):
    """Execute a shell command and return output"""
    try:
        if capture_output:
            result = subprocess.run(command, shell=True, capture_output=True, text=True)
            return result.stdout, result.stderr, result.returncode
        else:
            result = subprocess.run(command, shell=True)
            return None, None, result.returncode
    except Exception as e:
        return None, str(e), 1

def get_table_data(table_name, is_dev=True):
    """Get data from a specific table"""
    if is_dev:
        cmd = f"docker exec voucherskit-postgres psql -U therapy_user -d therapy_system -c 'SELECT * FROM {table_name}' -t"
    else:
        password = os.environ.get('PROD_DB_PASSWORD', '')
        cmd = f"PGPASSWORD={password} psql -h postgres.local.pro4.es -U therapy_user -d therapy_system -c 'SELECT * FROM {table_name}' -t"
    
    stdout, stderr, returncode = run_command(cmd)
    if returncode != 0:
        print(f"Error getting data from {table_name}: {stderr}")
        return None
    return stdout

def count_records(table_name, is_dev=True):
    """Count records in a table"""
    if is_dev:
        cmd = f"docker exec voucherskit-postgres psql -U therapy_user -d therapy_system -c 'SELECT COUNT(*) FROM {table_name}' -t"
    else:
        password = os.environ.get('PROD_DB_PASSWORD', '')
        cmd = f"PGPASSWORD={password} psql -h postgres.local.pro4.es -U therapy_user -d therapy_system -c 'SELECT COUNT(*) FROM {table_name}' -t"
    
    stdout, stderr, returncode = run_command(cmd)
    if returncode == 0:
        return int(stdout.strip())
    return 0

def export_table(table_name, output_file):
    """Export a single table from development database"""
    cmd = f"docker exec voucherskit-postgres pg_dump -U therapy_user -d therapy_system --table={table_name} --data-only --disable-triggers > {output_file}"
    stdout, stderr, returncode = run_command(cmd, capture_output=False)
    return returncode == 0

def import_table(table_name, input_file, password):
    """Import a single table to production database"""
    # First, delete existing data
    delete_cmd = f"PGPASSWORD={password} psql -h postgres.local.pro4.es -U therapy_user -d therapy_system -c 'DELETE FROM {table_name}'"
    run_command(delete_cmd)
    
    # Then import new data
    import_cmd = f"PGPASSWORD={password} psql -h postgres.local.pro4.es -U therapy_user -d therapy_system < {input_file}"
    stdout, stderr, returncode = run_command(import_cmd, capture_output=False)
    return returncode == 0

def main():
    print("=" * 50)
    print("SELEKTYWNA MIGRACJA DANYCH DO PRODUKCJI")
    print("=" * 50)
    print()
    
    # Lista dostępnych tabel
    tables = [
        'users',
        'vouchers',
        'voucher_codes',
        'voucher_types',
        'therapy_classes',
        'reservations',
        'sessions',
        'organizations',
        'permissions',
        'client_vouchers',
        'payment_transactions',
        'audit_logs'
    ]
    
    print("Dostępne tabele:")
    for i, table in enumerate(tables, 1):
        dev_count = count_records(table, is_dev=True)
        print(f"  {i}. {table} ({dev_count} rekordów w development)")
    
    print()
    print("Wybierz tabele do migracji (oddzielone przecinkami, np. 1,2,3)")
    print("Lub wpisz 'wszystkie' aby zmigrować wszystkie tabele:")
    choice = input("> ").strip()
    
    if choice.lower() == 'wszystkie':
        selected_tables = tables
    else:
        try:
            indices = [int(x.strip()) - 1 for x in choice.split(',')]
            selected_tables = [tables[i] for i in indices if 0 <= i < len(tables)]
        except (ValueError, IndexError):
            print("Nieprawidłowy wybór!")
            sys.exit(1)
    
    if not selected_tables:
        print("Nie wybrano żadnych tabel!")
        sys.exit(1)
    
    print()
    print(f"Wybrane tabele: {', '.join(selected_tables)}")
    print()
    
    # Pobieranie hasła do bazy produkcyjnej
    prod_password = getpass.getpass("Podaj hasło do bazy produkcyjnej: ")
    os.environ['PROD_DB_PASSWORD'] = prod_password
    
    # Test połączenia
    print()
    print("Testowanie połączenia z bazą produkcyjną...")
    test_cmd = f"PGPASSWORD={prod_password} psql -h postgres.local.pro4.es -U therapy_user -d therapy_system -c 'SELECT 1' > /dev/null 2>&1"
    stdout, stderr, returncode = run_command(test_cmd)
    if returncode != 0:
        print("Błąd: Nie można połączyć się z bazą produkcyjną!")
        print("Sprawdź hasło i połączenie sieciowe.")
        sys.exit(1)
    print("✓ Połączono z bazą produkcyjną")
    
    # Tworzenie katalogu na backupy
    backup_dir = "./database_backup"
    os.makedirs(backup_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Potwierdzenie
    print()
    print("UWAGA: Ta operacja zastąpi dane w wybranych tabelach w bazie produkcyjnej!")
    confirm = input("Czy chcesz kontynuować? (tak/nie): ")
    if confirm.lower() != 'tak':
        print("Migracja anulowana.")
        sys.exit(0)
    
    # Migracja każdej tabeli
    print()
    print("Rozpoczynam migrację...")
    print()
    
    for table in selected_tables:
        print(f"Migracja tabeli: {table}")
        
        # Eksport
        export_file = f"{backup_dir}/{table}_{timestamp}.sql"
        print(f"  - Eksportowanie z development...")
        if export_table(table, export_file):
            print(f"    ✓ Wyeksportowano do {export_file}")
        else:
            print(f"    ✗ Błąd eksportu!")
            continue
        
        # Import
        print(f"  - Importowanie do produkcji...")
        if import_table(table, export_file, prod_password):
            prod_count = count_records(table, is_dev=False)
            print(f"    ✓ Zaimportowano ({prod_count} rekordów)")
        else:
            print(f"    ✗ Błąd importu!")
    
    print()
    print("=" * 50)
    print("MIGRACJA ZAKOŃCZONA")
    print("=" * 50)
    print()
    print("Podsumowanie (liczba rekordów w produkcji):")
    for table in selected_tables:
        count = count_records(table, is_dev=False)
        print(f"  - {table}: {count}")

if __name__ == "__main__":
    main()