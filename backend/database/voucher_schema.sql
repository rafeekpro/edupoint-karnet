-- Voucher and Session Management Schema

-- Client vouchers (purchased packages)
CREATE TABLE IF NOT EXISTS client_vouchers (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    voucher_type_id INTEGER NOT NULL REFERENCES voucher_types(id),
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    
    -- Session counts
    sessions_total INTEGER NOT NULL,
    sessions_used INTEGER DEFAULT 0,
    sessions_remaining INTEGER GENERATED ALWAYS AS (sessions_total - sessions_used) STORED,
    backup_sessions_total INTEGER DEFAULT 0,
    backup_sessions_used INTEGER DEFAULT 0,
    backup_sessions_remaining INTEGER GENERATED ALWAYS AS (backup_sessions_total - backup_sessions_used) STORED,
    
    -- Validity
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'exhausted', 'cancelled')),
    
    -- Payment info
    price_paid DECIMAL(10, 2),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Therapy sessions
CREATE TABLE IF NOT EXISTS therapy_sessions (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES users(id),
    therapist_id INTEGER NOT NULL REFERENCES users(id),
    voucher_id INTEGER NOT NULL REFERENCES client_vouchers(id),
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    
    -- Session details
    session_date DATE NOT NULL,
    session_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    session_type VARCHAR(20) CHECK (session_type IN ('individual', 'group', 'online')),
    location VARCHAR(200),
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'confirmed', 'completed', 'cancelled', 
        'no_show', 'rescheduled', 'backup_used'
    )),
    
    -- Backup session tracking
    is_backup_session BOOLEAN DEFAULT FALSE,
    original_session_id INTEGER REFERENCES therapy_sessions(id),
    
    -- Notes and preparation
    therapist_notes TEXT,
    preparation_message TEXT,
    preparation_sent_at TIMESTAMP,
    client_feedback TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancelled_reason TEXT
);

-- Reschedule requests
CREATE TABLE IF NOT EXISTS reschedule_requests (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES therapy_sessions(id),
    requested_by INTEGER NOT NULL REFERENCES users(id),
    
    -- Current schedule
    current_date DATE NOT NULL,
    current_time TIME NOT NULL,
    
    -- Requested schedule
    preferred_date DATE NOT NULL,
    preferred_time TIME NOT NULL,
    alternative_date DATE,
    alternative_time TIME,
    
    -- Request details
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
    
    -- Response
    responded_by INTEGER REFERENCES users(id),
    response_message TEXT,
    new_session_id INTEGER REFERENCES therapy_sessions(id),
    
    -- Timestamps
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP
);

-- Session purchases (individual sessions)
CREATE TABLE IF NOT EXISTS session_purchases (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES users(id),
    voucher_id INTEGER REFERENCES client_vouchers(id),
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    
    -- Purchase details
    sessions_count INTEGER NOT NULL,
    price_per_session DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    
    -- Payment
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Client-Therapist assignments
CREATE TABLE IF NOT EXISTS client_therapist_assignments (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES users(id),
    therapist_id INTEGER NOT NULL REFERENCES users(id),
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    
    -- Assignment details
    assigned_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
    notes TEXT,
    
    -- Preferences
    preferred_days VARCHAR(50), -- JSON array of days
    preferred_times VARCHAR(100), -- JSON array of time slots
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(client_id, therapist_id, organization_id)
);

-- Voucher notifications
CREATE TABLE IF NOT EXISTS voucher_notifications (
    id SERIAL PRIMARY KEY,
    voucher_id INTEGER NOT NULL REFERENCES client_vouchers(id),
    client_id INTEGER NOT NULL REFERENCES users(id),
    
    -- Notification details
    type VARCHAR(50) CHECK (type IN (
        'expiry_warning', 'sessions_low', 'payment_reminder',
        'session_reminder', 'preparation_required', 'reschedule_approved',
        'reschedule_rejected', 'backup_used', 'voucher_expired'
    )),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_client_vouchers_client ON client_vouchers(client_id);
CREATE INDEX idx_client_vouchers_status ON client_vouchers(status);
CREATE INDEX idx_client_vouchers_expiry ON client_vouchers(expiry_date);

CREATE INDEX idx_therapy_sessions_client ON therapy_sessions(client_id);
CREATE INDEX idx_therapy_sessions_therapist ON therapy_sessions(therapist_id);
CREATE INDEX idx_therapy_sessions_date ON therapy_sessions(session_date);
CREATE INDEX idx_therapy_sessions_status ON therapy_sessions(status);
CREATE INDEX idx_therapy_sessions_voucher ON therapy_sessions(voucher_id);

CREATE INDEX idx_reschedule_requests_session ON reschedule_requests(session_id);
CREATE INDEX idx_reschedule_requests_status ON reschedule_requests(status);

CREATE INDEX idx_client_therapist_client ON client_therapist_assignments(client_id);
CREATE INDEX idx_client_therapist_therapist ON client_therapist_assignments(therapist_id);

CREATE INDEX idx_voucher_notifications_client ON voucher_notifications(client_id);
CREATE INDEX idx_voucher_notifications_read ON voucher_notifications(is_read);

-- Views for easier queries
CREATE OR REPLACE VIEW active_vouchers AS
SELECT 
    cv.*,
    vt.name as voucher_type_name,
    vt.description as voucher_type_description,
    o.name as organization_name,
    u.name as client_name,
    u.email as client_email
FROM client_vouchers cv
JOIN voucher_types vt ON cv.voucher_type_id = vt.id
JOIN organizations o ON cv.organization_id = o.id
JOIN users u ON cv.client_id = u.id
WHERE cv.status = 'active' AND cv.expiry_date >= CURRENT_DATE;

CREATE OR REPLACE VIEW upcoming_sessions AS
SELECT 
    ts.*,
    c.name as client_name,
    c.email as client_email,
    t.name as therapist_name,
    t.email as therapist_email,
    cv.sessions_remaining,
    cv.backup_sessions_remaining
FROM therapy_sessions ts
JOIN users c ON ts.client_id = c.id
JOIN users t ON ts.therapist_id = t.id
JOIN client_vouchers cv ON ts.voucher_id = cv.id
WHERE ts.status IN ('scheduled', 'confirmed') 
AND ts.session_date >= CURRENT_DATE
ORDER BY ts.session_date, ts.session_time;

-- Triggers for automatic updates
CREATE OR REPLACE FUNCTION update_voucher_session_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        IF NEW.is_backup_session THEN
            UPDATE client_vouchers 
            SET backup_sessions_used = backup_sessions_used + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.voucher_id;
        ELSE
            UPDATE client_vouchers 
            SET sessions_used = sessions_used + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.voucher_id;
        END IF;
    END IF;
    
    IF NEW.status = 'no_show' AND OLD.status != 'no_show' THEN
        UPDATE client_vouchers 
        SET sessions_used = sessions_used + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.voucher_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_voucher_sessions
AFTER UPDATE ON therapy_sessions
FOR EACH ROW
EXECUTE FUNCTION update_voucher_session_count();

-- Function to check and update voucher status
CREATE OR REPLACE FUNCTION check_voucher_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if voucher is exhausted
    IF NEW.sessions_remaining = 0 AND NEW.backup_sessions_remaining = 0 THEN
        NEW.status = 'exhausted';
    END IF;
    
    -- Check if voucher is expired
    IF NEW.expiry_date < CURRENT_DATE THEN
        NEW.status = 'expired';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_voucher_status_trigger
BEFORE UPDATE ON client_vouchers
FOR EACH ROW
EXECUTE FUNCTION check_voucher_status();