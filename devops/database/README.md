# Database Setup Instructions

## Admin Connection Details
- Host: 10.0.0.4
- User: postgresql
- Password: GxYJsbzz87.Wg2@

## Steps to Create Database

1. **Connect to PostgreSQL as admin**:
```bash
psql -h 10.0.0.4 -U postgresql -W
# Enter password when prompted: GxYJsbzz87.Wg2@
```

2. **Run the creation script**:
```bash
psql -h 10.0.0.4 -U postgresql -W -f create_database.sql
```

Or manually in psql:
```sql
\i create_database.sql
```

## Important Notes

1. **Change the password!** 
   - Edit line 10 in `create_database.sql`
   - Replace `'your_secure_password_here'` with a strong password
   - Save this password for the Azure DevOps variable group

2. **Database Details Created**:
   - Database name: `therapy_system_prod`
   - Username: `therapy_user`
   - Password: (the one you set)

3. **Update Azure DevOps Variables**:
   ```yaml
   DB_HOST: postgres.local.pro4.es
   DB_PORT: 5432
   DB_NAME: therapy_system_prod
   DB_USER_PROD: therapy_user
   DB_PASSWORD_PROD: <your-password-here>
   ```

4. **Test Connection**:
   ```bash
   psql -h postgres.local.pro4.es -U therapy_user -d therapy_system_prod -W
   ```

## Troubleshooting

If you need to recreate everything:
```sql
-- Connect as admin
DROP DATABASE IF EXISTS therapy_system_prod;
DROP USER IF EXISTS therapy_user;

-- Then run create_database.sql again
```

## Security Notes

1. Never commit passwords to git
2. Use strong passwords in production
3. Consider restricting connections by IP
4. Enable SSL for database connections if possible