-- Create therapy system database schema
-- This script initializes the database structure

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'therapist', 'client')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS therapy_classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 1,
    therapist_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vouchers (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    therapy_class_id INTEGER REFERENCES therapy_classes(id) ON DELETE CASCADE,
    purchase_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    total_sessions INTEGER NOT NULL,
    used_sessions INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_sessions CHECK (used_sessions <= total_sessions)
);

CREATE TABLE IF NOT EXISTS voucher_codes (
    id SERIAL PRIMARY KEY,
    voucher_id INTEGER REFERENCES vouchers(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL,
    is_spare BOOLEAN DEFAULT false,
    is_used BOOLEAN DEFAULT false,
    used_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    therapy_class_id INTEGER REFERENCES therapy_classes(id) ON DELETE CASCADE,
    session_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    therapy_class_id INTEGER REFERENCES therapy_classes(id) ON DELETE CASCADE,
    session_date TIMESTAMP NOT NULL,
    voucher_code_id INTEGER REFERENCES voucher_codes(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, therapy_class_id, session_date)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_vouchers_client ON vouchers(client_id);
CREATE INDEX idx_vouchers_class ON vouchers(therapy_class_id);
CREATE INDEX idx_voucher_codes_voucher ON voucher_codes(voucher_id);
CREATE INDEX idx_voucher_codes_code ON voucher_codes(code);
CREATE INDEX idx_sessions_class ON sessions(therapy_class_id);
CREATE INDEX idx_sessions_date ON sessions(session_date);
CREATE INDEX idx_reservations_client ON reservations(client_id);
CREATE INDEX idx_reservations_class ON reservations(therapy_class_id);
CREATE INDEX idx_reservations_date ON reservations(session_date);

-- Create views
CREATE OR REPLACE VIEW upcoming_sessions AS
SELECT 
    s.id,
    s.session_date,
    s.status,
    tc.name as class_name,
    tc.description as class_description,
    tc.duration_minutes,
    tc.capacity,
    u.name as therapist_name,
    u.email as therapist_email,
    (SELECT COUNT(*) FROM reservations r WHERE r.therapy_class_id = tc.id AND r.session_date = s.session_date AND r.status = 'confirmed') as confirmed_reservations
FROM sessions s
JOIN therapy_classes tc ON s.therapy_class_id = tc.id
LEFT JOIN users u ON tc.therapist_id = u.id
WHERE s.session_date > CURRENT_TIMESTAMP
    AND s.status = 'scheduled'
ORDER BY s.session_date;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapy_classes_updated_at BEFORE UPDATE ON therapy_classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vouchers_updated_at BEFORE UPDATE ON vouchers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voucher_codes_updated_at BEFORE UPDATE ON voucher_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE therapy_system TO therapy_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO therapy_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO therapy_user;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO therapy_user;