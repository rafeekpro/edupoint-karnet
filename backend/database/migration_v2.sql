-- Migration to add missing tables and columns for full dashboard functionality
-- Run this after init.sql and before seed_extended.sql

-- Add missing columns to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS clients_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS therapists_count INTEGER DEFAULT 0;

-- Create voucher_types table
CREATE TABLE IF NOT EXISTS voucher_types (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sessions_count INTEGER NOT NULL,
    backup_sessions_count INTEGER DEFAULT 0,
    session_duration_minutes INTEGER NOT NULL DEFAULT 60,
    group_size INTEGER DEFAULT 1,
    validity_days INTEGER NOT NULL DEFAULT 90,
    price DECIMAL(10,2) NOT NULL,
    booking_advance_days INTEGER DEFAULT 7,
    booking_hour_start TIME DEFAULT '08:00',
    booking_hour_end TIME DEFAULT '20:00',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create client_vouchers table (purchased vouchers)
CREATE TABLE IF NOT EXISTS client_vouchers (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    voucher_type_id INTEGER NOT NULL REFERENCES voucher_types(id) ON DELETE RESTRICT,
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE NOT NULL,
    sessions_total INTEGER NOT NULL,
    sessions_used INTEGER DEFAULT 0,
    sessions_backup INTEGER DEFAULT 0,
    sessions_backup_used INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'exhausted', 'cancelled')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add organization_id to therapy_classes
ALTER TABLE therapy_classes 
ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE;

-- Add voucher_id to reservations
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS voucher_id INTEGER REFERENCES vouchers(id) ON DELETE SET NULL;

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INTEGER,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add approved_at column to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_voucher_types_org ON voucher_types(organization_id);
CREATE INDEX IF NOT EXISTS idx_client_vouchers_client ON client_vouchers(client_id);
CREATE INDEX IF NOT EXISTS idx_client_vouchers_type ON client_vouchers(voucher_type_id);
CREATE INDEX IF NOT EXISTS idx_client_vouchers_status ON client_vouchers(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_therapy_classes_org ON therapy_classes(organization_id);
CREATE INDEX IF NOT EXISTS idx_reservations_voucher ON reservations(voucher_id);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO therapy_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO therapy_user;

-- Display migration status
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== Migration V2 Completed Successfully ===';
    RAISE NOTICE '';
    RAISE NOTICE 'New tables created:';
    RAISE NOTICE '  - voucher_types';
    RAISE NOTICE '  - client_vouchers';
    RAISE NOTICE '  - audit_logs';
    RAISE NOTICE '';
    RAISE NOTICE 'Updated tables:';
    RAISE NOTICE '  - organizations (added description, counts)';
    RAISE NOTICE '  - therapy_classes (added organization_id)';
    RAISE NOTICE '  - reservations (added voucher_id)';
    RAISE NOTICE '  - users (added approved_at)';
    RAISE NOTICE '';
END $$;
EOF < /dev/null