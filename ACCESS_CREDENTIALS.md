# 🔐 Access Credentials - VouchersKit System

## 📊 Database Access

### Production Database
- **Host:** `postgres.local.pro4.es` (10.0.0.4)
- **Port:** `5432`
- **Database:** `voucherskit`
- **Username:** `voucherskit`
- **Password:** `VouchersKit2024Prod`
- **Connection String:** `postgresql://voucherskit:VouchersKit2024Prod@postgres.local.pro4.es:5432/voucherskit`

**Note:** VPN connection required to access the database (network 10.0.0.x)

### Connection Script
```bash
./connect_production_db.sh        # Interactive session
./connect_production_db.sh stats  # Show statistics
./connect_production_db.sh backup # Create backup
```

---

## 👥 Demo User Accounts

All passwords have been reset and are active as of: **2024-08-17 20:48:20**

### 1. Super Admin
- **Email:** `admin@voucherskit.com`
- **Password:** `Admin123!`
- **Role:** `admin`
- **Permissions:** Full system access, all operations

### 2. Organization Owner
- **Email:** `owner@voucherskit.com`
- **Password:** `Owner123!`
- **Role:** `organization_owner`
- **Permissions:** Manage organization, employees, view reports

### 3. Therapist
- **Email:** `therapist@voucherskit.com`
- **Password:** `Therapist123!`
- **Role:** `therapist`
- **Permissions:** Manage sessions, view assigned clients

### 4. Staff Member
- **Email:** `staff@voucherskit.com`
- **Password:** `Staff123!`
- **Role:** `staff`
- **Permissions:** Administrative tasks, support operations

### 5. Client
- **Email:** `client@voucherskit.com`
- **Password:** `Client123!`
- **Role:** `client`
- **Permissions:** View and use vouchers, book sessions

---

## 🔑 API Access

### Authentication Endpoint
- **URL:** `POST /token`
- **Content-Type:** `application/x-www-form-urlencoded`

### Example Login Request
```bash
curl -X POST "https://api.voucherskit.com/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@voucherskit.com&password=Admin123!"
```

### Response Format
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Using the Token
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  https://api.voucherskit.com/users/me
```

---

## 🐳 Docker Registry

### GitHub Container Registry
- **Registry:** `ghcr.io`
- **Owner:** `rafeekpro`
- **Repository:** `edupoint-karnet`

### Images
- Backend: `ghcr.io/rafeekpro/edupoint-karnet/backend:latest`
- Frontend: `ghcr.io/rafeekpro/edupoint-karnet/frontend:latest`

---

## ☸️ Kubernetes Access

### Namespace
- **Production:** `voucherskit-prod`

### Services
- Backend: `voucherskit-backend`
- Frontend: `voucherskit-frontend`

---

## 🔒 Security Notes

1. **VPN Required:** Database is only accessible through VPN (10.0.0.x network)
2. **Change in Production:** These are demo credentials - change them in production!
3. **JWT Secret:** Update `JWT_SECRET_KEY` in production environment
4. **Password Policy:** Use strong passwords with minimum 8 characters, including uppercase, lowercase, numbers, and special characters

---

## 📝 Quick Test Commands

### Test Database Connection
```bash
PGPASSWORD='VouchersKit2024Prod' psql -h postgres.local.pro4.es -U voucherskit -d voucherskit -c "SELECT current_user;"
```

### Test API Login
```bash
# Admin login
curl -X POST "http://localhost:8000/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@voucherskit.com&password=Admin123!"

# Client login  
curl -X POST "http://localhost:8000/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=client@voucherskit.com&password=Client123!"
```

### Check User Roles
```sql
SELECT email, role FROM users WHERE email LIKE '%@voucherskit.com';
```

---

## 📄 Related Files

- `/demo_users.txt` - Simple list of demo users
- `/backend/scripts/reset_all_demo_passwords.sql` - SQL script to reset passwords
- `/backend/scripts/reset_demo_passwords.py` - Python script for password reset
- `/connect_production_db.sh` - Database connection helper script
- `/.env.production` - Production environment variables (update password there!)

---

Last Updated: 2024-08-17 20:48:20 UTC