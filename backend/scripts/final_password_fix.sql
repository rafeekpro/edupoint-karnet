-- Final password fix for all demo users
-- Generated from the new backend pods with UserRole enum fix
-- Generated on 2025-08-18 11:13:00

UPDATE users SET password_hash = '$2b$12$v.kIF/Q7bfvOYwOugNTz7uu7MIO0AKK96ZMYvO/bq0joqRl3ukucq', updated_at = NOW() WHERE email = 'admin@voucherskit.com';
UPDATE users SET password_hash = '$2b$12$LTSzelnt2OQ.aZ/cr.qvnenxvjWE4.iM0c/say.P0UXNvbwfK8Z06', updated_at = NOW() WHERE email = 'owner@voucherskit.com';
UPDATE users SET password_hash = '$2b$12$lpFEqWOQRtdwhvxAYfxx8u17zxBrOYf/mre0i/KkvuA/GYh5m2Kzm', updated_at = NOW() WHERE email = 'therapist@voucherskit.com';
UPDATE users SET password_hash = '$2b$12$qd0I2GORU15TpNKUv95AweUDrLII1Z2m3ZCabrCSdsa49TY./IZCC', updated_at = NOW() WHERE email = 'staff@voucherskit.com';
UPDATE users SET password_hash = '$2b$12$KIb8BApj6aPBf3Iv6yir8eG1TAKhriD112ZoSLki/0I4ZYP2wsh8S', updated_at = NOW() WHERE email = 'client@voucherskit.com';

-- Verify the updates
SELECT email, substring(password_hash, 1, 30) as hash_prefix, role 
FROM users 
WHERE email IN (
    'admin@voucherskit.com',
    'owner@voucherskit.com', 
    'therapist@voucherskit.com',
    'staff@voucherskit.com',
    'client@voucherskit.com'
)
ORDER BY 
    CASE role
        WHEN 'admin' THEN 1
        WHEN 'organization_owner' THEN 2
        WHEN 'therapist' THEN 3
        WHEN 'staff' THEN 4
        WHEN 'client' THEN 5
    END;