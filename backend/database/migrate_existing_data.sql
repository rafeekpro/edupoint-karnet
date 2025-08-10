-- Data Migration Script for existing data
-- Run this after migration_v2.sql

-- ============================================
-- 1. CREATE DEFAULT ORGANIZATION
-- ============================================
INSERT INTO organizations (name, slug, email, is_active)
VALUES ('Default Organization', 'default-org', 'admin@voucherskit.com', true)
ON CONFLICT DO NOTHING;

-- Get the default organization ID
DO $$
DECLARE
    default_org_id INTEGER;
BEGIN
    SELECT id INTO default_org_id FROM organizations WHERE slug = 'default-org';
    
    -- ============================================
    -- 2. UPDATE EXISTING USERS
    -- ============================================
    -- Assign all existing users to default organization
    UPDATE users 
    SET organization_id = default_org_id,
        updated_at = NOW()
    WHERE organization_id IS NULL;
    
    -- Make admin users organization owners
    UPDATE users 
    SET is_organization_owner = true
    WHERE role = 'admin';
    
    -- Update admin role to organization_owner for non-system admins
    UPDATE users 
    SET role = 'organization_owner'
    WHERE role = 'admin' 
    AND email != 'admin@voucherskit.com';
    
    -- ============================================
    -- 3. CREATE DEFAULT VOUCHER TYPES
    -- ============================================
    -- Create standard voucher types based on existing patterns
    INSERT INTO voucher_types (
        organization_id, 
        name, 
        session_name,
        description,
        total_sessions, 
        backup_sessions,
        session_duration_minutes,
        max_clients_per_session,
        frequency,
        price,
        validity_days,
        booking_rules
    ) VALUES 
    (
        default_org_id,
        'Standard Individual Therapy',
        'Individual Session',
        '10 individual therapy sessions with 2 backup sessions',
        10,
        2,
        60,
        1,
        'weekly',
        399.99,
        90,
        '{
            "monday": {"enabled": true, "start_time": "08:00", "end_time": "20:00"},
            "tuesday": {"enabled": true, "start_time": "08:00", "end_time": "20:00"},
            "wednesday": {"enabled": true, "start_time": "08:00", "end_time": "20:00"},
            "thursday": {"enabled": true, "start_time": "08:00", "end_time": "20:00"},
            "friday": {"enabled": true, "start_time": "12:00", "end_time": "18:00"},
            "saturday": {"enabled": false},
            "sunday": {"enabled": false}
        }'::jsonb
    ),
    (
        default_org_id,
        'Group Therapy Package',
        'Group Session',
        '8 group therapy sessions for up to 8 participants',
        8,
        2,
        90,
        8,
        'weekly',
        199.99,
        60,
        '{
            "monday": {"enabled": true, "start_time": "18:00", "end_time": "20:00"},
            "tuesday": {"enabled": false},
            "wednesday": {"enabled": true, "start_time": "18:00", "end_time": "20:00"},
            "thursday": {"enabled": false},
            "friday": {"enabled": true, "start_time": "17:00", "end_time": "19:00"},
            "saturday": {"enabled": false},
            "sunday": {"enabled": false}
        }'::jsonb
    ),
    (
        default_org_id,
        'Intensive Daily Sessions',
        'Daily Session',
        '20 daily sessions for intensive therapy',
        20,
        4,
        45,
        1,
        'daily',
        799.99,
        30,
        '{
            "monday": {"enabled": true, "start_time": "09:00", "end_time": "17:00"},
            "tuesday": {"enabled": true, "start_time": "09:00", "end_time": "17:00"},
            "wednesday": {"enabled": true, "start_time": "09:00", "end_time": "17:00"},
            "thursday": {"enabled": true, "start_time": "09:00", "end_time": "17:00"},
            "friday": {"enabled": true, "start_time": "09:00", "end_time": "17:00"},
            "saturday": {"enabled": false},
            "sunday": {"enabled": false}
        }'::jsonb
    );
    
    -- ============================================
    -- 4. UPDATE EXISTING THERAPY CLASSES
    -- ============================================
    UPDATE therapy_classes 
    SET organization_id = default_org_id,
        updated_at = NOW()
    WHERE organization_id IS NULL;
    
    -- ============================================
    -- 5. UPDATE EXISTING VOUCHERS
    -- ============================================
    UPDATE vouchers 
    SET organization_id = default_org_id,
        status = CASE 
            WHEN valid_until < NOW() THEN 'expired'
            WHEN used_sessions >= total_sessions THEN 'completed'
            ELSE 'active'
        END
    WHERE organization_id IS NULL;
    
    -- Link existing vouchers to appropriate voucher types (best guess based on sessions)
    UPDATE vouchers v
    SET voucher_type_id = (
        SELECT vt.id 
        FROM voucher_types vt 
        WHERE vt.organization_id = default_org_id
        AND vt.total_sessions = v.total_sessions
        LIMIT 1
    )
    WHERE v.voucher_type_id IS NULL;
    
    -- ============================================
    -- 6. SET ADMIN PERMISSIONS
    -- ============================================
    INSERT INTO permissions (user_id, organization_id, permission, granted_at)
    SELECT u.id, default_org_id, 'all', NOW()
    FROM users u
    WHERE u.email = 'admin@voucherskit.com'
    ON CONFLICT DO NOTHING;
    
    -- Grant organization owner permissions
    INSERT INTO permissions (user_id, organization_id, permission, granted_at)
    SELECT u.id, u.organization_id, 'manage_organization', NOW()
    FROM users u
    WHERE u.is_organization_owner = true
    ON CONFLICT DO NOTHING;
    
    INSERT INTO permissions (user_id, organization_id, permission, granted_at)
    SELECT u.id, u.organization_id, 'manage_users', NOW()
    FROM users u
    WHERE u.is_organization_owner = true
    ON CONFLICT DO NOTHING;
    
    INSERT INTO permissions (user_id, organization_id, permission, granted_at)
    SELECT u.id, u.organization_id, 'manage_voucher_types', NOW()
    FROM users u
    WHERE u.is_organization_owner = true
    ON CONFLICT DO NOTHING;
    
    -- ============================================
    -- 7. CREATE AUDIT LOG ENTRY
    -- ============================================
    INSERT INTO audit_logs (
        user_id, 
        organization_id, 
        action, 
        entity_type, 
        entity_id,
        new_values,
        created_at
    ) VALUES (
        (SELECT id FROM users WHERE email = 'admin@voucherskit.com'),
        default_org_id,
        'migration',
        'system',
        0,
        '{"migration": "v2", "description": "Migrated to organization-based system"}'::jsonb,
        NOW()
    );
    
    RAISE NOTICE 'Data migration completed successfully!';
    RAISE NOTICE 'Default organization created with ID: %', default_org_id;
    RAISE NOTICE 'All existing users assigned to default organization';
    RAISE NOTICE 'Standard voucher types created';
END $$;

-- ============================================
-- 8. VERIFY MIGRATION
-- ============================================
DO $$
DECLARE
    org_count INTEGER;
    user_without_org INTEGER;
    voucher_type_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO org_count FROM organizations;
    SELECT COUNT(*) INTO user_without_org FROM users WHERE organization_id IS NULL;
    SELECT COUNT(*) INTO voucher_type_count FROM voucher_types;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== Migration Verification ===';
    RAISE NOTICE 'Organizations created: %', org_count;
    RAISE NOTICE 'Users without organization: %', user_without_org;
    RAISE NOTICE 'Voucher types created: %', voucher_type_count;
    
    IF user_without_org > 0 THEN
        RAISE WARNING 'There are % users without an organization!', user_without_org;
    END IF;
END $$;