# DevOps Template 🚀

Kompletny zestaw szablonów DevOps dla nowoczesnych aplikacji webowych z CI/CD, Docker i Kubernetes.

## 📁 Struktura

```
devops-template/
├── github-workflows/     # GitHub Actions workflows
│   ├── ci-template.yml   # CI pipeline (build, test, push)
│   └── cd-template.yml   # CD pipeline (deploy to K8s)
├── docker/               # Dockerfiles
│   ├── backend.Dockerfile   # Python/FastAPI/Django/Flask
│   └── frontend.Dockerfile  # React/Vue/Angular/Next.js
├── kubernetes/           # Kubernetes manifests
│   ├── base/            # Base configurations
│   └── overlays/        # Environment-specific configs
│       ├── dev/
│       ├── staging/
│       └── prod/
└── scripts/             # Helper scripts
```

## 🚀 Szybki start

### 1. Skopiuj template do swojego projektu

```bash
# Skopiuj workflows
cp devops-template/github-workflows/*.yml .github/workflows/

# Skopiuj Dockerfiles
cp devops-template/docker/backend.Dockerfile backend/Dockerfile
cp devops-template/docker/frontend.Dockerfile frontend/Dockerfile

# Skopiuj konfigurację Kubernetes
cp -r devops-template/kubernetes devops/
```

### 2. Dostosuj konfigurację

#### GitHub Workflows

W plikach `.github/workflows/ci-template.yml` i `cd-template.yml`:

```yaml
env:
  IMAGE_OWNER: YOUR_GITHUB_USERNAME  # Zmień na swoją nazwę użytkownika
  IMAGE_NAME: YOUR_REPO_NAME         # Zmień na nazwę repozytorium
```

#### Dockerfiles

**Backend** (`backend/Dockerfile`):
- Wybierz odpowiedni CMD dla swojego frameworka (FastAPI/Django/Flask)
- Dostosuj wersję Pythona jeśli potrzeba
- Dodaj dodatkowe zależności systemowe jeśli wymagane

**Frontend** (`frontend/Dockerfile`):
- Wybierz odpowiednie komendy budowania dla swojego frameworka
- Dostosuj CMD w sekcji runner
- Ustaw zmienne środowiskowe dla API

#### Kubernetes

W `kubernetes/base/kustomization.yaml`:
```yaml
images:
  - name: backend
    newName: ghcr.io/YOUR_USERNAME/YOUR_REPO/backend
  - name: frontend
    newName: ghcr.io/YOUR_USERNAME/YOUR_REPO/frontend
```

W `kubernetes/base/ingress.yaml`:
- Zmień domeny na swoje
- Dostosuj ścieżki routingu
- Wybierz odpowiedni ingress controller

### 3. Skonfiguruj sekrety w GitHub

Przejdź do Settings → Secrets and variables → Actions:

#### Wymagane sekrety:
- `KUBECONFIG_DEV` - Kubeconfig dla środowiska dev (base64)
- `KUBECONFIG_STAGING` - Kubeconfig dla środowiska staging (base64)
- `KUBECONFIG_PROD` - Kubeconfig dla środowiska produkcyjnego (base64)
- `DATABASE_URL_DEV`, `DATABASE_URL_STAGING`, `DATABASE_URL_PROD`
- `JWT_SECRET_DEV`, `JWT_SECRET_STAGING`, `JWT_SECRET_PROD`
- `API_KEY_DEV`, `API_KEY_STAGING`, `API_KEY_PROD`

#### Opcjonalne (dla VPN):
- `WIREGUARD_CONFIG` - Konfiguracja WireGuard (base64)
- `K8S_CA_CERT`, `K8S_CLIENT_CERT`, `K8S_CLIENT_KEY`

## 🔧 Dostosowanie do różnych technologii

### Backend

#### FastAPI (domyślnie)
```dockerfile
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Django
```dockerfile
CMD ["gunicorn", "myproject.wsgi:application", "--bind", "0.0.0.0:8000"]
```

#### Flask
```dockerfile
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:8000"]
```

### Frontend

#### React/Vite
```dockerfile
RUN npm run build
COPY --from=builder /app/dist ./dist
CMD ["serve", "-s", "dist", "-l", "3000"]
```

#### Next.js
```dockerfile
RUN npm run build
COPY --from=builder /app/.next/standalone ./
CMD ["node", "server.js"]
```

#### Angular
```dockerfile
RUN npm run build -- --configuration=production
COPY --from=builder /app/dist/your-app-name ./dist
CMD ["serve", "-s", "dist", "-l", "3000"]
```

## 📦 CI/CD Pipeline

### CI Pipeline

Automatycznie uruchamia się przy:
- Push do `main` lub `develop`
- Pull request

Wykonuje:
1. ✅ Linting i formatowanie kodu
2. ✅ Testy jednostkowe
3. ✅ Budowanie obrazów Docker
4. ✅ Skanowanie bezpieczeństwa (Trivy)
5. ✅ Push do GitHub Container Registry

### CD Pipeline

Uruchamia się:
- Automatycznie po successful CI (staging)
- Manualnie przez workflow_dispatch (dowolne środowisko)

Wykonuje:
1. 🚀 Deploy do Kubernetes
2. 🔍 Smoke testy
3. 🔄 Automatyczny rollback przy błędzie
4. 🧹 Czyszczenie starych obrazów

## 🏗️ Kubernetes

### Struktura Kustomize

```
kubernetes/
├── base/                 # Wspólna konfiguracja
│   ├── kustomization.yaml
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   └── ingress.yaml
└── overlays/
    ├── dev/             # Środowisko developerskie
    │   └── kustomization.yaml
    ├── staging/         # Środowisko testowe
    │   └── kustomization.yaml
    └── prod/           # Produkcja
        ├── kustomization.yaml
        ├── pod-disruption-budget.yaml
        └── network-policy.yaml
```

### Deploy lokalny

```bash
# Build konfiguracji
kustomize build kubernetes/overlays/dev

# Apply do klastra
kustomize build kubernetes/overlays/dev | kubectl apply -f -

# Lub bezpośrednio
kubectl apply -k kubernetes/overlays/dev
```

## 🔒 Bezpieczeństwo

### Best Practices zastosowane w templates:

1. **Kontenery**
   - Non-root user
   - Read-only filesystem
   - Security context z dropped capabilities
   - Skanowanie obrazów (Trivy)

2. **Kubernetes**
   - Network policies
   - Pod disruption budgets
   - Resource limits
   - Secret management
   - Service accounts

3. **CI/CD**
   - Secrets w GitHub Secrets
   - Minimalne uprawnienia
   - Automatyczne czyszczenie starych obrazów

## 🛠️ Pomocne komendy

### Docker

```bash
# Build lokalny
docker build -f backend/Dockerfile -t myapp-backend backend/
docker build -f frontend/Dockerfile -t myapp-frontend frontend/

# Run lokalny
docker run -p 8000:8000 myapp-backend
docker run -p 3000:3000 myapp-frontend
```

### Kubernetes

```bash
# Sprawdź status
kubectl get all -n myapp-dev

# Logi
kubectl logs -f deployment/backend -n myapp-dev

# Port forward
kubectl port-forward service/backend 8000:80 -n myapp-dev

# Rollback
kubectl rollout undo deployment/backend -n myapp-dev
```

### GitHub Actions

```bash
# Uruchom workflow manualnie
gh workflow run cd.yml -f environment=prod -f deploy-backend=true

# Sprawdź status
gh run list --workflow=ci.yml

# Zobacz logi
gh run view <run-id> --log
```

## 📝 Dostosowanie do własnych potrzeb

### Dodanie nowego środowiska

1. Stwórz nowy overlay:
```bash
mkdir -p kubernetes/overlays/test
cp kubernetes/overlays/dev/kustomization.yaml kubernetes/overlays/test/
```

2. Dostosuj konfigurację w `kubernetes/overlays/test/kustomization.yaml`

3. Dodaj środowisko do CD workflow w opcjach

### Dodanie nowej usługi

1. Stwórz manifesty w `kubernetes/base/`
2. Dodaj do `kubernetes/base/kustomization.yaml`
3. Opcjonalnie dodaj patches w overlays

### Integracja z cloud providers

#### AWS EKS
Odkomentuj sekcję AWS w `cd-template.yml`

#### Google GKE  
Odkomentuj sekcję GKE w `cd-template.yml`

#### Azure AKS
Dodaj odpowiednie kroki autoryzacji Azure

## 🤝 Wsparcie

- Zgłoś problem lub sugestię przez Issues
- Sprawdź dokumentację poszczególnych narzędzi:
  - [GitHub Actions](https://docs.github.com/actions)
  - [Docker](https://docs.docker.com)
  - [Kubernetes](https://kubernetes.io/docs)
  - [Kustomize](https://kustomize.io)

## 📄 Licencja

Ten template jest dostępny jako open source.
Możesz go swobodnie używać i modyfikować dla swoich projektów.