# 🔧 CORS Issue Fix Documentation

## Problem Description
- **Date:** 2024-08-17
- **Issue:** API returning 503 Service Unavailable with CORS errors
- **Error:** `Access to XMLHttpRequest at 'https://api.voucherskit.com/token' from origin 'https://voucherskit.com' has been blocked by CORS policy`

## Root Cause
The Traefik CORS middleware was incorrectly configured and blocking legitimate requests. The middleware was conflicting with the CORS headers already being set by the FastAPI backend.

## Investigation Steps
1. ✅ Verified backend pods were running: 3 pods in `Running` state
2. ✅ Checked backend logs: Health checks returning 200 OK
3. ✅ Tested backend directly via port-forward: API working correctly
4. ✅ Identified Traefik CORS middleware as the blocker

## Solution Applied
Removed the CORS middleware from the backend ingress, allowing FastAPI to handle CORS directly.

### Command Used:
```bash
kubectl patch ingress voucherskit-backend-ingress -n voucherskit-prod \
  --type='json' \
  -p='[{"op": "replace", "path": "/metadata/annotations/traefik.ingress.kubernetes.io~1router.middlewares", "value": "voucherskit-prod-redirect-to-https@kubernetescrd,voucherskit-prod-security-headers@kubernetescrd"}]'
```

## Current Configuration

### Backend CORS Settings (FastAPI)
Located in `backend/main.py`:
```python
origins = [
    "http://localhost:3000",
    "http://app.localhost",
    "https://voucherskit.com",
    "https://dev.voucherskit.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Ingress Middlewares
Current middlewares applied:
- ✅ `redirect-to-https` - Forces HTTPS
- ✅ `security-headers` - Adds security headers
- ❌ `cors-headers` - REMOVED (was causing conflicts)

## Verification
API is now accessible at:
- **Production:** https://api.voucherskit.com
- **Frontend:** https://voucherskit.com

Test command:
```bash
curl https://api.voucherskit.com/
# Response: {"message":"Therapy System API"}
```

## Future Recommendations
1. **Choose one CORS handler:** Either Traefik OR FastAPI, not both
2. **If using Traefik CORS:** Disable FastAPI CORS middleware
3. **If using FastAPI CORS:** Remove Traefik CORS middleware (current setup)
4. **Monitor:** Check for any CORS issues with different origins

## Related Files
- `/devops/kubernetes/base/traefik-middleware.yaml` - Traefik middleware definitions
- `/devops/kubernetes/overlays/prod/kustomization.yaml` - Production configuration
- `/backend/main.py` - FastAPI CORS configuration

---
*Issue resolved on 2024-08-17 by removing conflicting CORS middleware from Traefik ingress*