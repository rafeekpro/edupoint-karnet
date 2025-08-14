#!/bin/bash

echo "========================================="
echo "USUWANIE PAKIETÓW Z GITHUB CONTAINER REGISTRY"
echo "========================================="
echo ""

# Lista wszystkich pakietów do usunięcia
ALL_PACKAGES=(
    "edupoint-frontend-prod"
    "edupoint-backend-prod" 
    "edupoint-e2e-tests-prod"
    "e2e-tests"
    "frontend"
    "backend"
)

echo "Pakiety do sprawdzenia/usunięcia:"
for pkg in "${ALL_PACKAGES[@]}"; do
    echo "  - $pkg"
done

echo ""
echo "UWAGA: Upewnij się, że masz token z uprawnieniami:"
echo "  - read:packages"
echo "  - delete:packages"
echo "  - write:packages"
echo ""

# Sprawdzanie obecnego tokena
echo "Sprawdzanie uprawnień tokena..."
TOKEN_SCOPES=$(gh auth status 2>&1 | grep "Token scopes" | head -1)
echo "Obecne uprawnienia: $TOKEN_SCOPES"
echo ""

# Próba usunięcia każdego pakietu różnymi metodami
for pkg in "${ALL_PACKAGES[@]}"; do
    echo "----------------------------------------"
    echo "Pakiet: $pkg"
    
    # Metoda 1: User packages
    echo "  Próba 1: /user/packages/container/$pkg"
    result=$(gh api --method DELETE "/user/packages/container/$pkg" 2>&1)
    if [ $? -eq 0 ]; then
        echo "    ✓ USUNIĘTO przez user packages"
        continue
    else
        echo "    ✗ $(echo $result | grep -oE '(message":")([^"]+)' | cut -d'"' -f3)"
    fi
    
    # Metoda 2: Org packages (jeśli to organizacja)
    echo "  Próba 2: /orgs/rafeekpro/packages/container/$pkg"
    result=$(gh api --method DELETE "/orgs/rafeekpro/packages/container/$pkg" 2>&1)
    if [ $? -eq 0 ]; then
        echo "    ✓ USUNIĘTO przez org packages"
        continue
    else
        echo "    ✗ $(echo $result | grep -oE '(message":")([^"]+)' | cut -d'"' -f3)"
    fi
    
    # Metoda 3: User packages z wersją
    echo "  Próba 3: Sprawdzanie wersji pakietu..."
    versions=$(gh api "/user/packages/container/$pkg/versions" 2>&1 | jq -r '.[].id' 2>/dev/null)
    if [ ! -z "$versions" ]; then
        for version_id in $versions; do
            echo "    - Usuwanie wersji $version_id..."
            gh api --method DELETE "/user/packages/container/$pkg/versions/$version_id" 2>&1
        done
    else
        echo "    ✗ Nie można pobrać wersji"
    fi
done

echo ""
echo "========================================="
echo "ZAKOŃCZONO"
echo "========================================="
echo ""
echo "Jeśli pakiety nadal istnieją, możesz:"
echo "1. Wygenerować nowy token z pełnymi uprawnieniami"
echo "2. Usunąć pakiety ręcznie przez interfejs GitHub:"
echo "   https://github.com/rafeekpro?tab=packages"