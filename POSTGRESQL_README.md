# PostgreSQL Configuration for Therapy System

## Overview
The therapy system has been configured to use PostgreSQL instead of MySQL. This document provides instructions for setting up and running the system with PostgreSQL.

## Prerequisites
- Docker and Docker Compose installed
- PostgreSQL client (optional, for manual database access)

## Configuration Changes

### 1. Docker Compose
The `docker-compose.yml` file has been updated to use PostgreSQL:
- PostgreSQL 15 Alpine image
- Database name: `therapy_system`
- User: `therapy_user`
- Password: `therapy_password`
- Port: `5432`

### 2. Backend Configuration
- Updated `DATABASE_URL` to use PostgreSQL connection string
- Changed from `pymysql` to `psycopg2-binary` driver
- Updated SQLAlchemy configuration in `database_sqlalchemy/config.py`

### 3. Database Schema
The database schema has been converted from MySQL to PostgreSQL:
- Changed UUID generation from `UUID()` to `uuid_generate_v4()`
- Converted ENUM types to PostgreSQL native ENUMs
- Updated triggers for `updated_at` timestamps
- Converted stored procedures to PostgreSQL functions
- Updated date/time functions to PostgreSQL syntax

## Running the System

### Start with Docker Compose
```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### Stop the System
```bash
docker-compose down

# To also remove volumes (database data)
docker-compose down -v
```

## Database Access

### Using Docker
```bash
# Access PostgreSQL CLI
docker exec -it therapy-postgres psql -U therapy_user -d therapy_system

# Execute SQL file
docker exec -i therapy-postgres psql -U therapy_user -d therapy_system < your_file.sql
```

### Direct Connection
```bash
psql -h localhost -p 5432 -U therapy_user -d therapy_system
```

## Database Schema

### Tables
1. **users** - Stores admin, therapist, and client accounts
2. **therapy_classes** - Therapy class definitions
3. **vouchers** - Client vouchers
4. **voucher_codes** - Individual voucher codes (regular and backup)
5. **reservations** - Client reservations for therapy classes
6. **sessions** - Individual therapy sessions

### ENUM Types
- `user_role`: 'admin', 'therapist', 'client'
- `code_status`: 'active', 'used', 'expired'
- `session_status`: 'scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show'

### Key Functions
- `update_updated_at_column()` - Trigger function to update timestamps
- `generate_weekly_sessions()` - Generate recurring sessions for a reservation

## Troubleshooting

### Connection Issues
If you can't connect to the database:
1. Check if PostgreSQL container is running: `docker ps`
2. Check logs: `docker logs therapy-postgres`
3. Verify connection parameters in `docker-compose.yml`

### Permission Issues
If you get permission errors:
1. Make sure the PostgreSQL user has proper permissions
2. Check file ownership for init scripts

### Migration from MySQL
If migrating from an existing MySQL database:
1. Export data from MySQL using `mysqldump`
2. Convert the dump file syntax from MySQL to PostgreSQL
3. Import into PostgreSQL using `psql`

## Performance Tuning

For production use, consider:
1. Adjusting PostgreSQL configuration in `postgresql.conf`
2. Adding appropriate indexes based on query patterns
3. Setting up connection pooling
4. Configuring proper backup strategies

## Backup and Restore

### Backup
```bash
# Backup database
docker exec therapy-postgres pg_dump -U therapy_user therapy_system > backup.sql

# Backup with compression
docker exec therapy-postgres pg_dump -U therapy_user -Fc therapy_system > backup.dump
```

### Restore
```bash
# Restore from SQL file
docker exec -i therapy-postgres psql -U therapy_user therapy_system < backup.sql

# Restore from compressed dump
docker exec -i therapy-postgres pg_restore -U therapy_user -d therapy_system < backup.dump
```