-- SQL script to reset ALL demo user passwords in the database
-- Run this script in your PostgreSQL database to set up demo users
-- Roles: admin, organization_owner, therapist, staff, client

-- Password hashes generated using bcrypt with 12 rounds
-- Passwords: Admin123!, Owner123!, Therapist123!, Staff123!, Client123!

-- Admin (Super Admin) user
INSERT INTO users (email, password_hash, name, role, created_at, updated_at)
VALUES (
    'admin@voucherskit.com',
    '$2b$12$vuYN3wpFNedE/cCcY4.KVu8ZO2iQ.jFQqP79QnoFuLJxXgBaadsEW', -- Admin123!
    'System Administrator',
    'admin',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE
SET password_hash = '$2b$12$vuYN3wpFNedE/cCcY4.KVu8ZO2iQ.jFQqP79QnoFuLJxXgBaadsEW',
    name = 'System Administrator',
    role = 'admin',
    updated_at = NOW();

-- Organization Owner user
INSERT INTO users (email, password_hash, name, role, created_at, updated_at)
VALUES (
    'owner@voucherskit.com',
    '$2b$12$/4ti9/h5wyjN4CJksmaOGe.XvhJIyiCImX3bQC/wl.DeEXOM.FXGa', -- Owner123!
    'Organization Owner',
    'organization_owner',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE
SET password_hash = '$2b$12$/4ti9/h5wyjN4CJksmaOGe.XvhJIyiCImX3bQC/wl.DeEXOM.FXGa',
    name = 'Organization Owner',
    role = 'organization_owner',
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
    name = 'Demo Therapist',
    role = 'therapist',
    updated_at = NOW();

-- Staff user
INSERT INTO users (email, password_hash, name, role, created_at, updated_at)
VALUES (
    'staff@voucherskit.com',
    '$2b$12$R8p4j79mhlNfs3d6Vam6je39MF/p0MfdKP7BQ5zIJNi/dtyoAaZuC', -- Staff123!
    'Staff Member',
    'staff',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE
SET password_hash = '$2b$12$R8p4j79mhlNfs3d6Vam6je39MF/p0MfdKP7BQ5zIJNi/dtyoAaZuC',
    name = 'Staff Member',
    role = 'staff',
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
    name = 'Demo Client',
    role = 'client',
    updated_at = NOW();

-- Verify the users were created/updated
SELECT id, email, name, role, created_at, updated_at
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

-- Output message
DO $$
BEGIN
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Demo users have been created/updated with new passwords:';
    RAISE NOTICE '';
    RAISE NOTICE 'ADMIN:              admin@voucherskit.com / Admin123!';
    RAISE NOTICE 'ORGANIZATION_OWNER: owner@voucherskit.com / Owner123!';
    RAISE NOTICE 'THERAPIST:          therapist@voucherskit.com / Therapist123!';
    RAISE NOTICE 'STAFF:              staff@voucherskit.com / Staff123!';
    RAISE NOTICE 'CLIENT:             client@voucherskit.com / Client123!';
    RAISE NOTICE '';
    RAISE NOTICE '============================================================';
END $$;