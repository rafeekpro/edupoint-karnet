-- Sample data for therapy system
-- This script will be executed after init.sql

-- Clear existing data
TRUNCATE TABLE sessions, reservations, voucher_codes, vouchers, therapy_classes, users RESTART IDENTITY CASCADE;

-- Insert sample users
INSERT INTO users (email, name, password_hash, role, is_active, created_at) VALUES
-- Passwords: admin123, therapist123, client123
('admin@voucherskit.com', 'Admin User', '$2b$12$pmTEruDHxOnVHoijSZ4lZ.9Ttct8DEziT/n8omlOTSAepYuQ35vhe', 'admin', true, NOW()),
('therapist@voucherskit.com', 'Therapist User', '$2b$12$3RSKflaXTO7IUOaCsVEe1O3HYtmkztDfo193rDwci/yCQVUWzBFwK', 'therapist', true, NOW()),
('client@voucherskit.com', 'Client User', '$2b$12$98D7Jd1t0Ihv4QNFcmVlZukpJ0qxRcd76vrp72qMYIJPfWEjN5ewW', 'client', true, NOW()),
-- Additional users with admin123 password
('therapist1@voucherskit.com', 'Anna Kowalska', '$2b$12$pmTEruDHxOnVHoijSZ4lZ.9Ttct8DEziT/n8omlOTSAepYuQ35vhe', 'therapist', true, NOW()),
('therapist2@voucherskit.com', 'Jan Nowak', '$2b$12$pmTEruDHxOnVHoijSZ4lZ.9Ttct8DEziT/n8omlOTSAepYuQ35vhe', 'therapist', true, NOW()),
('client1@example.com', 'Maria Wiśniewska', '$2b$12$pmTEruDHxOnVHoijSZ4lZ.9Ttct8DEziT/n8omlOTSAepYuQ35vhe', 'client', true, NOW()),
('client2@example.com', 'Piotr Zieliński', '$2b$12$pmTEruDHxOnVHoijSZ4lZ.9Ttct8DEziT/n8omlOTSAepYuQ35vhe', 'client', true, NOW()),
('client3@example.com', 'Katarzyna Lewandowska', '$2b$12$pmTEruDHxOnVHoijSZ4lZ.9Ttct8DEziT/n8omlOTSAepYuQ35vhe', 'client', true, NOW());

-- Insert therapy classes (therapist IDs: 2=therapist@voucherskit.com, 4=therapist1, 5=therapist2)
INSERT INTO therapy_classes (name, description, duration_minutes, capacity, therapist_id, created_at) VALUES
('Terapia Grupowa - Poniedziałek', 'Sesja terapii grupowej dla dorosłych', 90, 8, 2, NOW()),
('Terapia Indywidualna', 'Sesje indywidualne z terapeutą', 60, 1, 2, NOW()),
('Warsztaty Relaksacyjne', 'Techniki relaksacji i mindfulness', 120, 12, 4, NOW()),
('Terapia Rodzinna', 'Sesje dla całych rodzin', 90, 4, 5, NOW()),
('Grupa Wsparcia', 'Grupa wsparcia dla osób z depresją', 90, 10, 2, NOW());

-- Insert vouchers (client IDs: 3=client@voucherskit.com, 6=client1, 7=client2, 8=client3)
INSERT INTO vouchers (client_id, therapy_class_id, purchase_date, valid_until, total_sessions, used_sessions, created_at) VALUES
(3, 1, NOW() - INTERVAL '30 days', NOW() + INTERVAL '60 days', 10, 3, NOW()),
(3, 2, NOW() - INTERVAL '15 days', NOW() + INTERVAL '75 days', 5, 1, NOW()),
(6, 1, NOW() - INTERVAL '7 days', NOW() + INTERVAL '83 days', 10, 0, NOW()),
(6, 3, NOW(), NOW() + INTERVAL '90 days', 8, 0, NOW()),
(7, 4, NOW() - INTERVAL '20 days', NOW() + INTERVAL '70 days', 6, 2, NOW()),
(8, 5, NOW(), NOW() + INTERVAL '90 days', 10, 0, NOW());

-- Insert voucher codes (10 regular + 2 spare for each voucher)
INSERT INTO voucher_codes (voucher_id, code, is_spare, is_used, created_at) VALUES
-- Voucher 1 codes
(1, 'VK-2024-001-01', false, true, NOW()),
(1, 'VK-2024-001-02', false, true, NOW()),
(1, 'VK-2024-001-03', false, true, NOW()),
(1, 'VK-2024-001-04', false, false, NOW()),
(1, 'VK-2024-001-05', false, false, NOW()),
(1, 'VK-2024-001-06', false, false, NOW()),
(1, 'VK-2024-001-07', false, false, NOW()),
(1, 'VK-2024-001-08', false, false, NOW()),
(1, 'VK-2024-001-09', false, false, NOW()),
(1, 'VK-2024-001-10', false, false, NOW()),
(1, 'VK-2024-001-S1', true, false, NOW()),
(1, 'VK-2024-001-S2', true, false, NOW()),

-- Voucher 2 codes  
(2, 'VK-2024-002-01', false, true, NOW()),
(2, 'VK-2024-002-02', false, false, NOW()),
(2, 'VK-2024-002-03', false, false, NOW()),
(2, 'VK-2024-002-04', false, false, NOW()),
(2, 'VK-2024-002-05', false, false, NOW()),
(2, 'VK-2024-002-S1', true, false, NOW()),
(2, 'VK-2024-002-S2', true, false, NOW()),

-- Voucher 3 codes (unused)
(3, 'VK-2024-003-01', false, false, NOW()),
(3, 'VK-2024-003-02', false, false, NOW()),
(3, 'VK-2024-003-03', false, false, NOW()),
(3, 'VK-2024-003-04', false, false, NOW()),
(3, 'VK-2024-003-05', false, false, NOW()),
(3, 'VK-2024-003-06', false, false, NOW()),
(3, 'VK-2024-003-07', false, false, NOW()),
(3, 'VK-2024-003-08', false, false, NOW()),
(3, 'VK-2024-003-09', false, false, NOW()),
(3, 'VK-2024-003-10', false, false, NOW()),
(3, 'VK-2024-003-S1', true, false, NOW()),
(3, 'VK-2024-003-S2', true, false, NOW());

-- Insert reservations
INSERT INTO reservations (client_id, therapy_class_id, session_date, status, created_at) VALUES
(4, 1, NOW() + INTERVAL '1 day', 'confirmed', NOW()),
(4, 2, NOW() + INTERVAL '3 days', 'confirmed', NOW()),
(5, 1, NOW() + INTERVAL '1 day', 'confirmed', NOW()),
(5, 3, NOW() + INTERVAL '2 days', 'pending', NOW()),
(6, 4, NOW() + INTERVAL '5 days', 'confirmed', NOW()),
(6, 5, NOW() + INTERVAL '7 days', 'pending', NOW());

-- Insert past sessions
INSERT INTO sessions (therapy_class_id, session_date, status, created_at) VALUES
(1, NOW() - INTERVAL '7 days', 'completed', NOW() - INTERVAL '7 days'),
(1, NOW() - INTERVAL '14 days', 'completed', NOW() - INTERVAL '14 days'),
(1, NOW() - INTERVAL '21 days', 'completed', NOW() - INTERVAL '21 days'),
(2, NOW() - INTERVAL '5 days', 'completed', NOW() - INTERVAL '5 days'),
(3, NOW() - INTERVAL '3 days', 'completed', NOW() - INTERVAL '3 days');

-- Insert upcoming sessions
INSERT INTO sessions (therapy_class_id, session_date, status, created_at) VALUES
(1, NOW() + INTERVAL '1 day' + TIME '10:00:00', 'scheduled', NOW()),
(1, NOW() + INTERVAL '8 days' + TIME '10:00:00', 'scheduled', NOW()),
(2, NOW() + INTERVAL '3 days' + TIME '14:00:00', 'scheduled', NOW()),
(3, NOW() + INTERVAL '2 days' + TIME '16:00:00', 'scheduled', NOW()),
(4, NOW() + INTERVAL '5 days' + TIME '18:00:00', 'scheduled', NOW()),
(5, NOW() + INTERVAL '7 days' + TIME '11:00:00', 'scheduled', NOW());

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO therapy_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO therapy_user;

-- Display summary
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== Sample Data Loaded Successfully ===';
    RAISE NOTICE '';
    RAISE NOTICE 'Test Accounts (password: admin123):';
    RAISE NOTICE '  Admin: admin@voucherskit.com';
    RAISE NOTICE '  Therapist 1: therapist1@voucherskit.com';
    RAISE NOTICE '  Therapist 2: therapist2@voucherskit.com';
    RAISE NOTICE '  Client 1: client1@example.com';
    RAISE NOTICE '  Client 2: client2@example.com';
    RAISE NOTICE '  Client 3: client3@example.com';
    RAISE NOTICE '';
    RAISE NOTICE 'Database: therapy_system';
    RAISE NOTICE 'Adminer: http://localhost:8080';
    RAISE NOTICE 'API: http://localhost:8000';
    RAISE NOTICE 'Frontend: http://localhost:3000';
    RAISE NOTICE '';
END $$;