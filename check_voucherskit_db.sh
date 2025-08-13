#!/bin/bash
export PGPASSWORD='1hE#*%lK*!OT'
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