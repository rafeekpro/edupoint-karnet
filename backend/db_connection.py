import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Optional, List, Dict, Any
from models import User, UserRole
import bcrypt

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://therapy_user:therapy_password@postgres:5432/therapy_system"
)

class PostgresDatabase:
    def __init__(self):
        self.connection = None
        self.connect()
    
    def connect(self):
        try:
            self.connection = psycopg2.connect(DATABASE_URL)
            print(f"Connected to database successfully")
        except Exception as e:
            print(f"Failed to connect to database: {e}")
            raise
    
    def get_connection(self):
        if not self.connection or self.connection.closed:
            self.connect()
        return self.connection
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        conn = self.get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT id, email, name, role, password_hash FROM users WHERE email = %s",
                (email,)
            )
            row = cur.fetchone()
            if row:
                return User(
                    id=str(row['id']),
                    email=row['email'],
                    name=row['name'],
                    role=UserRole(row['role']),
                    password_hash=row['password_hash']
                )
            return None
    
    def get_user_by_id(self, user_id: str) -> Optional[User]:
        conn = self.get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT id, email, name, role, password_hash FROM users WHERE id = %s",
                (int(user_id),)
            )
            row = cur.fetchone()
            if row:
                return User(
                    id=str(row['id']),
                    email=row['email'],
                    name=row['name'],
                    role=UserRole(row['role']),
                    password_hash=row['password_hash']
                )
            return None
    
    @property
    def users(self):
        """Compatibility layer for existing code that uses db.users"""
        class UserDict:
            def __init__(self, db):
                self.db = db
            
            def get(self, user_id: str) -> Optional[User]:
                return self.db.get_user_by_id(user_id)
            
            def values(self) -> List[User]:
                conn = self.db.get_connection()
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("SELECT id, email, name, role, password_hash FROM users")
                    rows = cur.fetchall()
                    return [
                        User(
                            id=str(row['id']),
                            email=row['email'],
                            name=row['name'],
                            role=UserRole(row['role']),
                            password_hash=row['password_hash']
                        )
                        for row in rows
                    ]
        
        return UserDict(self)
    
    @property
    def therapy_classes(self):
        """Compatibility layer for existing code"""
        class TherapyClassDict:
            def __init__(self, db):
                self.db = db
            
            def get(self, class_id: str) -> Optional[Dict[str, Any]]:
                conn = self.db.get_connection()
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(
                        "SELECT * FROM therapy_classes WHERE id = %s",
                        (int(class_id),)
                    )
                    return cur.fetchone()
            
            def values(self) -> List[Dict[str, Any]]:
                conn = self.db.get_connection()
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("SELECT * FROM therapy_classes")
                    return cur.fetchall()
        
        return TherapyClassDict(self)
    
    @property
    def vouchers(self):
        """Compatibility layer for existing code"""
        class VoucherDict:
            def __init__(self, db):
                self.db = db
            
            def get(self, voucher_id: str) -> Optional[Dict[str, Any]]:
                conn = self.db.get_connection()
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(
                        "SELECT * FROM vouchers WHERE id = %s",
                        (int(voucher_id),)
                    )
                    return cur.fetchone()
            
            def values(self) -> List[Dict[str, Any]]:
                conn = self.db.get_connection()
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("SELECT * FROM vouchers")
                    return cur.fetchall()
        
        return VoucherDict(self)
    
    @property
    def reservations(self):
        """Compatibility layer for existing code"""
        class ReservationDict:
            def __init__(self, db):
                self.db = db
            
            def get(self, reservation_id: str) -> Optional[Dict[str, Any]]:
                conn = self.db.get_connection()
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(
                        "SELECT * FROM reservations WHERE id = %s",
                        (int(reservation_id),)
                    )
                    return cur.fetchone()
            
            def values(self) -> List[Dict[str, Any]]:
                conn = self.db.get_connection()
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("SELECT * FROM reservations")
                    return cur.fetchall()
        
        return ReservationDict(self)
    
    @property
    def sessions(self):
        """Compatibility layer for existing code"""
        class SessionDict:
            def __init__(self, db):
                self.db = db
            
            def get(self, session_id: str) -> Optional[Dict[str, Any]]:
                conn = self.db.get_connection()
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(
                        "SELECT * FROM sessions WHERE id = %s",
                        (int(session_id),)
                    )
                    return cur.fetchone()
            
            def values(self) -> List[Dict[str, Any]]:
                conn = self.db.get_connection()
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("SELECT * FROM sessions")
                    return cur.fetchall()
        
        return SessionDict(self)
    
    # Stub methods for compatibility
    def get_voucher_code_by_code(self, code: str) -> Optional[Dict[str, Any]]:
        conn = self.get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT * FROM voucher_codes WHERE code = %s",
                (code,)
            )
            return cur.fetchone()
    
    def create_voucher(self, regular_codes: int = 10, backup_codes: int = 2):
        # Stub for compatibility
        return {"id": "1", "codes": []}
    
    def create_reservation(self, voucher_code, therapy_class, client_id, start_date):
        # Stub for compatibility
        return {"id": "1", "sessions": []}
    
    def get_user_reservations(self, user_id: str) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT * FROM reservations WHERE client_id = %s",
                (int(user_id),)
            )
            return cur.fetchall()
    
    def get_therapist_sessions(self, therapist_id: str) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT s.* FROM sessions s
                JOIN reservations r ON s.reservation_id = r.id
                JOIN therapy_classes tc ON r.therapy_class_id = tc.id
                WHERE tc.therapist_id = %s
                ORDER BY s.scheduled_date, s.scheduled_time
            """, (int(therapist_id),))
            return cur.fetchall()

# Global database instance
db = PostgresDatabase()