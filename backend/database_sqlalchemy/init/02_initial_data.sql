-- Insert initial data
USE therapy_system;

-- Insert admin user (password: admin123)
INSERT INTO users (id, email, name, role, password_hash) VALUES
('admin-1', 'admin@therapy.com', 'Admin User', 'admin', '$2b$12$Xd3RZPUJU7XfVNgQfBWOmuaSO/H8XxBGfm.oU5xV5O6ROFDgHTQYe');

-- Insert therapists (password: admin123 for all)
INSERT INTO users (id, email, name, role, password_hash) VALUES
('therapist-1', 'john@therapy.com', 'John Smith', 'therapist', '$2b$12$Xd3RZPUJU7XfVNgQfBWOmuaSO/H8XxBGfm.oU5xV5O6ROFDgHTQYe'),
('therapist-2', 'jane@therapy.com', 'Jane Doe', 'therapist', '$2b$12$Xd3RZPUJU7XfVNgQfBWOmuaSO/H8XxBGfm.oU5xV5O6ROFDgHTQYe'),
('therapist-3', 'mark@therapy.com', 'Mark Johnson', 'therapist', '$2b$12$Xd3RZPUJU7XfVNgQfBWOmuaSO/H8XxBGfm.oU5xV5O6ROFDgHTQYe');

-- Insert test client (password: admin123)
INSERT INTO users (id, email, name, role, password_hash) VALUES
('client-1', 'client@example.com', 'Test Client', 'client', '$2b$12$Xd3RZPUJU7XfVNgQfBWOmuaSO/H8XxBGfm.oU5xV5O6ROFDgHTQYe');

-- Insert therapy classes
INSERT INTO therapy_classes (id, name, description, therapist_id, day_of_week, time, duration_minutes, max_participants) VALUES
('class-1', 'Cognitive Behavioral Therapy', 'Individual CBT sessions focusing on thought patterns and behaviors', 'therapist-1', 0, '13:00:00', 60, 1),
('class-2', 'Mindfulness Meditation', 'Group meditation and mindfulness practice', 'therapist-2', 2, '15:00:00', 90, 5),
('class-3', 'Art Therapy', 'Express emotions through creative art activities', 'therapist-1', 4, '10:00:00', 120, 1),
('class-4', 'Family Therapy', 'Sessions for families to improve communication and resolve conflicts', 'therapist-3', 1, '14:00:00', 90, 4),
('class-5', 'Stress Management Workshop', 'Learn techniques to manage and reduce stress', 'therapist-2', 3, '16:00:00', 60, 8);

-- Insert sample voucher for testing
INSERT INTO vouchers (id, client_id, activated_at) VALUES
('voucher-1', 'client-1', NOW());

-- Insert voucher codes (10 regular + 2 backup)
INSERT INTO voucher_codes (id, code, voucher_id, is_backup, status, max_uses) VALUES
('code-1', 'ABC12345', 'voucher-1', FALSE, 'used', 1),
('code-2', 'DEF67890', 'voucher-1', FALSE, 'active', 1),
('code-3', 'GHI11111', 'voucher-1', FALSE, 'active', 1),
('code-4', 'JKL22222', 'voucher-1', FALSE, 'active', 1),
('code-5', 'MNO33333', 'voucher-1', FALSE, 'active', 1),
('code-6', 'PQR44444', 'voucher-1', FALSE, 'active', 1),
('code-7', 'STU55555', 'voucher-1', FALSE, 'active', 1),
('code-8', 'VWX66666', 'voucher-1', FALSE, 'active', 1),
('code-9', 'YZA77777', 'voucher-1', FALSE, 'active', 1),
('code-10', 'BCD88888', 'voucher-1', FALSE, 'active', 1),
('code-11', 'EFG99999', 'voucher-1', TRUE, 'active', 1),
('code-12', 'HIJ00000', 'voucher-1', TRUE, 'active', 1);

-- Insert sample reservation
INSERT INTO reservations (id, voucher_code_id, therapy_class_id, client_id, start_date) VALUES
('reservation-1', 'code-1', 'class-1', 'client-1', CURDATE());

-- Generate sessions for the reservation (10 weeks)
CALL generate_weekly_sessions('reservation-1', CURDATE(), 10);