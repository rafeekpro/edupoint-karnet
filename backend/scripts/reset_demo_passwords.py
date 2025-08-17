#!/usr/bin/env python3
"""
Script to reset passwords for demo users
"""

import sys
import os
import psycopg2
from passlib.context import CryptContext
from datetime import datetime

# Add parent directory to path to import auth module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Demo users configuration
DEMO_USERS = [
    {
        "email": "admin@voucherskit.com",
        "password": "Admin123!",
        "name": "Administrator",
        "role": "admin"
    },
    {
        "email": "therapist@voucherskit.com", 
        "password": "Therapist123!",
        "name": "Demo Therapist",
        "role": "therapist"
    },
    {
        "email": "client@voucherskit.com",
        "password": "Client123!",
        "name": "Demo Client",
        "role": "client"
    }
]

def get_database_connection():
    """Get database connection from environment variables or .env file"""
    
    # Try to load from .env.production file if it exists
    env_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', '.env.production')
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value
    
    # Get database connection parameters
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')
    db_name = os.getenv('DB_NAME', 'voucherskit')
    db_user = os.getenv('DB_USER', 'voucherskit')
    db_password = os.getenv('DB_PASSWORD', '')
    
    print(f"Connecting to database: {db_name} at {db_host}:{db_port}")
    
    try:
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            database=db_name,
            user=db_user,
            password=db_password
        )
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def reset_user_passwords(conn):
    """Reset passwords for demo users"""
    cursor = conn.cursor()
    results = []
    
    for user in DEMO_USERS:
        email = user['email']
        password = user['password']
        name = user['name']
        role = user['role']
        
        # Hash the password
        password_hash = pwd_context.hash(password)
        
        try:
            # Check if user exists
            cursor.execute("SELECT id, email, name, role FROM users WHERE email = %s", (email,))
            existing_user = cursor.fetchone()
            
            if existing_user:
                # Update existing user's password
                cursor.execute(
                    "UPDATE users SET password_hash = %s, updated_at = %s WHERE email = %s",
                    (password_hash, datetime.now(), email)
                )
                print(f"✅ Updated password for existing user: {email}")
                results.append(f"Updated: {email} / {password}")
            else:
                # Create new user
                cursor.execute(
                    """INSERT INTO users (email, password_hash, name, role, created_at, updated_at) 
                       VALUES (%s, %s, %s, %s, %s, %s)""",
                    (email, password_hash, name, role, datetime.now(), datetime.now())
                )
                print(f"✅ Created new user: {email}")
                results.append(f"Created: {email} / {password}")
            
            conn.commit()
            
        except Exception as e:
            print(f"❌ Error processing user {email}: {e}")
            conn.rollback()
    
    return results

def write_demo_users_file(results):
    """Write demo users credentials to file"""
    output_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'demo_users.txt')
    
    with open(output_file, 'w') as f:
        f.write("=" * 60 + "\n")
        f.write("VOUCHERSKIT DEMO USERS\n")
        f.write("=" * 60 + "\n\n")
        f.write("These are the demo user credentials for testing:\n\n")
        
        for user in DEMO_USERS:
            f.write(f"Role: {user['role'].upper()}\n")
            f.write(f"Email: {user['email']}\n")
            f.write(f"Password: {user['password']}\n")
            f.write(f"Name: {user['name']}\n")
            f.write("-" * 40 + "\n\n")
        
        f.write("\nNOTE: Please change these passwords in production!\n")
        f.write("These credentials are for development/demo purposes only.\n\n")
        
        f.write("Login endpoint: POST /token\n")
        f.write("Body format: {\"username\": \"email\", \"password\": \"password\"}\n\n")
        
        f.write("Status:\n")
        for result in results:
            f.write(f"  - {result}\n")
        
        f.write("\n" + "=" * 60 + "\n")
        f.write(f"Generated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("=" * 60 + "\n")
    
    print(f"\n✅ Demo users file created: {output_file}")

def main():
    """Main function"""
    print("=" * 60)
    print("RESETTING DEMO USER PASSWORDS")
    print("=" * 60)
    
    # Connect to database
    conn = get_database_connection()
    if not conn:
        print("❌ Failed to connect to database")
        sys.exit(1)
    
    try:
        # Reset passwords
        results = reset_user_passwords(conn)
        
        # Write demo users file
        write_demo_users_file(results)
        
        print("\n✅ Demo user passwords have been reset successfully!")
        print("\nYou can now login with:")
        for user in DEMO_USERS:
            print(f"  - {user['email']} / {user['password']} ({user['role']})")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    main()