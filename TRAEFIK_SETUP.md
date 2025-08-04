# Traefik Setup Guide

## Production Kubernetes
The Kubernetes deployment is configured to use Traefik ingress controller with the following features:
- SSL/TLS termination with cert-manager
- Automatic HTTPS redirect
- Security headers (HSTS, XSS protection, etc.)
- CORS headers for API endpoints

### Domains
- Frontend: https://karnet.edupoint.pl
- Backend API: https://karnetapi.edupoint.pl

### Middleware Configuration
1. **redirect-to-https**: Forces all HTTP traffic to HTTPS
2. **security-headers**: Adds security headers including HSTS
3. **cors-headers**: Configures CORS for API (only on backend ingress)

## Local Development with Traefik

To use Traefik instead of nginx for local development:

```bash
# Run with Traefik
docker-compose -f docker-compose.traefik.yml up

# Access URLs
# Frontend: http://app.localhost
# Backend API: http://api.localhost
# Traefik Dashboard: http://localhost:8080
```

### Local Traefik Features
- Automatic service discovery via Docker labels
- CORS configuration for backend API
- Load balancing ready
- No manual nginx configuration needed

## Benefits of Traefik
1. **Dynamic Configuration**: Services are discovered automatically
2. **Built-in Dashboard**: Monitor routing and services
3. **Middleware Support**: Easy to add authentication, rate limiting, etc.
4. **Kubernetes Native**: Better integration with K8s ingress
5. **Let's Encrypt Integration**: Works seamlessly with cert-manager

## Migration from Nginx
The Traefik configuration replaces the nginx reverse proxy with:
- Docker labels for routing configuration
- Built-in CORS middleware
- Automatic SSL handling in production
- No need for manual proxy configuration files