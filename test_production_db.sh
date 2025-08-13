#!/bin/bash

echo "Test połączenia z bazą produkcyjną"
echo "Host: postgres.local.pro4.es"
echo ""
echo "Wprowadź hasło do bazy produkcyjnej:"
read -s PASSWORD
echo ""

echo "Testowanie połączenia..."
PGPASSWORD="$PASSWORD" psql -h postgres.local.pro4.es -U therapy_user -d therapy_system -c "SELECT version();" 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Połączenie udane!"
    echo ""
    echo "Statystyki bazy produkcyjnej:"
    PGPASSWORD="$PASSWORD" psql -h postgres.local.pro4.es -U therapy_user -d therapy_system -c "
    SELECT 'Tabela' as name, 'Liczba rekordów' as count
    UNION ALL
    SELECT '------', '---------------'
    UNION ALL
    SELECT 'users', COUNT(*)::text FROM users
    UNION ALL
    SELECT 'vouchers', COUNT(*)::text FROM vouchers
    UNION ALL
    SELECT 'voucher_codes', COUNT(*)::text FROM voucher_codes
    UNION ALL
    SELECT 'therapy_classes', COUNT(*)::text FROM therapy_classes
    UNION ALL
    SELECT 'reservations', COUNT(*)::text FROM reservations
    UNION ALL
    SELECT 'sessions', COUNT(*)::text FROM sessions;"
else
    echo "❌ Błąd połączenia - sprawdź hasło"
fi