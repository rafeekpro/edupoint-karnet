#!/bin/bash

# Skrypt do połączenia z produkcyjną bazą danych voucherskit
# Host: postgres.local.pro4.es
# Database: voucherskit
# User: voucherskit

echo "Łączenie z bazą produkcyjną voucherskit..."
echo "Host: postgres.local.pro4.es"
echo "Database: voucherskit"
echo "User: voucherskit"
echo ""

export PGPASSWORD='VouchersKit2024Prod'

if [ "$1" == "stats" ]; then
    echo "Statystyki bazy danych:"
    psql -h postgres.local.pro4.es -U voucherskit -d voucherskit -c "
    SELECT 'Tabela' as name, 'Liczba rekordów' as count
    UNION ALL
    SELECT '==================', '==============='
    UNION ALL
    SELECT 'users', COUNT(*)::text FROM users
    UNION ALL
    SELECT 'vouchers', COUNT(*)::text FROM vouchers
    UNION ALL
    SELECT 'voucher_codes', COUNT(*)::text FROM voucher_codes
    UNION ALL
    SELECT 'voucher_types', COUNT(*)::text FROM voucher_types
    UNION ALL
    SELECT 'therapy_classes', COUNT(*)::text FROM therapy_classes
    UNION ALL
    SELECT 'reservations', COUNT(*)::text FROM reservations
    UNION ALL
    SELECT 'sessions', COUNT(*)::text FROM sessions
    UNION ALL
    SELECT 'organizations', COUNT(*)::text FROM organizations
    UNION ALL
    SELECT 'client_vouchers', COUNT(*)::text FROM client_vouchers;"
elif [ "$1" == "backup" ]; then
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="./database_backup/voucherskit_backup_$TIMESTAMP.sql"
    echo "Tworzenie backupu do: $BACKUP_FILE"
    pg_dump -h postgres.local.pro4.es -U voucherskit -d voucherskit > "$BACKUP_FILE"
    echo "Backup utworzony: $BACKUP_FILE"
else
    # Interaktywna sesja psql
    psql -h postgres.local.pro4.es -U voucherskit -d voucherskit
fi