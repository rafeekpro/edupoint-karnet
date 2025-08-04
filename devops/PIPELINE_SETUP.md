# Azure DevOps Pipeline Setup Guide

## CI Pipeline Setup

1. Create a new pipeline in Azure DevOps
2. Select your repository
3. Choose "Existing Azure Pipelines YAML file"
4. Select `/devops/pipelines/ci/ci-prod.yml`
5. **IMPORTANT**: Name the pipeline (e.g., "edupoint-voucher-ci" or "CI-Prod")
6. Save and run

## CD Pipeline Setup

1. Create a new pipeline in Azure DevOps
2. Select your repository
3. Choose "Existing Azure Pipelines YAML file"
4. Select `/devops/pipelines/cd/cd-prod.yml`
5. **BEFORE SAVING**: Edit the YAML file and update line 8:
   ```yaml
   source: YOUR-CI-PIPELINE-NAME  # Replace with the exact name from step 5 above
   ```
6. Save and run

## Variable Groups Required

Create a variable group named `edupoint-voucher-library` with these variables:

### Option 1: Using kubeconfig (manual setup)
Add this variable if using the original cd-prod.yml:

- `dockerRegistry`: ghcr.io
- `GITHUB_USER`: your-github-username
- `GITHUB_TOKEN`: your-github-pat-token (mark as secret)
- `DB_HOST`: postgres.local.pro4.es
- `DB_PORT`: 5432
- `DB_NAME_PROD`: therapy_system_prod
- `DB_USER_PROD`: therapy_user
- `DB_PASSWORD_PROD`: your-database-password (mark as secret)
- `JWT_SECRET_KEY_PROD`: your-jwt-secret (mark as secret)
- `kubeconfig`: base64-encoded-kubernetes-config (mark as secret)
  - To get this: `cat ~/.kube/config | base64 -w 0`

### Option 2: Using Service Connection (recommended)
If using cd-prod-with-service-connection.yml, you don't need the kubeconfig variable.

### Option 3: Using SSH Service Connection (for Green_local)
If you have an SSH connection to a server with kubectl installed, use cd-prod-ssh.yml.
This option doesn't require the kubeconfig variable.

### Option 4: Using Self-Hosted Agent Pool (recommended if available)
If you have a self-hosted agent pool with kubectl configured, use cd-prod-selfhosted.yml.
This is the simplest option as kubectl is already configured on the agents.

## Service Connections Required

1. **Docker Registry**: 
   - Name: `github-container-registry`
   - Type: Docker Registry
   - Docker Registry: https://ghcr.io
   - Docker ID: your-github-username
   - Password: your-github-pat-token

2. **Kubernetes** (Option 2):
   - Name: `k8s-prod`
   - Type: Kubernetes
   - Add your cluster details

3. **SSH** (Option 3 - if using Green_local):
   - Name: `Green_local`
   - Type: SSH
   - Host: your-server-with-kubectl
   - Username: your-username
   - Password/SSH Key: your-credentials

## Common Issues

### "Pipeline Resource ci-pipeline Input Must be Valid"
This error means the CD pipeline can't find the CI pipeline. Make sure:
1. The CI pipeline has been created and run at least once
2. The `source` value in cd-prod.yml matches the exact pipeline name
3. Both pipelines are in the same Azure DevOps project

### "Variable group was not found"
Create the `edupoint-voucher-library` variable group as described above.

### "Service connection not found"
Create the required service connections as described above.