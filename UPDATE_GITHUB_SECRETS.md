# GitHub Secrets - Wymagana Aktualizacja

## 🔐 Secrets do zaktualizowania w GitHub Repository

Przejdź do: https://github.com/rafeekpro/edupoint-karnet/settings/secrets/actions

### Usuń stare secrets (jeśli istnieją):
- `DB_HOST_PROD` 
- `DB_PORT_PROD`
- `DB_USER_PROD`
- `DB_PASSWORD_PROD`

### Dodaj/Zaktualizuj nowe secrets:

1. **DB_PASSWORD_PROD**
   ```
   VouchersKit2024Prod
   ```

2. **JWT_SECRET_KEY_PROD** (jeśli nie istnieje)
   ```
   your-super-secret-jwt-key-change-this-in-production
   ```

3. **GHCR_TOKEN** (jeśli nie istnieje)
   - Wygeneruj na: https://github.com/settings/tokens
   - Uprawnienia: `write:packages`, `read:packages`, `delete:packages`

## 📝 Nowa konfiguracja bazy danych

Aplikacja teraz używa:
- **Host:** postgres.local.pro4.es
- **Port:** 5432
- **Database:** voucherskit
- **User:** voucherskit
- **Password:** VouchersKit2024Prod

## ✅ Co zostało zmienione w kodzie:

1. **Kubernetes Deployments:**
   - Backend image: `ghcr.io/rafeekpro/edupoint-karnet/backend:main`
   - Frontend image: `ghcr.io/rafeekpro/edupoint-karnet/frontend:main`

2. **CI/CD Workflow:**
   - Zaktualizowano build-args dla nowej bazy `voucherskit`
   - Usunięto zależność od niepotrzebnych secrets

3. **Kustomization:**
   - Base i Prod overlay używają teraz `voucherskit` zamiast `therapy_system`

## 🚀 Po zaktualizowaniu secrets:

1. Uruchom workflow CI ręcznie lub poczekaj na auto-trigger po push
2. Workflow CD powinien automatycznie wdrożyć nową wersję
3. Sprawdź logi deploymentu w Kubernetes

## ⚠️ WAŻNE:

Upewnij się, że VPN jest skonfigurowany poprawnie w GitHub Actions dla dostępu do `postgres.local.pro4.es`