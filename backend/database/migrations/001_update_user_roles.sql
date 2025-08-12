-- Migration to update user roles to new system
-- Roles: admin, owner, employee, client

-- First, add new column for role if it doesn't exist with proper enum
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_new VARCHAR(20);

-- Map existing roles to new roles
UPDATE users 
SET role_new = CASE 
    WHEN role = 'admin' THEN 'admin'
    WHEN role = 'organization_owner' THEN 'owner'
    WHEN role = 'therapist' THEN 'employee'
    WHEN role = 'client' THEN 'client'
    WHEN role = 'staff' THEN 'employee'
    ELSE role
END;

-- Drop old role column and rename new one
ALTER TABLE users DROP COLUMN IF EXISTS role;
ALTER TABLE users RENAME COLUMN role_new TO role;

-- Add constraint for valid roles
ALTER TABLE users ADD CONSTRAINT check_valid_role 
CHECK (role IN ('admin', 'owner', 'employee', 'client'));

-- Create index on role for better query performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update any foreign key references if needed
-- This depends on your exact schema