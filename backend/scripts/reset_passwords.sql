-- SQL script to reset demo user passwords in the database
-- Run this script in your PostgreSQL database to set up demo users

-- Password hashes generated using bcrypt with 12 rounds
-- Passwords: Admin123!, Therapist123!, Client123!

-- Admin user
INSERT INTO users (email, password_hash, name, role, created_at, updated_at)
VALUES (
    'admin@voucherskit.com',
    '$2b$12$vuYN3wpFNedE/cCcY4.KVu8ZO2iQ.jFQqP79QnoFuLJxXgBaadsEW', -- Admin123!
    'Administrator',
    'admin',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE
SET password_hash = '$2b$12$vuYN3wpFNedE/cCcY4.KVu8ZO2iQ.jFQqP79QnoFuLJxXgBaadsEW',
    updated_at = NOW();

-- Therapist user
INSERT INTO users (email, password_hash, name, role, created_at, updated_at)
VALUES (
    'therapist@voucherskit.com',
    '$2b$12$TAIVHGSYNbUqcyZv5C.YM.0Em1FgjVwSpu7NzdJdddAYaKV5wV1Ja', -- Therapist123!
    'Demo Therapist',
    'therapist',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE
SET password_hash = '$2b$12$TAIVHGSYNbUqcyZv5C.YM.0Em1FgjVwSpu7NzdJdddAYaKV5wV1Ja',
    updated_at = NOW();

-- Client user
INSERT INTO users (email, password_hash, name, role, created_at, updated_at)
VALUES (
    'client@voucherskit.com',
    '$2b$12$Hm.4vqGxz/KSPRW.I.yHdOzziu3Rz..dS4jOqvXhYZ0r9IFdn3vpS', -- Client123!
    'Demo Client',
    'client',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE
SET password_hash = '$2b$12$Hm.4vqGxz/KSPRW.I.yHdOzziu3Rz..dS4jOqvXhYZ0r9IFdn3vpS',
    updated_at = NOW();

-- Verify the users were created/updated
SELECT id, email, name, role, created_at, updated_at
FROM users
WHERE email IN (
    'admin@voucherskit.com',
    'therapist@voucherskit.com',
    'client@voucherskit.com'
);

-- Output message
DO $$
BEGIN
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Demo users have been created/updated with new passwords:';
    RAISE NOTICE '  admin@voucherskit.com / Admin123!';
    RAISE NOTICE '  therapist@voucherskit.com / Therapist123!';
    RAISE NOTICE '  client@voucherskit.com / Client123!';
    RAISE NOTICE '============================================================';
END $$;