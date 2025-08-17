#!/bin/bash

# DevOps Template Setup Script
# This script helps set up the DevOps templates in your project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository. Please run this script from your project root."
    exit 1
fi

# Get project information
print_info "DevOps Template Setup Script"
echo "============================="
echo ""

# Get GitHub username and repo name
read -p "Enter your GitHub username/organization: " GITHUB_USERNAME
read -p "Enter your repository name: " REPO_NAME
read -p "Enter your primary domain (e.g., example.com): " DOMAIN

# Select backend framework
echo ""
echo "Select your backend framework:"
echo "1) FastAPI (Python)"
echo "2) Django (Python)"
echo "3) Flask (Python)"
echo "4) Express (Node.js)"
echo "5) Other"
read -p "Enter choice [1-5]: " BACKEND_CHOICE

case $BACKEND_CHOICE in
    1) BACKEND_FRAMEWORK="fastapi" ;;
    2) BACKEND_FRAMEWORK="django" ;;
    3) BACKEND_FRAMEWORK="flask" ;;
    4) BACKEND_FRAMEWORK="express" ;;
    5) BACKEND_FRAMEWORK="other" ;;
    *) BACKEND_FRAMEWORK="fastapi" ;;
esac

# Select frontend framework
echo ""
echo "Select your frontend framework:"
echo "1) React (Vite)"
echo "2) Next.js"
echo "3) Vue.js"
echo "4) Angular"
echo "5) SvelteKit"
echo "6) Other"
read -p "Enter choice [1-6]: " FRONTEND_CHOICE

case $FRONTEND_CHOICE in
    1) FRONTEND_FRAMEWORK="react" ;;
    2) FRONTEND_FRAMEWORK="nextjs" ;;
    3) FRONTEND_FRAMEWORK="vue" ;;
    4) FRONTEND_FRAMEWORK="angular" ;;
    5) FRONTEND_FRAMEWORK="sveltekit" ;;
    6) FRONTEND_FRAMEWORK="other" ;;
    *) FRONTEND_FRAMEWORK="react" ;;
esac

# Select Kubernetes ingress controller
echo ""
echo "Select your Kubernetes ingress controller:"
echo "1) NGINX"
echo "2) Traefik"
echo "3) AWS ALB"
echo "4) GKE Ingress"
echo "5) Other"
read -p "Enter choice [1-5]: " INGRESS_CHOICE

case $INGRESS_CHOICE in
    1) INGRESS_CONTROLLER="nginx" ;;
    2) INGRESS_CONTROLLER="traefik" ;;
    3) INGRESS_CONTROLLER="alb" ;;
    4) INGRESS_CONTROLLER="gke" ;;
    5) INGRESS_CONTROLLER="other" ;;
    *) INGRESS_CONTROLLER="nginx" ;;
esac

# Create necessary directories
print_info "Creating directory structure..."
mkdir -p .github/workflows
mkdir -p backend
mkdir -p frontend
mkdir -p devops/kubernetes/{base,overlays/{dev,staging,prod}}

# Copy and customize GitHub workflows
print_info "Setting up GitHub Actions workflows..."

# Copy CI workflow
if [ -f "devops-template/github-workflows/ci-template.yml" ]; then
    cp devops-template/github-workflows/ci-template.yml .github/workflows/ci.yml
    
    # Replace placeholders
    sed -i.bak "s/YOUR_GITHUB_USERNAME/${GITHUB_USERNAME}/g" .github/workflows/ci.yml
    sed -i.bak "s/YOUR_REPO_NAME/${REPO_NAME}/g" .github/workflows/ci.yml
    rm .github/workflows/ci.yml.bak
    
    print_info "CI workflow created at .github/workflows/ci.yml"
else
    print_warn "CI template not found"
fi

# Copy CD workflow
if [ -f "devops-template/github-workflows/cd-template.yml" ]; then
    cp devops-template/github-workflows/cd-template.yml .github/workflows/cd.yml
    
    # Replace placeholders
    sed -i.bak "s/YOUR_GITHUB_USERNAME/${GITHUB_USERNAME}/g" .github/workflows/cd.yml
    sed -i.bak "s/YOUR_REPO_NAME/${REPO_NAME}/g" .github/workflows/cd.yml
    rm .github/workflows/cd.yml.bak
    
    print_info "CD workflow created at .github/workflows/cd.yml"
else
    print_warn "CD template not found"
fi

# Copy Dockerfiles
print_info "Setting up Dockerfiles..."

# Backend Dockerfile
if [ -f "devops-template/docker/backend.Dockerfile" ]; then
    cp devops-template/docker/backend.Dockerfile backend/Dockerfile
    print_info "Backend Dockerfile created at backend/Dockerfile"
    print_warn "Remember to customize the CMD instruction for ${BACKEND_FRAMEWORK}"
else
    print_warn "Backend Dockerfile template not found"
fi

# Frontend Dockerfile
if [ -f "devops-template/docker/frontend.Dockerfile" ]; then
    cp devops-template/docker/frontend.Dockerfile frontend/Dockerfile
    print_info "Frontend Dockerfile created at frontend/Dockerfile"
    print_warn "Remember to customize the build and CMD instructions for ${FRONTEND_FRAMEWORK}"
else
    print_warn "Frontend Dockerfile template not found"
fi

# Copy Kubernetes configurations
print_info "Setting up Kubernetes configurations..."

# Copy base configurations
cp -r devops-template/kubernetes/base/* devops/kubernetes/base/ 2>/dev/null || print_warn "Base K8s configs not found"

# Copy overlay configurations
cp -r devops-template/kubernetes/overlays/* devops/kubernetes/overlays/ 2>/dev/null || print_warn "Overlay K8s configs not found"

# Update Kubernetes configurations with project specifics
find devops/kubernetes -type f -name "*.yaml" -o -name "*.yml" | while read file; do
    sed -i.bak "s/myorg/${GITHUB_USERNAME}/g" "$file"
    sed -i.bak "s/myapp/${REPO_NAME}/g" "$file"
    sed -i.bak "s/example.com/${DOMAIN}/g" "$file"
    rm "${file}.bak"
done

print_info "Kubernetes configurations created in devops/kubernetes/"

# Create .dockerignore files
print_info "Creating .dockerignore files..."

cat > backend/.dockerignore << 'EOF'
__pycache__
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.venv/
pip-log.txt
pip-delete-this-directory.txt
.tox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
*.log
.git
.gitignore
.mypy_cache
.pytest_cache
.hypothesis
*.db
*.sqlite
.env
.env.*
*.md
tests/
docs/
EOF

cat > frontend/.dockerignore << 'EOF'
node_modules
npm-debug.log
yarn-error.log
.git
.gitignore
.env
.env.*
.next
.nuxt
dist
build
.cache
.vscode
.idea
*.md
coverage
.eslintcache
*.map
EOF

# Create environment template files
print_info "Creating environment template files..."

cat > .env.example << 'EOF'
# Backend Environment Variables
DATABASE_URL=postgresql://user:pass@localhost/dbname
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-here
API_KEY=your-api-key-here
ENVIRONMENT=development
LOG_LEVEL=debug

# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:8000
REACT_APP_API_URL=http://localhost:8000
VUE_APP_API_URL=http://localhost:8000
VITE_API_URL=http://localhost:8000
EOF

# Create GitHub Actions secrets documentation
cat > .github/SECRETS.md << 'EOF'
# GitHub Actions Secrets Configuration

## Required Secrets

### Kubernetes Access
- `KUBECONFIG_DEV` - Base64 encoded kubeconfig for dev environment
- `KUBECONFIG_STAGING` - Base64 encoded kubeconfig for staging environment
- `KUBECONFIG_PROD` - Base64 encoded kubeconfig for production environment

### Database
- `DATABASE_URL_DEV` - Dev database connection string
- `DATABASE_URL_STAGING` - Staging database connection string
- `DATABASE_URL_PROD` - Production database connection string

### Security
- `JWT_SECRET_DEV` - JWT secret for dev
- `JWT_SECRET_STAGING` - JWT secret for staging
- `JWT_SECRET_PROD` - JWT secret for production

### API Keys (if needed)
- `API_KEY_DEV` - API key for dev
- `API_KEY_STAGING` - API key for staging
- `API_KEY_PROD` - API key for production

## How to encode kubeconfig

```bash
cat ~/.kube/config | base64 | tr -d '\n'
```

## Setting secrets via GitHub CLI

```bash
gh secret set KUBECONFIG_DEV < ~/.kube/config-dev
gh secret set DATABASE_URL_PROD --body "postgresql://user:pass@host/db"
```
EOF

# Summary
echo ""
print_info "Setup complete! 🎉"
echo ""
echo "Project Configuration:"
echo "====================="
echo "GitHub: ${GITHUB_USERNAME}/${REPO_NAME}"
echo "Domain: ${DOMAIN}"
echo "Backend: ${BACKEND_FRAMEWORK}"
echo "Frontend: ${FRONTEND_FRAMEWORK}"
echo "Ingress: ${INGRESS_CONTROLLER}"
echo ""
echo "Next steps:"
echo "1. Review and customize the generated files"
echo "2. Set up GitHub secrets (see .github/SECRETS.md)"
echo "3. Customize Dockerfiles for your specific frameworks"
echo "4. Update Kubernetes manifests as needed"
echo "5. Test locally with: docker-compose up"
echo "6. Commit and push to trigger CI/CD"
echo ""
print_warn "Don't forget to:"
echo "  - Update CMD instructions in Dockerfiles"
echo "  - Configure your domain DNS"
echo "  - Set up SSL certificates"
echo "  - Configure monitoring and logging"