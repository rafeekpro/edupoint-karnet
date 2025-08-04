# GitHub Actions CI/CD Setup

## Overview

This repository uses GitHub Actions for CI/CD pipelines to build Docker images and deploy to Kubernetes cluster through WireGuard VPN.

## Workflows

### 1. CI - Build and Push Images (`ci.yml`)

Automatically triggered on:
- Push to `main` branch
- Pull requests to `main` branch
- When changes are made to `backend/`, `frontend/`, `e2e-tests/` or workflow files

Builds and pushes Docker images to GitHub Container Registry (ghcr.io).

### 2. CD - Deploy to Kubernetes (`cd.yml`)

Can be triggered:
- Manually via workflow dispatch
- Automatically after successful CI workflow completion

Deploys applications to Kubernetes cluster using WireGuard VPN for secure connection.

## Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

### Database Configuration
- `DB_HOST_PROD` - Production database host
- `DB_PORT_PROD` - Production database port (default: 5432)
- `DB_USER_PROD` - Production database username
- `DB_PASSWORD_PROD` - Production database password

### Application Secrets
- `JWT_SECRET_KEY_PROD` - JWT secret key for production

### Kubernetes & VPN Configuration
- `WIREGUARD_CONFIG` - Base64 encoded WireGuard configuration file
- `K8S_API_SERVER_IP` - Kubernetes API server IP address
- `KUBECONFIG_BASE64` - Base64 encoded kubeconfig file

### How to encode secrets

1. **WireGuard configuration:**
   ```bash
   cat /path/to/wg0.conf | base64 -w 0
   ```

2. **Kubeconfig:**
   ```bash
   cat ~/.kube/config | base64 -w 0
   ```

## WireGuard Configuration Example

Your WireGuard configuration file should look like:

```ini
[Interface]
PrivateKey = YOUR_PRIVATE_KEY
Address = 10.0.0.2/24
DNS = 8.8.8.8

[Peer]
PublicKey = SERVER_PUBLIC_KEY
Endpoint = your-server.com:51820
AllowedIPs = 10.0.0.0/24, 192.168.1.0/24
PersistentKeepalive = 25
```

## Manual Deployment

To manually trigger deployment:

1. Go to Actions tab
2. Select "CD - Deploy to Kubernetes"
3. Click "Run workflow"
4. Select options:
   - Environment (prod)
   - Image tag (optional, uses latest if empty)
   - Components to deploy
   - Whether to run E2E tests

## Monitoring Deployments

Check deployment status:
- GitHub Actions workflow logs
- Deployment summary in workflow run
- Kubernetes cluster directly:
  ```bash
  kubectl get deployments -n edupoint-prod
  kubectl get pods -n edupoint-prod
  ```

## Troubleshooting

### VPN Connection Issues
- Verify `WIREGUARD_CONFIG` secret is properly base64 encoded
- Check if K8S_API_SERVER_IP is reachable through VPN
- Review WireGuard logs in workflow output

### Kubernetes Access Issues
- Ensure `KUBECONFIG_BASE64` contains valid kubeconfig
- Verify cluster endpoint in kubeconfig uses internal VPN IP
- Check namespace permissions

### Image Pull Errors
- GitHub packages are public by default for public repos
- For private repos, ensure GITHUB_TOKEN has packages:read permission
- Verify image tags match between CI and CD workflows