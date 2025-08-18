#!/usr/bin/env python3
import psycopg2
from passlib.context import CryptContext

# Password context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Connect to database
conn = psycopg2.connect(
    host='postgres.local.pro4.es',
    port=5432,
    database='voucherskit',
    user='voucherskit',
    password='VouchersKit2024Prod'
)

cursor = conn.cursor()

# Test passwords
test_cases = [
    ('admin@voucherskit.com', 'Admin123!'),
    ('client@voucherskit.com', 'Client123!'),
]

for email, password in test_cases:
    # Get hash from database
    cursor.execute("SELECT password_hash FROM users WHERE email = %s", (email,))
    result = cursor.fetchone()
    
    if result:
        stored_hash = result[0]
        print(f"\nTesting {email}")
        print(f"Password: {password}")
        print(f"Hash from DB: {stored_hash[:20]}...")
        
        # Verify password
        is_valid = pwd_context.verify(password, stored_hash)
        print(f"Password valid: {is_valid}")
        
        if not is_valid:
            # Generate new hash for comparison
            new_hash = pwd_context.hash(password)
            print(f"New hash would be: {new_hash[:20]}...")
    else:
        print(f"User {email} not found")

conn.close()