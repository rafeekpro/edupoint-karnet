#!/bin/bash

# Therapy System Startup Script

set -e

echo "🚀 Starting Therapy System..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create necessary directories
mkdir -p backend/database/init
mkdir -p nginx

# Stop any existing containers
echo "🔄 Stopping existing containers..."
docker-compose down

# Build and start services
echo "🏗️  Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
sleep 10

# Check if all services are running
echo "✅ Checking service status..."
docker-compose ps

# Show logs
echo "📋 Service logs (last 20 lines):"
docker-compose logs --tail=20

echo "✅ Therapy System is running!"
echo ""
echo "📍 Access points:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - Full app via Nginx: http://localhost"
echo ""
echo "🔑 Default credentials:"
echo "   - Admin: admin@therapy.com / admin123"
echo "   - Therapist: john@therapy.com / admin123"
echo "   - Client: client@example.com / admin123"
echo ""
echo "💡 Commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop: docker-compose down"
echo "   - Restart: docker-compose restart"