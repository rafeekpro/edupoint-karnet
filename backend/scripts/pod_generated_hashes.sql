-- Password hashes generated from within the backend pod
-- These are compatible with the backend's bcrypt version
-- Generated on 2025-08-18

UPDATE users SET password_hash = '$2b$12$z.gRPr2kpIOOzKGozk1lGugjFJW3llpiYbsZ3pTzC7WPDIh2cIG0S', updated_at = NOW() WHERE email = 'admin@voucherskit.com';
UPDATE users SET password_hash = '$2b$12$mO4vkoZGPf21dVVYwOlGhu2mWAc2tjIqgugNvlZmjLE0Kva2Q1OYa', updated_at = NOW() WHERE email = 'owner@voucherskit.com';
UPDATE users SET password_hash = '$2b$12$FoB3kyGw3FZggMgxC0wN9euuMr71dPuxU7LLO7S6.4.H8UjeSys4q', updated_at = NOW() WHERE email = 'therapist@voucherskit.com';
UPDATE users SET password_hash = '$2b$12$P8AVoxbCwAv.R7NyszUskufARSzkXuknPJfcVCNidwn6v6TdOrIRG', updated_at = NOW() WHERE email = 'staff@voucherskit.com';
UPDATE users SET password_hash = '$2b$12$mki0fDMfRuhZcMFRpP26GeNlPSZUK.6aXZj87llAQABhPXqr7o3lu', updated_at = NOW() WHERE email = 'client@voucherskit.com';

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