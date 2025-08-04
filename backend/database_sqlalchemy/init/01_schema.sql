-- Create database schema for therapy system
CREATE DATABASE IF NOT EXISTS therapy_system;
USE therapy_system;

-- Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'therapist', 'client') NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Therapy classes table
CREATE TABLE therapy_classes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    therapist_id VARCHAR(36) NOT NULL,
    day_of_week TINYINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    time TIME NOT NULL,
    duration_minutes INT NOT NULL,
    max_participants INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (therapist_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_therapist (therapist_id),
    INDEX idx_day_time (day_of_week, time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vouchers table
CREATE TABLE vouchers (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    client_id VARCHAR(36),
    activated_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_client (client_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Voucher codes table
CREATE TABLE voucher_codes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    code VARCHAR(8) UNIQUE NOT NULL,
    voucher_id VARCHAR(36) NOT NULL,
    is_backup BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'used', 'expired') DEFAULT 'active',
    used_count INT DEFAULT 0,
    max_uses INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE CASCADE,
    INDEX idx_code (code),
    INDEX idx_voucher (voucher_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reservations table
CREATE TABLE reservations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    voucher_code_id VARCHAR(36) NOT NULL,
    therapy_class_id VARCHAR(36) NOT NULL,
    client_id VARCHAR(36) NOT NULL,
    start_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (voucher_code_id) REFERENCES voucher_codes(id) ON DELETE RESTRICT,
    FOREIGN KEY (therapy_class_id) REFERENCES therapy_classes(id) ON DELETE RESTRICT,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_client (client_id),
    INDEX idx_therapy_class (therapy_class_id),
    INDEX idx_voucher_code (voucher_code_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions table
CREATE TABLE sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    reservation_id VARCHAR(36) NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    actual_date DATE,
    actual_time TIME,
    status ENUM('scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show') DEFAULT 'scheduled',
    therapist_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
    INDEX idx_reservation (reservation_id),
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_status (status),
    INDEX idx_date_time (scheduled_date, scheduled_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
WHERE s.scheduled_date >= CURDATE()
    AND s.status IN ('scheduled', 'rescheduled');

-- Create stored procedures
DELIMITER //

CREATE PROCEDURE generate_weekly_sessions(
    IN p_reservation_id VARCHAR(36),
    IN p_start_date DATE,
    IN p_num_weeks INT
)
BEGIN
    DECLARE v_therapy_class_id VARCHAR(36);
    DECLARE v_day_of_week INT;
    DECLARE v_time TIME;
    DECLARE v_current_date DATE;
    DECLARE v_week_count INT DEFAULT 0;
    
    -- Get therapy class details
    SELECT tc.id, tc.day_of_week, tc.time
    INTO v_therapy_class_id, v_day_of_week, v_time
    FROM reservations r
    JOIN therapy_classes tc ON r.therapy_class_id = tc.id
    WHERE r.id = p_reservation_id;
    
    -- Find the first occurrence of the therapy class day
    SET v_current_date = p_start_date;
    WHILE WEEKDAY(v_current_date) != v_day_of_week DO
        SET v_current_date = DATE_ADD(v_current_date, INTERVAL 1 DAY);
    END WHILE;
    
    -- Generate sessions for specified number of weeks
    WHILE v_week_count < p_num_weeks DO
        INSERT INTO sessions (reservation_id, scheduled_date, scheduled_time)
        VALUES (p_reservation_id, v_current_date, v_time);
        
        SET v_current_date = DATE_ADD(v_current_date, INTERVAL 7 DAY);
        SET v_week_count = v_week_count + 1;
    END WHILE;
END//

DELIMITER ;