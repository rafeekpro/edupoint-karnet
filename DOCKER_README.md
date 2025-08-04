# Docker Setup for Therapy System

## Overview

This project uses Docker Compose to orchestrate multiple services:
- **MySQL 8.0** - Database server
- **FastAPI Backend** - Python backend API
- **React Frontend** - React application
- **Nginx** - Reverse proxy server

## Prerequisites

- Docker Desktop installed and running
- Docker Compose v2.0+
- At least 4GB of available RAM for Docker

## Quick Start

1. Clone the repository and navigate to the project root
2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```
3. Start the system:
   ```bash
   ./start.sh
   ```

## Service URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Full Application (via Nginx)**: http://localhost
- **MySQL**: localhost:3306 (use MySQL client)

## Default Credentials

### Application Users
- **Admin**: admin@therapy.com / admin123
- **Therapist**: john@therapy.com / admin123
- **Client**: client@example.com / admin123

### Database
- **Root**: root / rootpassword
- **App User**: therapy_user / therapy_password

## Docker Commands

### Start all services
```bash
docker-compose up -d
```

### Stop all services
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Restart a service
```bash
docker-compose restart backend
```

### Execute commands in containers
```bash
# Access MySQL
docker exec -it therapy-mysql mysql -u therapy_user -ptherapy_password therapy_system

# Access backend shell
docker exec -it therapy-backend bash

# Run backend tests
docker exec therapy-backend pytest
```

## Database Management

### Connect to MySQL
```bash
mysql -h localhost -P 3306 -u therapy_user -ptherapy_password therapy_system
```

### Backup database
```bash
docker exec therapy-mysql mysqldump -u therapy_user -ptherapy_password therapy_system > backup.sql
```

### Restore database
```bash
docker exec -i therapy-mysql mysql -u therapy_user -ptherapy_password therapy_system < backup.sql
```

## Development

### Backend Development
The backend code is mounted as a volume, so changes are reflected immediately with auto-reload enabled.

### Frontend Development
The frontend code is also mounted as a volume with hot-reload enabled.

### Adding new Python packages
1. Add to `backend/requirements.txt`
2. Rebuild the backend service:
   ```bash
   docker-compose build backend
   docker-compose up -d backend
   ```

### Adding new npm packages
1. Add to `frontend/package.json`
2. Rebuild the frontend service:
   ```bash
   docker-compose build frontend
   docker-compose up -d frontend
   ```

## Testing

Run the complete test suite:
```bash
./test-system.sh
```

This will:
1. Test MySQL connectivity
2. Test API endpoints
3. Test authentication
4. Run backend unit tests
5. Run Playwright E2E tests

## Troubleshooting

### Services won't start
- Check if Docker is running
- Check if ports are already in use
- View logs: `docker-compose logs`

### Database connection errors
- Wait for MySQL to fully initialize (can take 30-60 seconds on first run)
- Check credentials in `.env` file
- Verify MySQL container is healthy: `docker-compose ps`

### Frontend can't connect to backend
- Check CORS settings in backend
- Verify `REACT_APP_API_URL` in `.env`
- Check nginx configuration

### Clean restart
```bash
# Stop and remove all containers, networks, volumes
docker-compose down -v

# Rebuild and start
docker-compose build --no-cache
docker-compose up -d
```

## Production Deployment

For production deployment:
1. Change all passwords in `.env`
2. Update `JWT_SECRET_KEY` to a secure random value
3. Set `ENVIRONMENT=production`
4. Use proper SSL certificates with nginx
5. Enable database backups
6. Configure proper logging
7. Set up monitoring