# Przewodnik po testach E2E

## Uruchamianie testów

### Przed pierwszym uruchomieniem
Upewnij się, że pliki autoryzacji są aktualne:
```bash
npm run test:setup
```

### Tryb UI (interfejs graficzny)
```bash
npm run test:e2e:ui
```
W trybie UI wybierz projekt "chromium-ui" z listy projektów.

### Tryb headless (bez interfejsu)
```bash
npm run test:e2e
```

### Tryb headed (z widoczną przeglądarką)
```bash
npm run test:e2e:headed
```

### Tryb debug
```bash
npm run test:e2e:debug
```

## Rozwiązywanie problemów

### Brak autoryzacji w testach
Jeśli testy nie są zalogowane, uruchom:
```bash
npm run test:setup
```

### Testy w trybie UI nie działają
1. Uruchom `npm run test:setup`
2. Uruchom `npm run test:e2e:ui`
3. W interfejsie UI wybierz projekt "chromium-ui"

### Czyszczenie cache autoryzacji
```bash
rm -rf playwright/.auth
npm run test:setup
```

## Struktura testów

- `tests/auth.setup.ts` - Konfiguracja autoryzacji dla różnych ról
- `tests/admin-*.spec.ts` - Testy dla panelu admina
- `tests/therapist-*.spec.ts` - Testy dla terapeuty
- `tests/client-*.spec.ts` - Testy dla klienta
- `tests/*.spec.ts` - Pozostałe testy ogólne

## Pliki autoryzacji

Testy używają zapisanych stanów autoryzacji z katalogu `playwright/.auth/`:
- `user.json` - Domyślny użytkownik (klient)
- `admin.json` - Administrator
- `therapist.json` - Terapeuta
- `client.json` - Klient