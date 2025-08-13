-- Skrypt do rekonfiguracji bazy produkcyjnej
-- Usuń starą bazę i użytkownika
DROP DATABASE IF EXISTS therapy_system;
DROP USER IF EXISTS therapy_user;

-- Utwórz nowego użytkownika
CREATE USER voucherskit WITH PASSWORD '1hE#*%lK*!OT';

-- Utwórz nową bazę danych
CREATE DATABASE voucherskit OWNER voucherskit;

-- Nadaj wszystkie uprawnienia użytkownikowi na jego bazie
GRANT ALL PRIVILEGES ON DATABASE voucherskit TO voucherskit;

-- Połącz się z nową bazą i nadaj uprawnienia na schemacie
\c voucherskit
GRANT ALL ON SCHEMA public TO voucherskit;