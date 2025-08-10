# Database Migration Summary - Version 2

## Overview
This migration transforms the system from a simple voucher system to a comprehensive multi-organization platform with configurable voucher types and enhanced user management.

## How to Apply Migration

### Step 1: Backup Current Database
```bash
pg_dump -U therapy_user -d therapy_system > backup_before_v2.sql
```

### Step 2: Apply Structure Migration
```bash
psql -U therapy_user -d therapy_system -f migration_v2.sql
```

### Step 3: Migrate Existing Data
```bash
psql -U therapy_user -d therapy_system -f migrate_existing_data.sql
```

## New Database Structure

### 1. **Organizations Table** (NEW)
Stores company/organization information
```sql
organizations
├── id (PRIMARY KEY)
├── name (company name)
├── slug (unique URL identifier)
├── address
├── phone
├── email
├── tax_id
├── logo_url
├── is_active
├── created_at
└── updated_at
```

### 2. **Users Table** (ENHANCED)
Added organization relationship and new fields
```sql
users (enhanced)
├── [existing fields...]
├── organization_id (FK → organizations) -- NEW
├── is_organization_owner (boolean) -- NEW
├── approved_at -- NEW
├── approved_by (FK → users) -- NEW
├── last_login -- NEW
├── phone -- NEW
└── updated_at -- NEW

Roles now include:
- admin (system admin)
- organization_owner (can manage organization)
- therapist
- client
- staff
```

### 3. **Voucher Types Table** (NEW)
Configurable voucher templates
```sql
voucher_types
├── id (PRIMARY KEY)
├── organization_id (FK → organizations)
├── name (e.g., "Premium Monthly Pass")
├── session_name (e.g., "Therapy Session")
├── description
├── total_sessions (number of regular sessions)
├── backup_sessions (number of spare sessions)
├── session_duration_minutes
├── max_clients_per_session (1 for individual, >1 for group)
├── frequency (daily/weekly/biweekly/custom)
├── custom_days (array for custom frequency)
├── price
├── validity_days
├── booking_rules (JSON with time slots per day)
├── is_active
├── deactivated_at
├── created_at
└── updated_at

Example booking_rules:
{
  "monday": {"enabled": true, "start_time": "08:00", "end_time": "20:00"},
  "tuesday": {"enabled": true, "start_time": "08:00", "end_time": "20:00"},
  "friday": {"enabled": true, "start_time": "12:00", "end_time": "15:00"},
  "saturday": {"enabled": false},
  "sunday": {"enabled": false}
}
```

### 4. **Vouchers Table** (ENHANCED)
Links to voucher types and adds payment tracking
```sql
vouchers (enhanced)
├── [existing fields...]
├── voucher_type_id (FK → voucher_types) -- NEW
├── organization_id (FK → organizations) -- NEW
├── payment_method -- NEW
├── payment_status -- NEW
├── payment_amount -- NEW
├── payment_date -- NEW
├── invoice_number -- NEW
├── notes -- NEW
└── status (pending/active/expired/cancelled/completed) -- NEW
```

### 5. **Audit Logs Table** (NEW)
Tracks all system changes
```sql
audit_logs
├── id (PRIMARY KEY)
├── user_id (FK → users)
├── organization_id (FK → organizations)
├── action (CREATE/UPDATE/DELETE/etc)
├── entity_type (user/voucher/organization/etc)
├── entity_id
├── old_values (JSON)
├── new_values (JSON)
├── ip_address
├── user_agent
└── created_at
```

### 6. **Permissions Table** (NEW)
Fine-grained permission control
```sql
permissions
├── id (PRIMARY KEY)
├── user_id (FK → users)
├── organization_id (FK → organizations)
├── permission (manage_users/manage_vouchers/etc)
├── granted_by (FK → users)
└── granted_at
```

### 7. **Payment Transactions Table** (NEW)
Payment history and tracking
```sql
payment_transactions
├── id (PRIMARY KEY)
├── voucher_id (FK → vouchers)
├── organization_id (FK → organizations)
├── client_id (FK → users)
├── amount
├── currency
├── payment_method
├── payment_gateway
├── gateway_transaction_id
├── status
├── gateway_response (JSON)
├── created_at
└── completed_at
```

## Key Features Added

### 1. Multi-Organization Support
- Each organization can have its own users, voucher types, and settings
- Organization owners can manage their own organization
- System admin can manage all organizations

### 2. Configurable Voucher Types
- Define templates for different types of vouchers
- Set number of sessions, backup sessions, duration
- Configure booking time slots per day of week
- Support for individual and group sessions
- Different frequency options (daily, weekly, biweekly, custom)

### 3. Enhanced User Management
- Organization owners can add/remove users from their organization
- User approval workflow
- Track last login and user activity
- Fine-grained permissions system

### 4. Audit Trail
- All changes are logged in audit_logs table
- Track who changed what and when
- Store old and new values for compliance

### 5. Payment Integration Ready
- Payment transaction tracking
- Invoice number generation
- Support for multiple payment methods
- Payment status tracking

## API Changes Required

### New Endpoints Needed:

#### Admin Endpoints
```
GET    /api/admin/users              - List all users
POST   /api/admin/users              - Create user
PUT    /api/admin/users/:id          - Update user
DELETE /api/admin/users/:id          - Delete user
PUT    /api/admin/users/:id/password - Change password
POST   /api/admin/users/:id/approve  - Approve user

GET    /api/admin/organizations      - List organizations
POST   /api/admin/organizations      - Create organization
PUT    /api/admin/organizations/:id  - Update organization
DELETE /api/admin/organizations/:id  - Delete organization
```

#### Organization Owner Endpoints
```
GET    /api/organizations/:id/users           - List organization users
POST   /api/organizations/:id/users           - Add user to organization
DELETE /api/organizations/:id/users/:user_id  - Remove user

GET    /api/organizations/:id/voucher-types   - List voucher types
POST   /api/organizations/:id/voucher-types   - Create voucher type
PUT    /api/organizations/:id/voucher-types/:id - Update voucher type
DELETE /api/organizations/:id/voucher-types/:id - Delete voucher type
```

#### Client Endpoints
```
GET    /api/voucher-types/available  - List available voucher types
POST   /api/vouchers/purchase        - Purchase voucher
GET    /api/vouchers/my              - List my vouchers
```

## Rollback Plan

If you need to rollback:

```bash
# Restore from backup
psql -U therapy_user -d therapy_system < backup_before_v2.sql
```

## Testing After Migration

Run these queries to verify migration success:

```sql
-- Check organizations
SELECT COUNT(*) as org_count FROM organizations;

-- Check users have organizations
SELECT COUNT(*) as users_without_org FROM users WHERE organization_id IS NULL;

-- Check voucher types
SELECT COUNT(*) as voucher_type_count FROM voucher_types;

-- Check audit log
SELECT * FROM audit_logs WHERE action = 'migration' ORDER BY created_at DESC LIMIT 1;

-- Verify constraints
SELECT conname, contype, conrelid::regclass 
FROM pg_constraint 
WHERE connamespace = 'public'::regnamespace 
AND conrelid::regclass::text LIKE '%organizations%';
```

## Notes for Production

1. **Schedule downtime** - This migration alters existing tables
2. **Test in staging first** - Run full migration on a copy of production
3. **Backup is critical** - Ensure backup is verified before starting
4. **Monitor after migration** - Check application logs for any issues
5. **Update environment variables** - May need to update connection strings or configs

## Data That Will Be Created

### Default Organization
- Name: "Default Organization"
- Slug: "default-org"
- All existing users will be assigned to this organization

### Default Voucher Types
1. **Standard Individual Therapy**
   - 10 sessions + 2 backup
   - 60 minutes per session
   - Weekly frequency
   - Price: $399.99

2. **Group Therapy Package**
   - 8 sessions + 2 backup
   - 90 minutes per session
   - Up to 8 participants
   - Weekly frequency
   - Price: $199.99

3. **Intensive Daily Sessions**
   - 20 sessions + 4 backup
   - 45 minutes per session
   - Daily frequency
   - Price: $799.99

## Contact for Issues

If you encounter any issues during migration:
1. Check the error logs in PostgreSQL
2. Verify all foreign key relationships
3. Ensure therapy_user has proper permissions
4. Contact the development team with the error message