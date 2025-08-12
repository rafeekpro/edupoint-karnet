import os
import psycopg2
from psycopg2.extras import RealDictCursor, Json, register_default_json
import json
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta, date
from decimal import Decimal
from urllib.parse import quote_plus

class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        elif isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)
import bcrypt
import secrets
import string
from models_v2 import (
    UserRole, VoucherStatus, PaymentStatus, Frequency,
    Organization, VoucherType, UserResponse
)

# Try to use individual env vars first, fall back to DATABASE_URL
DB_HOST = os.getenv("DB_HOST", "postgres")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "therapy_system")
DB_USER = os.getenv("DB_USER", "therapy_user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "therapy_password")

# Build DATABASE_URL from components if not provided directly
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # URL-encode password to handle special characters
    encoded_password = quote_plus(DB_PASSWORD)
    DATABASE_URL = f"postgresql://{DB_USER}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

class DatabaseV2:
    def __init__(self):
        self.connection = None
        # Register custom JSON encoder for datetime serialization
        register_default_json(loads=json.loads, globally=False)
        self.connect()
    
    def connect(self):
        try:
            # Alternative connection method using individual parameters
            if all([DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD]) and not os.getenv("DATABASE_URL"):
                self.connection = psycopg2.connect(
                    host=DB_HOST,
                    port=DB_PORT,
                    database=DB_NAME,
                    user=DB_USER,
                    password=DB_PASSWORD
                )
                print(f"Connected to database successfully using individual parameters")
            else:
                self.connection = psycopg2.connect(DATABASE_URL)
                print(f"Connected to database successfully using DATABASE_URL")
        except Exception as e:
            print(f"Failed to connect to database: {e}")
            print(f"DB_HOST: {DB_HOST}, DB_PORT: {DB_PORT}, DB_NAME: {DB_NAME}, DB_USER: {DB_USER}")
            raise
    
    def get_connection(self):
        if not self.connection or self.connection.closed:
            self.connect()
        return self.connection
    
    def commit(self):
        self.get_connection().commit()
    
    def rollback(self):
        self.get_connection().rollback()
    
    # ============================================
    # ORGANIZATION METHODS
    # ============================================
    def create_organization(self, name: str, owner_email: str, owner_name: str, 
                          owner_password: str, **kwargs) -> Dict[str, Any]:
        """Create organization with owner"""
        conn = self.get_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Generate slug
                cur.execute("SELECT generate_org_slug(%s) as slug", (name,))
                slug = cur.fetchone()['slug']
                
                # Create organization
                cur.execute("""
                    INSERT INTO organizations (name, slug, address, phone, email, tax_id, logo_url)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING *
                """, (name, slug, kwargs.get('address'), kwargs.get('phone'), 
                     kwargs.get('email'), kwargs.get('tax_id'), kwargs.get('logo_url')))
                org = cur.fetchone()
                
                # Create owner user
                password_hash = bcrypt.hashpw(owner_password.encode(), bcrypt.gensalt()).decode()
                cur.execute("""
                    INSERT INTO users (email, name, password_hash, role, organization_id, 
                                     is_organization_owner, is_active, approved_by, approved_at)
                    VALUES (%s, %s, %s, %s, %s, true, true, %s, NOW())
                    RETURNING id, email, name, role, organization_id, is_organization_owner,
                             is_active, approved_by, approved_at, last_login, created_at, updated_at
                """, (owner_email, owner_name, password_hash, UserRole.ORGANIZATION_OWNER, org['id'], 1))
                owner = cur.fetchone()
                
                # Grant permissions
                cur.execute("""
                    INSERT INTO permissions (user_id, organization_id, permission)
                    VALUES (%s, %s, 'manage_organization'),
                           (%s, %s, 'manage_users'),
                           (%s, %s, 'manage_voucher_types')
                """, (owner['id'], org['id'], owner['id'], org['id'], owner['id'], org['id']))
                
                # Add audit log
                self._add_audit_log(cur, owner['id'], org['id'], 'CREATE', 'organization', 
                                  org['id'], None, org)
                
                conn.commit()
                org['owner'] = owner
                return org
        except Exception as e:
            conn.rollback()
            raise e
    
    def get_organization(self, org_id: int) -> Optional[Dict[str, Any]]:
        conn = self.get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM organizations WHERE id = %s", (org_id,))
            return cur.fetchone()
    
    def list_organizations(self, is_active: Optional[bool] = None) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            query = "SELECT * FROM organizations"
            params = []
            if is_active is not None:
                query += " WHERE is_active = %s"
                params.append(is_active)
            query += " ORDER BY name"
            cur.execute(query, params)
            return cur.fetchall()
    
    def update_organization(self, org_id: int, user_id: int, **kwargs) -> Dict[str, Any]:
        conn = self.get_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Get old values for audit
                cur.execute("SELECT * FROM organizations WHERE id = %s", (org_id,))
                old_org = cur.fetchone()
                
                # Build update query
                updates = []
                values = []
                for key, value in kwargs.items():
                    if key in ['name', 'address', 'phone', 'email', 'tax_id', 'logo_url', 'is_active']:
                        updates.append(f"{key} = %s")
                        values.append(value)
                
                if updates:
                    values.append(org_id)
                    cur.execute(f"""
                        UPDATE organizations 
                        SET {', '.join(updates)}, updated_at = NOW()
                        WHERE id = %s
                        RETURNING *
                    """, values)
                    new_org = cur.fetchone()
                    
                    # Add audit log
                    self._add_audit_log(cur, user_id, org_id, 'UPDATE', 'organization', 
                                      org_id, old_org, new_org)
                    
                    conn.commit()
                    return new_org
                return old_org
        except Exception as e:
            conn.rollback()
            raise e
    
    # ============================================
    # USER METHODS
    # ============================================
    def create_user(self, email: str, name: str, password: str, role: str, 
                   organization_id: int, created_by: int = None, **kwargs) -> Dict[str, Any]:
        """Create a new user"""
        conn = self.get_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Hash password
                password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
                
                # Create user
                cur.execute("""
                    INSERT INTO users (email, name, password_hash, role, organization_id, 
                                     phone, is_active, is_organization_owner, approved_by, approved_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id, email, name, role, organization_id, phone, 
                             is_active, is_organization_owner, approved_by, approved_at,
                             last_login, created_at, updated_at
                """, (email, name, password_hash, role, organization_id, 
                     kwargs.get('phone'), kwargs.get('is_active', True),
                     kwargs.get('is_organization_owner', False),
                     created_by, datetime.now() if created_by else None))
                user = cur.fetchone()
                
                # Add audit log
                self._add_audit_log(cur, created_by, organization_id, 'CREATE', 'user', 
                                  user['id'], None, user)
                
                conn.commit()
                return user
        except Exception as e:
            conn.rollback()
            raise e
    
    def get_user(self, user_id: int) -> Optional[Dict[str, Any]]:
        conn = self.get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT u.*, o.name as organization_name
                FROM users u
                LEFT JOIN organizations o ON u.organization_id = o.id
                WHERE u.id = %s
            """, (user_id,))
            return cur.fetchone()
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        conn = self.get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT u.*, o.name as organization_name
                FROM users u
                LEFT JOIN organizations o ON u.organization_id = o.id
                WHERE u.email = %s
            """, (email,))
            return cur.fetchone()
    
    def list_users(self, organization_id: Optional[int] = None, 
                  role: Optional[str] = None, is_active: Optional[bool] = None) -> List[Dict[str, Any]]:
        """List users with filters"""
        conn = self.get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            query = """
                SELECT u.*, o.name as organization_name
                FROM users u
                LEFT JOIN organizations o ON u.organization_id = o.id
                WHERE 1=1
            """
            params = []
            
            if organization_id:
                query += " AND u.organization_id = %s"
                params.append(organization_id)
            if role:
                query += " AND u.role = %s"
                params.append(role)
            if is_active is not None:
                query += " AND u.is_active = %s"
                params.append(is_active)
            
            query += " ORDER BY u.name"
            cur.execute(query, params)
            return cur.fetchall()
    
    def update_user(self, user_id: int, updated_by: int, **kwargs) -> Dict[str, Any]:
        """Update user details"""
        conn = self.get_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Get old values
                cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
                old_user = cur.fetchone()
                
                # Build update query
                updates = []
                values = []
                for key, value in kwargs.items():
                    if key in ['email', 'name', 'phone', 'role', 'is_active', 
                             'organization_id', 'is_organization_owner']:
                        updates.append(f"{key} = %s")
                        values.append(value)
                
                if updates:
                    values.append(user_id)
                    cur.execute(f"""
                        UPDATE users 
                        SET {', '.join(updates)}, updated_at = NOW()
                        WHERE id = %s
                        RETURNING *
                    """, values)
                    new_user = cur.fetchone()
                    
                    # Add audit log
                    self._add_audit_log(cur, updated_by, old_user['organization_id'], 
                                      'UPDATE', 'user', user_id, old_user, new_user)
                    
                    conn.commit()
                    return new_user
                return old_user
        except Exception as e:
            conn.rollback()
            raise e
    
    def change_user_password(self, user_id: int, new_password: str, changed_by: int) -> bool:
        """Change user password"""
        conn = self.get_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Hash new password
                password_hash = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()
                
                # Update password
                cur.execute("""
                    UPDATE users 
                    SET password_hash = %s, updated_at = NOW()
                    WHERE id = %s
                    RETURNING organization_id
                """, (password_hash, user_id))
                result = cur.fetchone()
                
                if result:
                    # Add audit log
                    self._add_audit_log(cur, changed_by, result['organization_id'], 
                                      'CHANGE_PASSWORD', 'user', user_id, None, None)
                    conn.commit()
                    return True
                return False
        except Exception as e:
            conn.rollback()
            raise e
    
    def delete_user(self, user_id: int, deleted_by: int) -> bool:
        """Delete a user"""
        conn = self.get_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Get user info for audit
                cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
                user = cur.fetchone()
                
                if user:
                    # Delete user
                    cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
                    
                    # Add audit log
                    self._add_audit_log(cur, deleted_by, user['organization_id'], 
                                      'DELETE', 'user', user_id, user, None)
                    
                    conn.commit()
                    return True
                return False
        except Exception as e:
            conn.rollback()
            raise e
    
    def approve_user(self, user_id: int, approved_by: int) -> Dict[str, Any]:
        """Approve a pending user"""
        conn = self.get_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    UPDATE users 
                    SET is_active = true, approved_by = %s, approved_at = NOW(), updated_at = NOW()
                    WHERE id = %s
                    RETURNING *
                """, (approved_by, user_id))
                user = cur.fetchone()
                
                if user:
                    # Add audit log
                    self._add_audit_log(cur, approved_by, user['organization_id'], 
                                      'APPROVE', 'user', user_id, None, user)
                    conn.commit()
                return user
        except Exception as e:
            conn.rollback()
            raise e
    
    # ============================================
    # VOUCHER TYPE METHODS
    # ============================================
    def create_voucher_type(self, organization_id: int, created_by: int, 
                           **kwargs) -> Dict[str, Any]:
        """Create a new voucher type"""
        conn = self.get_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Convert booking_rules to JSON with custom encoder
                booking_rules = Json(kwargs['booking_rules'], dumps=lambda x: json.dumps(x, cls=DateTimeEncoder))
                
                cur.execute("""
                    INSERT INTO voucher_types (
                        organization_id, name, session_name, description,
                        total_sessions, backup_sessions, session_duration_minutes,
                        max_clients_per_session, frequency, custom_days,
                        price, validity_days, booking_rules, is_active
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING *
                """, (
                    organization_id, kwargs['name'], kwargs.get('session_name', 'Session'),
                    kwargs.get('description'), kwargs['total_sessions'], 
                    kwargs.get('backup_sessions', 0), kwargs['session_duration_minutes'],
                    kwargs.get('max_clients_per_session', 1), kwargs['frequency'],
                    kwargs.get('custom_days'), kwargs['price'], kwargs['validity_days'],
                    booking_rules, kwargs.get('is_active', True)
                ))
                voucher_type = cur.fetchone()
                
                # Add audit log
                self._add_audit_log(cur, created_by, organization_id, 'CREATE', 
                                  'voucher_type', voucher_type['id'], None, voucher_type)
                
                conn.commit()
                return voucher_type
        except Exception as e:
            conn.rollback()
            raise e
    
    def get_voucher_type(self, voucher_type_id: int) -> Optional[Dict[str, Any]]:
        conn = self.get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM voucher_types WHERE id = %s", (voucher_type_id,))
            return cur.fetchone()
    
    def list_voucher_types(self, organization_id: Optional[int] = None, 
                          is_active: Optional[bool] = None) -> List[Dict[str, Any]]:
        """List voucher types with filters"""
        conn = self.get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            query = "SELECT * FROM voucher_types WHERE 1=1"
            params = []
            
            if organization_id:
                query += " AND organization_id = %s"
                params.append(organization_id)
            if is_active is not None:
                query += " AND is_active = %s"
                params.append(is_active)
            
            query += " ORDER BY name"
            cur.execute(query, params)
            return cur.fetchall()
    
    def update_voucher_type(self, voucher_type_id: int, updated_by: int, 
                           **kwargs) -> Dict[str, Any]:
        """Update voucher type"""
        conn = self.get_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Get old values
                cur.execute("SELECT * FROM voucher_types WHERE id = %s", (voucher_type_id,))
                old_vt = cur.fetchone()
                
                # Build update query
                updates = []
                values = []
                for key, value in kwargs.items():
                    if key == 'booking_rules':
                        updates.append(f"{key} = %s")
                        values.append(Json(value, dumps=lambda x: json.dumps(x, cls=DateTimeEncoder)))
                    elif key in ['name', 'session_name', 'description', 'total_sessions',
                                'backup_sessions', 'session_duration_minutes',
                                'max_clients_per_session', 'frequency', 'custom_days',
                                'price', 'validity_days', 'is_active']:
                        updates.append(f"{key} = %s")
                        values.append(value)
                
                if updates:
                    values.append(voucher_type_id)
                    cur.execute(f"""
                        UPDATE voucher_types 
                        SET {', '.join(updates)}, updated_at = NOW()
                        WHERE id = %s
                        RETURNING *
                    """, values)
                    new_vt = cur.fetchone()
                    
                    # Add audit log
                    self._add_audit_log(cur, updated_by, old_vt['organization_id'], 
                                      'UPDATE', 'voucher_type', voucher_type_id, old_vt, new_vt)
                    
                    conn.commit()
                    return new_vt
                return old_vt
        except Exception as e:
            conn.rollback()
            raise e
    
    def deactivate_voucher_type(self, voucher_type_id: int, deactivated_by: int) -> Dict[str, Any]:
        """Deactivate a voucher type"""
        conn = self.get_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    UPDATE voucher_types 
                    SET is_active = false, deactivated_at = NOW(), updated_at = NOW()
                    WHERE id = %s
                    RETURNING *
                """, (voucher_type_id,))
                vt = cur.fetchone()
                
                if vt:
                    # Add audit log
                    self._add_audit_log(cur, deactivated_by, vt['organization_id'], 
                                      'DEACTIVATE', 'voucher_type', voucher_type_id, None, vt)
                    conn.commit()
                return vt
        except Exception as e:
            conn.rollback()
            raise e
    
    # ============================================
    # VOUCHER PURCHASE METHODS
    # ============================================
    def purchase_voucher(self, client_id: int, voucher_type_id: int, 
                        payment_method: str, **kwargs) -> Dict[str, Any]:
        """Purchase a voucher"""
        conn = self.get_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Get voucher type details
                cur.execute("SELECT * FROM voucher_types WHERE id = %s", (voucher_type_id,))
                vt = cur.fetchone()
                
                if not vt or not vt['is_active']:
                    raise ValueError("Voucher type not available")
                
                # Calculate validity
                valid_until = datetime.now() + timedelta(days=vt['validity_days'])
                
                # Generate invoice number
                invoice_number = self._generate_invoice_number(cur)
                
                # Create voucher
                cur.execute("""
                    INSERT INTO vouchers (
                        client_id, voucher_type_id, organization_id,
                        purchase_date, valid_until, total_sessions, used_sessions,
                        payment_method, payment_status, payment_amount, 
                        payment_date, invoice_number, status
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING *
                """, (
                    client_id, voucher_type_id, vt['organization_id'],
                    datetime.now(), valid_until, vt['total_sessions'], 0,
                    payment_method, PaymentStatus.COMPLETED, vt['price'],
                    datetime.now(), invoice_number, VoucherStatus.ACTIVE
                ))
                voucher = cur.fetchone()
                
                # Generate voucher codes
                codes = []
                for i in range(vt['total_sessions']):
                    code = self._generate_voucher_code(cur)
                    cur.execute("""
                        INSERT INTO voucher_codes (voucher_id, code, is_spare, is_used)
                        VALUES (%s, %s, false, false)
                        RETURNING *
                    """, (voucher['id'], code))
                    codes.append(cur.fetchone())
                
                # Generate backup codes
                for i in range(vt['backup_sessions']):
                    code = self._generate_voucher_code(cur)
                    cur.execute("""
                        INSERT INTO voucher_codes (voucher_id, code, is_spare, is_used)
                        VALUES (%s, %s, true, false)
                        RETURNING *
                    """, (voucher['id'], code))
                    codes.append(cur.fetchone())
                
                voucher['codes'] = codes
                
                # Add audit log
                self._add_audit_log(cur, client_id, vt['organization_id'], 
                                  'PURCHASE', 'voucher', voucher['id'], None, voucher)
                
                conn.commit()
                return voucher
        except Exception as e:
            conn.rollback()
            raise e
    
    def list_available_voucher_types(self) -> List[Dict[str, Any]]:
        """List all active voucher types available for purchase"""
        conn = self.get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT vt.*, o.name as organization_name
                FROM voucher_types vt
                JOIN organizations o ON vt.organization_id = o.id
                WHERE vt.is_active = true AND o.is_active = true
                ORDER BY o.name, vt.name
            """)
            return cur.fetchall()
    
    # ============================================
    # HELPER METHODS
    # ============================================
    def _add_audit_log(self, cur, user_id: Optional[int], organization_id: Optional[int],
                      action: str, entity_type: str, entity_id: Optional[int],
                      old_values: Optional[Dict], new_values: Optional[Dict]):
        """Add audit log entry"""
        cur.execute("""
            INSERT INTO audit_logs (user_id, organization_id, action, entity_type, 
                                  entity_id, old_values, new_values)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (user_id, organization_id, action, entity_type, entity_id,
             Json(old_values, dumps=lambda x: json.dumps(x, cls=DateTimeEncoder)) if old_values else None,
             Json(new_values, dumps=lambda x: json.dumps(x, cls=DateTimeEncoder)) if new_values else None))
    
    def _generate_voucher_code(self, cur) -> str:
        """Generate unique voucher code"""
        while True:
            code = 'VK-' + ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
            cur.execute("SELECT 1 FROM voucher_codes WHERE code = %s", (code,))
            if not cur.fetchone():
                return code
    
    def _generate_invoice_number(self, cur) -> str:
        """Generate invoice number"""
        year = datetime.now().year
        cur.execute("""
            SELECT COUNT(*) + 1 as next_num 
            FROM vouchers 
            WHERE EXTRACT(YEAR FROM purchase_date) = %s
        """, (year,))
        next_num = cur.fetchone()['next_num']
        return f"INV-{year}-{next_num:05d}"
    
    def check_permission(self, user_id: int, organization_id: int, permission: str) -> bool:
        """Check if user has permission"""
        conn = self.get_connection()
        with conn.cursor() as cur:
            cur.execute("""
                SELECT 1 FROM permissions 
                WHERE user_id = %s AND organization_id = %s 
                AND (permission = %s OR permission = 'all')
            """, (user_id, organization_id, permission))
            return cur.fetchone() is not None
    
    def get_user_permissions(self, user_id: int, organization_id: int) -> List[str]:
        """Get all permissions for user in organization"""
        conn = self.get_connection()
        with conn.cursor() as cur:
            cur.execute("""
                SELECT permission FROM permissions 
                WHERE user_id = %s AND organization_id = %s
            """, (user_id, organization_id))
            return [row[0] for row in cur.fetchall()]

# Global database instance
db_v2 = DatabaseV2()