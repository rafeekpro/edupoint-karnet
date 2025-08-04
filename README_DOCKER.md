# System Terapii - Docker & MySQL

## Przegląd

System został rozszerzony o obsługę Docker Compose oraz bazę danych MySQL. Struktura projektu zawiera:

- **Backend**: FastAPI z SQLAlchemy i MySQL
- **Frontend**: React z TypeScript i Material-UI
- **Baza danych**: MySQL 8.0
- **Proxy**: Nginx dla routingu

## Struktura bazy danych

### Tabele:
1. **users** - użytkownicy systemu (admin, terapeuta, klient)
2. **therapy_classes** - klasy terapeutyczne
3. **vouchers** - karnety
4. **voucher_codes** - kody karnetów (10 regularnych + 2 zapasowe)
5. **reservations** - rezerwacje
6. **sessions** - sesje terapeutyczne

### Widoki:
- **upcoming_sessions** - nadchodzące sesje z pełnymi informacjami

### Procedury:
- **generate_weekly_sessions** - automatyczne generowanie sesji cyklicznych

## Uruchomienie systemu

### 1. Wymagania
- Docker Desktop
- Docker Compose v2.0+
- Min. 4GB RAM dla Docker

### 2. Szybki start
```bash
# Skopiuj plik konfiguracyjny
cp .env.example .env

# Uruchom system
./start.sh
```

### 3. Testowanie
```bash
./test-system.sh
```

## Dostęp do systemu

### Aplikacja:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Pełna aplikacja (Nginx): http://localhost

### Domyślne konta:
- **Administrator**: admin@therapy.com / admin123
- **Terapeuta**: john@therapy.com / admin123
- **Klient**: client@example.com / admin123

### Baza danych:
- Host: localhost
- Port: 3306
- Użytkownik: therapy_user
- Hasło: therapy_password
- Baza: therapy_system

## Komendy Docker

### Zarządzanie usługami
```bash
# Uruchom wszystkie usługi
docker-compose up -d

# Zatrzymaj usługi
docker-compose down

# Restart usługi
docker-compose restart backend

# Podgląd logów
docker-compose logs -f
docker-compose logs -f backend
```

### Dostęp do kontenerów
```bash
# MySQL CLI
docker exec -it therapy-mysql mysql -u therapy_user -ptherapy_password therapy_system

# Backend shell
docker exec -it therapy-backend bash

# Uruchom testy backend
docker exec therapy-backend pytest
```

### Zarządzanie bazą danych
```bash
# Backup
docker exec therapy-mysql mysqldump -u therapy_user -ptherapy_password therapy_system > backup.sql

# Restore
docker exec -i therapy-mysql mysql -u therapy_user -ptherapy_password therapy_system < backup.sql
```

## Rozwój

### Backend
- Kod jest montowany jako volume - zmiany są widoczne natychmiast
- Auto-reload włączony w trybie development
- Dodawanie pakietów: edytuj `backend/requirements.txt` i przebuduj kontener

### Frontend
- Hot-reload włączony
- Kod montowany jako volume
- Dodawanie pakietów: edytuj `frontend/package.json` i przebuduj kontener

### Dodawanie migracji bazy danych
```bash
# Utwórz migrację
docker exec therapy-backend alembic revision -m "opis zmiany"

# Zastosuj migracje
docker exec therapy-backend alembic upgrade head
```

## Struktura plików

```
therapy-system/
├── docker-compose.yml          # Główna konfiguracja Docker
├── docker-compose.override.yml # Nadpisania dla development
├── .env.example               # Przykładowa konfiguracja
├── start.sh                   # Skrypt startowy
├── test-system.sh            # Skrypt testowy
├── backend/
│   ├── Dockerfile            # Obraz Docker dla backend
│   ├── database/
│   │   ├── init/            # Skrypty inicjalizacji MySQL
│   │   ├── config.py        # Konfiguracja SQLAlchemy
│   │   └── models.py        # Modele bazy danych
│   └── requirements.txt      # Zależności Python
├── frontend/
│   ├── Dockerfile            # Obraz Docker dla frontend
│   └── Dockerfile.prod       # Obraz produkcyjny
└── nginx/
    └── nginx.conf           # Konfiguracja proxy

```

## Rozwiązywanie problemów

### Usługi nie startują
1. Sprawdź czy Docker działa
2. Sprawdź czy porty są wolne
3. Zobacz logi: `docker-compose logs`

### Błędy połączenia z bazą
1. Poczekaj 30-60 sekund na inicjalizację MySQL
2. Sprawdź dane w `.env`
3. Sprawdź status: `docker-compose ps`

### Czysty restart
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## Produkcja

Dla wdrożenia produkcyjnego:
1. Zmień wszystkie hasła w `.env`
2. Ustaw bezpieczny `JWT_SECRET_KEY`
3. Ustaw `ENVIRONMENT=production`
4. Skonfiguruj SSL w nginx
5. Włącz backupy bazy danych
6. Skonfiguruj monitoring