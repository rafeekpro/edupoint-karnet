# EduPoint Voucher DevOps

This directory contains CI/CD pipelines and Kubernetes manifests for deploying the EduPoint Voucher application.

## Structure

```
devops/
├── pipelines/
│   ├── ci/
│   │   └── ci-prod.yml         # CI pipeline for building and pushing Docker images
│   ├── cd/
│   │   └── cd-prod.yml         # CD pipeline for Kubernetes deployment
│   └── variables-template.yml  # Template for Azure DevOps variable groups
└── kubernetes/
    ├── base/                   # Base Kubernetes manifests
    └── overlays/              # Environment-specific overlays
        ├── dev/
        ├── staging/
        └── prod/
```

## Prerequisites

1. **Azure DevOps Project** with:
   - Self-hosted agent pool named 'SelfHosted'
   - Service connection to Kubernetes cluster
   - Variable group `edupoint-voucher-library` (see variables-template.yml)

2. **GitHub Container Registry** access:
   - GitHub Personal Access Token with packages permissions
   - Repository configured for GitHub Packages

3. **Kubernetes Cluster** with:
   - NGINX Ingress Controller
   - cert-manager for SSL certificates
   - Persistent Volume support

## Setup Instructions

### 1. Create Azure DevOps Variable Group

1. Go to Project Settings → Library → Variable Groups
2. Create new group: `edupoint-voucher-library`
3. Add variables from `variables-template.yml`
4. Mark sensitive variables as secret

### 2. Import CI/CD Pipelines

1. Go to Pipelines → New Pipeline
2. Choose Azure Repos Git
3. Select existing YAML file
4. Point to `/devops/pipelines/ci/ci-prod.yml`
5. Save as "CI-Prod"
6. Repeat for CD pipeline

### 3. Configure Kubernetes

1. Create namespace:
   ```bash
   kubectl create namespace edupoint-prod
   ```

2. Create GitHub registry secret:
   ```bash
   kubectl create secret docker-registry ghcr-secret \
     --namespace=edupoint-prod \
     --docker-server=ghcr.io \
     --docker-username=YOUR_GITHUB_USER \
     --docker-password=YOUR_GITHUB_PAT
   ```

3. Apply manifests using Kustomize:
   ```bash
   cd devops/kubernetes/overlays/prod
   kustomize build . | kubectl apply -f -
   ```

## Pipeline Workflow

### CI Pipeline (ci-prod.yml)

Triggers on:
- Push to main branch
- Changes in backend/, frontend/, or e2e-tests/

Steps:
1. Build Backend Docker image
2. Build Frontend Docker image  
3. Build E2E Tests Docker image
4. Push all images to GitHub Container Registry
5. Tag with build ID and commit SHA

### CD Pipeline (cd-prod.yml)

Triggers on:
- Successful CI pipeline completion
- Manual trigger with parameters

Steps:
1. Pre-deployment validation
2. Create/update Kubernetes secrets
3. Deploy Backend using Kustomize
4. Deploy Frontend using Kustomize
5. Run E2E tests (optional)
6. Post-deployment health checks

## Environment Configuration

### Production (prod)
- Namespace: `edupoint-prod`
- Replicas: 3 (backend & frontend)
- Resources: Higher limits
- SSL: Let's Encrypt production

### Development (dev)
- Namespace: `edupoint-dev`
- Replicas: 1
- Resources: Lower limits
- SSL: Let's Encrypt staging or self-signed

### Staging (staging)
- Namespace: `edupoint-staging`
- Replicas: 2
- Resources: Medium limits
- SSL: Let's Encrypt staging

## Monitoring and Troubleshooting

### Check Deployment Status
```bash
kubectl get all -n edupoint-prod
kubectl get pods -n edupoint-prod
kubectl describe deployment edupoint-backend -n edupoint-prod
```

### View Logs
```bash
kubectl logs -n edupoint-prod -l app=edupoint-backend --tail=100
kubectl logs -n edupoint-prod -l app=edupoint-frontend --tail=100
```

### Check Certificates
```bash
kubectl get certificates -n edupoint-prod
kubectl describe certificate edupoint-tls -n edupoint-prod
```

### Rollback Deployment
```bash
kubectl rollout undo deployment/edupoint-backend -n edupoint-prod
kubectl rollout undo deployment/edupoint-frontend -n edupoint-prod
```

## Security Considerations

1. All secrets are stored in Azure DevOps variable groups
2. Database passwords are injected at runtime
3. JWT secrets are unique per environment
4. Images are scanned for vulnerabilities in CI
5. Network policies restrict pod-to-pod communication
6. SSL/TLS encryption for all external traffic

## Backup and Recovery

1. Database backups run daily via CronJob
2. Persistent volumes are backed up to cloud storage
3. Application state is stored in PostgreSQL
4. Recovery procedure documented in disaster recovery plan