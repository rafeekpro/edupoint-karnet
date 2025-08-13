#!/bin/bash

# Migracja danych z lokalnej bazy development do produkcyjnej
# UWAGA: Ten skrypt przywraca WSZYSTKIE dane z development do produkcji!

set -e

echo "========================================="
echo "MIGRACJA DANYCH DO BAZY PRODUKCYJNEJ"
echo "========================================="
echo ""
echo "UWAGA: Ten skrypt zastąpi WSZYSTKIE dane w bazie produkcyjnej danymi z bazy development!"
echo ""
read -p "Czy jesteś pewien, że chcesz kontynuować? (tak/nie): " confirmation

if [ "$confirmation" != "tak" ]; then
    echo "Migracja anulowana."
    exit 1
fi

# Konfiguracja
DEV_DB_HOST="localhost"
DEV_DB_PORT="5432"
DEV_DB_NAME="therapy_system"
DEV_DB_USER="therapy_user"
DEV_DB_PASSWORD="therapy_password"

PROD_DB_HOST="postgres.local.pro4.es"
PROD_DB_PORT="5432"
PROD_DB_NAME="therapy_system"
PROD_DB_USER="therapy_user"

echo ""
echo "Wprowadź hasło do bazy produkcyjnej:"
read -s PROD_DB_PASSWORD
echo ""

BACKUP_DIR="./database_backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Tworzenie katalogu na backupy
mkdir -p "$BACKUP_DIR"

echo "1. Eksportowanie danych z lokalnej bazy development..."
docker exec voucherskit-postgres pg_dump -U "$DEV_DB_USER" -d "$DEV_DB_NAME" --clean --if-exists > "$BACKUP_DIR/dev_export_$TIMESTAMP.sql"
echo "   ✓ Eksport ukończony: $BACKUP_DIR/dev_export_$TIMESTAMP.sql"

echo ""
echo "2. Próba utworzenia backupu bazy produkcyjnej..."
PGPASSWORD="$PROD_DB_PASSWORD" pg_dump -h "$PROD_DB_HOST" -U "$PROD_DB_USER" -d "$PROD_DB_NAME" --clean --if-exists > "$BACKUP_DIR/prod_backup_$TIMESTAMP.sql" 2>/dev/null || {
    echo "   ⚠ Nie udało się utworzyć backupu bazy produkcyjnej (możliwe problemy z połączeniem)"
    echo "   Kontynuować bez backupu produkcyjnego? (tak/nie): "
    read continue_without_backup
    if [ "$continue_without_backup" != "tak" ]; then
        echo "Migracja anulowana."
        exit 1
    fi
}

echo ""
echo "3. Importowanie danych do bazy produkcyjnej..."
echo "   Połączenie: $PROD_DB_HOST:$PROD_DB_PORT/$PROD_DB_NAME"
PGPASSWORD="$PROD_DB_PASSWORD" psql -h "$PROD_DB_HOST" -U "$PROD_DB_USER" -d "$PROD_DB_NAME" < "$BACKUP_DIR/dev_export_$TIMESTAMP.sql" 2>&1 | grep -v "does not exist, skipping" || true

echo ""
echo "4. Weryfikacja migracji..."
echo "   Liczba rekordów w bazie produkcyjnej:"
PGPASSWORD="$PROD_DB_PASSWORD" psql -h "$PROD_DB_HOST" -U "$PROD_DB_USER" -d "$PROD_DB_NAME" -t -c "
SELECT 'users: ' || COUNT(*) FROM users
UNION ALL
SELECT 'vouchers: ' || COUNT(*) FROM vouchers  
UNION ALL
SELECT 'voucher_codes: ' || COUNT(*) FROM voucher_codes
UNION ALL
SELECT 'therapy_classes: ' || COUNT(*) FROM therapy_classes
UNION ALL
SELECT 'reservations: ' || COUNT(*) FROM reservations
UNION ALL
SELECT 'sessions: ' || COUNT(*) FROM sessions;" 2>/dev/null || echo "   ⚠ Nie udało się zweryfikować danych"

echo ""
echo "========================================="
echo "MIGRACJA ZAKOŃCZONA"
echo "========================================="
echo ""
echo "Backupy zapisane w: $BACKUP_DIR"
echo "- Eksport development: dev_export_$TIMESTAMP.sql"
echo "- Backup produkcji: prod_backup_$TIMESTAMP.sql (jeśli utworzony)"
echo ""
echo "W razie problemów możesz przywrócić backup:"
echo "PGPASSWORD=hasło psql -h $PROD_DB_HOST -U $PROD_DB_USER -d $PROD_DB_NAME < $BACKUP_DIR/prod_backup_$TIMESTAMP.sql"