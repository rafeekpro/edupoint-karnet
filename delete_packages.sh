#!/bin/bash

echo "========================================="
echo "USUWANIE PAKIETÓW KONTENERÓW"
echo "========================================="
echo ""
echo "UWAGA: Wymaga tokena z uprawnieniami 'read:packages' i 'delete:packages'"
echo ""
echo "Aby uzyskać token z odpowiednimi uprawnieniami:"
echo "1. Idź na: https://github.com/settings/tokens"
echo "2. Wygeneruj nowy token z uprawnieniami:"
echo "   - repo"
echo "   - write:packages"
echo "   - delete:packages"
echo "   - read:packages"
echo "3. Zaloguj się ponownie: gh auth login"
echo ""
echo "Kontynuować z obecnym tokenem? (tak/nie)"
read -r response

if [ "$response" != "tak" ]; then
    echo "Anulowano."
    exit 0
fi

echo ""
echo "Sprawdzanie pakietów..."

# Próba pobrania listy pakietów
gh api "/user/packages?package_type=container" 2>/dev/null | jq -r '.[].name' > /tmp/packages.txt

if [ ! -s /tmp/packages.txt ]; then
    echo "Nie znaleziono pakietów lub brak uprawnień."
    echo "Sprawdzam pakiety w repozytorium..."
    
    # Alternatywna metoda przez ghcr.io
    # Pakiety z repozytorium rafeekpro/edupoint-karnet
    PACKAGES="edupoint-frontend-prod edupoint-backend-prod edupoint-e2e-tests-prod"
    
    # Pakiety z organizacji/repozytorium
    REPO_PACKAGES="e2e-tests frontend"
    
    echo ""
    echo "Próba usunięcia pakietów użytkownika:"
    for pkg in $PACKAGES; do
        echo "  - Usuwanie $pkg..."
        gh api --method DELETE "/user/packages/container/$pkg" 2>/dev/null && echo "    ✓ Usunięto" || echo "    ✗ Nie znaleziono lub brak uprawnień"
    done
    
    echo ""
    echo "Próba usunięcia pakietów z repozytorium:"
    for pkg in $REPO_PACKAGES; do
        echo "  - Usuwanie $pkg z repos/rafeekpro/edupoint-karnet..."
        # Próba przez API organizacji/repozytorium
        gh api --method DELETE "/orgs/rafeekpro/packages/container/$pkg" 2>/dev/null && echo "    ✓ Usunięto" || \
        gh api --method DELETE "/repos/rafeekpro/edupoint-karnet/packages/container/$pkg" 2>/dev/null && echo "    ✓ Usunięto" || \
        echo "    ✗ Nie znaleziono lub brak uprawnień"
    done
else
    echo "Znalezione pakiety:"
    cat /tmp/packages.txt
    
    echo ""
    echo "Usuwanie pakietów..."
    while IFS= read -r pkg; do
        echo "  - Usuwanie $pkg..."
        gh api --method DELETE "/user/packages/container/$pkg" && echo "    ✓ Usunięto"
    done < /tmp/packages.txt
fi

rm -f /tmp/packages.txt

echo ""
echo "Zakończono."