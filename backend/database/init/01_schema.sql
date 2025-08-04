-- Create database schema for therapy system (PostgreSQL)

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'therapist', 'client');
CREATE TYPE code_status AS ENUM ('active', 'used', 'expired');
CREATE TYPE session_status AS ENUM ('scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show');

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Therapy classes table
CREATE TABLE therapy_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    therapist_id UUID NOT NULL,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    time TIME NOT NULL,
    duration_minutes INT NOT NULL,
    max_participants INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (therapist_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_therapy_classes_therapist ON therapy_classes(therapist_id);
CREATE INDEX idx_therapy_classes_day_time ON therapy_classes(day_of_week, time);

-- Vouchers table
CREATE TABLE vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID,
    activated_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_vouchers_client ON vouchers(client_id);

-- Voucher codes table
CREATE TABLE voucher_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(8) UNIQUE NOT NULL,
    voucher_id UUID NOT NULL,
    is_backup BOOLEAN DEFAULT FALSE,
    status code_status DEFAULT 'active',
    used_count INT DEFAULT 0,
    max_uses INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE CASCADE
);

CREATE INDEX idx_voucher_codes_code ON voucher_codes(code);
CREATE INDEX idx_voucher_codes_voucher ON voucher_codes(voucher_id);
CREATE INDEX idx_voucher_codes_status ON voucher_codes(status);

-- Reservations table
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voucher_code_id UUID NOT NULL,
    therapy_class_id UUID NOT NULL,
    client_id UUID NOT NULL,
    start_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (voucher_code_id) REFERENCES voucher_codes(id) ON DELETE RESTRICT,
    FOREIGN KEY (therapy_class_id) REFERENCES therapy_classes(id) ON DELETE RESTRICT,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_reservations_client ON reservations(client_id);
CREATE INDEX idx_reservations_therapy_class ON reservations(therapy_class_id);
CREATE INDEX idx_reservations_voucher_code ON reservations(voucher_code_id);

-- Sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id UUID NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    actual_date DATE,
    actual_time TIME,
    status session_status DEFAULT 'scheduled',
    therapist_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_reservation ON sessions(reservation_id);
CREATE INDEX idx_sessions_scheduled_date ON sessions(scheduled_date);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_date_time ON sessions(scheduled_date, scheduled_time);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapy_classes_updated_at BEFORE UPDATE ON therapy_classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vouchers_updated_at BEFORE UPDATE ON vouchers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voucher_codes_updated_at BEFORE UPDATE ON voucher_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries
CREATE VIEW upcoming_sessions AS
SELECT 
    s.*,
    r.client_id,
    r.therapy_class_id,
    tc.name as therapy_class_name,
    tc.therapist_id,
    u.name as client_name,
    t.name as therapist_name
FROM sessions s
JOIN reservations r ON s.reservation_id = r.id
JOIN therapy_classes tc ON r.therapy_class_id = tc.id
JOIN users u ON r.client_id = u.id
JOIN users t ON tc.therapist_id = t.id
WHERE s.scheduled_date >= CURRENT_DATE
    AND s.status IN ('scheduled', 'rescheduled');

-- Create function to generate weekly sessions
CREATE OR REPLACE FUNCTION generate_weekly_sessions(
    p_reservation_id UUID,
    p_start_date DATE,
    p_num_weeks INT
)
RETURNS VOID AS $$
DECLARE
    v_therapy_class_id UUID;
    v_day_of_week INT;
    v_time TIME;
    v_current_date DATE;
    v_week_count INT := 0;
BEGIN
    -- Get therapy class details
    SELECT tc.id, tc.day_of_week, tc.time
    INTO v_therapy_class_id, v_day_of_week, v_time
    FROM reservations r
    JOIN therapy_classes tc ON r.therapy_class_id = tc.id
    WHERE r.id = p_reservation_id;
    
    -- Find the first occurrence of the therapy class day
    v_current_date := p_start_date;
    WHILE EXTRACT(DOW FROM v_current_date) != v_day_of_week LOOP
        v_current_date := v_current_date + INTERVAL '1 day';
    END LOOP;
    
    -- Generate sessions for specified number of weeks
    WHILE v_week_count < p_num_weeks LOOP
        INSERT INTO sessions (reservation_id, scheduled_date, scheduled_time)
        VALUES (p_reservation_id, v_current_date, v_time);
        
        v_current_date := v_current_date + INTERVAL '7 days';
        v_week_count := v_week_count + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;