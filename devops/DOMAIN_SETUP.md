# Domain Configuration for EduPoint Karnet

## Production Domains

- **Frontend**: https://voucherskit.com
- **Backend API**: https://api.voucherskit.com

## Development Domains

- **Frontend**: https://karnet-dev.edupoint.pl
- **Backend API**: https://karnetapi-dev.edupoint.pl

## DNS Configuration Required

Add the following DNS records to your domain provider:

### Production
```
voucherskit.com      A     <your-k8s-ingress-ip>
api.voucherskit.com   A     <your-k8s-ingress-ip>
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
URL_API_PUBLIC: api.voucherskit.com
URL_FRONTEND_PUBLIC: voucherskit.com
URL_API_LOCAL: karnetapi-dev.edupoint.pl
URL_FRONTEND_LOCAL: karnet-dev.edupoint.pl
```

## Frontend Configuration

The frontend React app will use these API endpoints:
- Production: `https://api.voucherskit.com`
- Development: `https://karnetapi-dev.edupoint.pl`

This is configured via the `REACT_APP_API_URL` environment variable.

## CORS Configuration

Ensure the backend allows CORS from:
- `https://voucherskit.com`
- `https://karnet-dev.edupoint.pl`
- `http://localhost:3000` (for local development)

## Testing Domain Configuration

After deployment, test the domains:

```bash
# Test frontend
curl -I https://voucherskit.com

# Test API
curl https://api.voucherskit.com/health
curl https://api.voucherskit.com/docs

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
   nslookup voucherskit.com
   nslookup api.voucherskit.com
   ```

3. **Ingress Status**
   ```bash
   kubectl get ingress -n edupoint-prod
   kubectl describe ingress edupoint-ingress -n edupoint-prod
   ```