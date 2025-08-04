-- Script to create database and user for EduPoint Voucher System
-- Run this script as PostgreSQL admin user
-- 
-- Connection details for admin:
-- Host: 10.0.0.4
-- User: postgresql
-- Password: GxYJsbzz87.Wg2@

-- Create user for the application
CREATE USER therapy_user WITH PASSWORD 'xNXRq/JKmYJClB7pazpcEgh6LowwdwA/VMmHo1j/KEU=';

-- Create database
CREATE DATABASE therapy_system_prod OWNER therapy_user;

-- Grant all privileges on database to user
GRANT ALL PRIVILEGES ON DATABASE therapy_system_prod TO therapy_user;

-- Connect to the new database
\c therapy_system_prod

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO therapy_user;
GRANT CREATE ON SCHEMA public TO therapy_user;

-- Create tables (if not using migrations)
-- This matches the schema from backend/database/init/01_schema.sql

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS therapy_classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    max_participants INTEGER NOT NULL,
    therapist_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vouchers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_backup BOOLEAN DEFAULT false,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    voucher_id INTEGER REFERENCES vouchers(id),
    class_id INTEGER REFERENCES therapy_classes(id),
    client_id INTEGER REFERENCES users(id),
    scheduled_at TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_vouchers_code ON vouchers(code);
CREATE INDEX idx_reservations_scheduled ON reservations(scheduled_at);
CREATE INDEX idx_reservations_status ON reservations(status);

-- Grant ownership of tables to therapy_user
ALTER TABLE users OWNER TO therapy_user;
ALTER TABLE therapy_classes OWNER TO therapy_user;
ALTER TABLE vouchers OWNER TO therapy_user;
ALTER TABLE reservations OWNER TO therapy_user;

-- Insert initial data
-- Default admin user (password: admin123)
INSERT INTO users (email, hashed_password, full_name, role) 
VALUES ('admin@therapy.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiGH7ySQhyGK', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Default therapist (password: admin123)
INSERT INTO users (email, hashed_password, full_name, role) 
VALUES ('john@therapy.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiGH7ySQhyGK', 'John Smith', 'therapist')
ON CONFLICT (email) DO NOTHING;

-- Default client (password: admin123)
INSERT INTO users (email, hashed_password, full_name, role) 
VALUES ('client@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiGH7ySQhyGK', 'Test Client', 'client')
ON CONFLICT (email) DO NOTHING;

-- Default therapy classes
INSERT INTO therapy_classes (name, description, duration_minutes, max_participants, therapist_id)
SELECT 'Cognitive Behavioral Therapy', 'CBT session focusing on thought patterns', 60, 1, id
FROM users WHERE email = 'john@therapy.com'
ON CONFLICT DO NOTHING;

INSERT INTO therapy_classes (name, description, duration_minutes, max_participants, therapist_id)
SELECT 'Mindfulness Meditation', 'Guided meditation and relaxation techniques', 45, 5, id
FROM users WHERE email = 'john@therapy.com'
ON CONFLICT DO NOTHING;

-- Show created objects
\dt
\du

-- Test connection
SELECT current_database(), current_user;