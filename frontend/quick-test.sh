#!/bin/bash

echo "Testuję kluczowe funkcjonalności..."
echo ""

# Lista kluczowych testów
tests=(
  "admin-add-user-simple.feature"
  "admin-dashboard.feature"
  "role-based-access.feature"
  "login.feature"
  "client-dashboard.feature"
)

failed_tests=()

for test in "${tests[@]}"; do
  echo "Testuję: $test"
  
  # Uruchom test i sprawdź kod wyjścia
  if npx cypress run --spec "cypress/e2e/features/$test" --quiet >/dev/null 2>&1; then
    echo "  ✅ DZIAŁA"
  else
    echo "  ❌ NIE DZIAŁA"
    failed_tests+=("$test")
  fi
done

echo ""
echo "========================================="
echo "PODSUMOWANIE:"
echo "========================================="
echo ""

if [ ${#failed_tests[@]} -eq 0 ]; then
  echo "✅ Wszystkie kluczowe testy działają!"
else
  echo "❌ Testy które NIE DZIAŁAJĄ:"
  for test in "${failed_tests[@]}"; do
    echo "  - $test"
  done
fi

echo ""
echo "Działające: $((${#tests[@]} - ${#failed_tests[@]}))/${#tests[@]}"
echo "Niedziałające: ${#failed_tests[@]}/${#tests[@]}"