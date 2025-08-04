# Domain Configuration for EduPoint Karnet

## Production Domains

- **Frontend**: https://karnet.edupoint.pl
- **Backend API**: https://karnetapi.edupoint.pl

## Development Domains

- **Frontend**: https://karnet-dev.edupoint.pl
- **Backend API**: https://karnetapi-dev.edupoint.pl

## DNS Configuration Required

Add the following DNS records to your domain provider:

### Production
```
karnet.edupoint.pl      A     <your-k8s-ingress-ip>
karnetapi.edupoint.pl   A     <your-k8s-ingress-ip>
```

### Development
```
karnet-dev.edupoint.pl      A     <your-k8s-ingress-ip>
karnetapi-dev.edupoint.pl   A     <your-k8s-ingress-ip>
```

## SSL Certificates

The deployment uses cert-manager with Let's Encrypt:
- **Production**: Uses `letsencrypt-prod` issuer
- **Development**: Uses `letsencrypt-staging` issuer

## Environment Variables

Make sure to update these in Azure DevOps variable groups:

```yaml
URL_API_PUBLIC: karnetapi.edupoint.pl
URL_FRONTEND_PUBLIC: karnet.edupoint.pl
URL_API_LOCAL: karnetapi-dev.edupoint.pl
URL_FRONTEND_LOCAL: karnet-dev.edupoint.pl
```

## Frontend Configuration

The frontend React app will use these API endpoints:
- Production: `https://karnetapi.edupoint.pl`
- Development: `https://karnetapi-dev.edupoint.pl`

This is configured via the `REACT_APP_API_URL` environment variable.

## CORS Configuration

Ensure the backend allows CORS from:
- `https://karnet.edupoint.pl`
- `https://karnet-dev.edupoint.pl`
- `http://localhost:3000` (for local development)

## Testing Domain Configuration

After deployment, test the domains:

```bash
# Test frontend
curl -I https://karnet.edupoint.pl

# Test API
curl https://karnetapi.edupoint.pl/health
curl https://karnetapi.edupoint.pl/docs

# Test dev environment
curl -I https://karnet-dev.edupoint.pl
curl https://karnetapi-dev.edupoint.pl/health
```

## Troubleshooting

1. **Certificate Issues**
   ```bash
   kubectl get certificates -n edupoint-prod
   kubectl describe certificate edupoint-tls -n edupoint-prod
   ```

2. **DNS Resolution**
   ```bash
   nslookup karnet.edupoint.pl
   nslookup karnetapi.edupoint.pl
   ```

3. **Ingress Status**
   ```bash
   kubectl get ingress -n edupoint-prod
   kubectl describe ingress edupoint-ingress -n edupoint-prod
   ```