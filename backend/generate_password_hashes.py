#!/usr/bin/env python3
"""Generate password hashes for test users"""

import bcrypt

passwords = {
    'admin@system.com': 'admin123',
    'owner@company.com': 'owner123',
    'employee@company.com': 'employee123',
    'client@example.com': 'client123'
}

print("-- Password hashes for test users")
for email, password in passwords.items():
    # Generate hash
    salt = bcrypt.gensalt()
    hash = bcrypt.hashpw(password.encode('utf-8'), salt)
    print(f"-- {email}: {password}")
    print(f"-- Hash: {hash.decode('utf-8')}")
    print()