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

**WAŻNE: Wybierz odpowiedni projekt w zależności od tego, jaką stronę testujesz:**
- `ui-client` - dla testowania stron klienta (/client/*)
- `ui-therapist` - dla testowania stron terapeuty (/therapist/*)
- `ui-admin` - dla testowania stron administratora (/admin/*)

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

### Błąd "Access Denied" w testach
Ten błąd występuje, gdy próbujesz testować stronę z niewłaściwą rolą użytkownika.

**Rozwiązanie:**
- Dla stron `/admin/*` → wybierz projekt `ui-admin`
- Dla stron `/therapist/*` → wybierz projekt `ui-therapist`
- Dla stron `/client/*` → wybierz projekt `ui-client`

### Testy w trybie UI nie działają
1. Uruchom `npm run test:setup`
2. Uruchom `npm run test:e2e:ui`
3. W interfejsie UI wybierz odpowiedni projekt dla twojej roli

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