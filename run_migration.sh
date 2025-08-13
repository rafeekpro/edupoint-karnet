#!/bin/bash

echo "========================================="
echo "MIGRACJA DANYCH DO BAZY PRODUKCYJNEJ"
echo "========================================="
echo ""
echo "Host produkcyjny: postgres.local.pro4.es"
echo "Baza danych: therapy_system"
echo "Użytkownik: therapy_user"
echo ""
echo "Podaj hasło do bazy produkcyjnej:"
read -s PROD_PASSWORD
echo ""

# Test połączenia
echo "Testowanie połączenia z bazą produkcyjną..."
PGPASSWORD="$PROD_PASSWORD" psql -h postgres.local.pro4.es -U therapy_user -d therapy_system -c "SELECT 1" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Błąd: Nie można połączyć się z bazą produkcyjną!"
    echo "Sprawdź hasło i spróbuj ponownie."
    exit 1
fi
echo "✓ Połączono z bazą produkcyjną"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./database_backup"
MIGRATION_FILE="$BACKUP_DIR/migration_$TIMESTAMP.sql"

echo ""
echo "1. Eksportowanie danych z lokalnej bazy development..."
docker exec voucherskit-postgres pg_dump -U therapy_user -d therapy_system --clean --if-exists > "$MIGRATION_FILE"
echo "   ✓ Dane wyeksportowane do: $MIGRATION_FILE"

echo ""
echo "2. Tworzenie backupu bazy produkcyjnej..."
PGPASSWORD="$PROD_PASSWORD" pg_dump -h postgres.local.pro4.es -U therapy_user -d therapy_system > "$BACKUP_DIR/prod_backup_before_migration_$TIMESTAMP.sql" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "   ✓ Backup produkcji zapisany: prod_backup_before_migration_$TIMESTAMP.sql"
else
    echo "   ⚠ Nie udało się utworzyć backupu bazy produkcyjnej"
fi

echo ""
echo "3. Importowanie danych do bazy produkcyjnej..."
echo "   ⚠ UWAGA: To zastąpi WSZYSTKIE dane w bazie produkcyjnej!"
echo ""
read -p "Czy chcesz kontynuować? (tak/nie): " CONFIRM
if [ "$CONFIRM" != "tak" ]; then
    echo "Migracja anulowana."
    exit 0
fi

echo ""
echo "Wykonywanie migracji..."
PGPASSWORD="$PROD_PASSWORD" psql -h postgres.local.pro4.es -U therapy_user -d therapy_system < "$MIGRATION_FILE" 2>&1 | grep -v "does not exist, skipping" | grep -v "NOTICE"

echo ""
echo "4. Weryfikacja migracji..."
echo ""
echo "Liczba rekordów w bazie produkcyjnej:"
PGPASSWORD="$PROD_PASSWORD" psql -h postgres.local.pro4.es -U therapy_user -d therapy_system -c "
SELECT 'Users: ' || COUNT(*) FROM users
UNION ALL
SELECT 'Vouchers: ' || COUNT(*) FROM vouchers
UNION ALL
SELECT 'Voucher codes: ' || COUNT(*) FROM voucher_codes
UNION ALL
SELECT 'Therapy classes: ' || COUNT(*) FROM therapy_classes
UNION ALL
SELECT 'Reservations: ' || COUNT(*) FROM reservations
UNION ALL
SELECT 'Sessions: ' || COUNT(*) FROM sessions;"

echo ""
echo "========================================="
echo "✓ MIGRACJA ZAKOŃCZONA"
echo "========================================="
echo ""
echo "Pliki backupu znajdują się w: $BACKUP_DIR"
echo ""
echo "W razie problemów możesz przywrócić backup produkcji:"
echo "PGPASSWORD='hasło' psql -h postgres.local.pro4.es -U therapy_user -d therapy_system < $BACKUP_DIR/prod_backup_before_migration_$TIMESTAMP.sql"