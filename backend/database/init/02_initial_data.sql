-- Insert initial data for PostgreSQL

-- Insert admin user (password: admin123)
INSERT INTO users (id, email, name, role, password_hash) VALUES
('00000000-0000-0000-0000-000000000001'::uuid, 'admin@therapy.com', 'Admin User', 'admin', '$2b$12$Xd3RZPUJU7XfVNgQfBWOmuaSO/H8XxBGfm.oU5xV5O6ROFDgHTQYe');

-- Insert therapists (password: admin123 for all)
INSERT INTO users (id, email, name, role, password_hash) VALUES
('00000000-0000-0000-0000-000000000002'::uuid, 'john@therapy.com', 'John Smith', 'therapist', '$2b$12$Xd3RZPUJU7XfVNgQfBWOmuaSO/H8XxBGfm.oU5xV5O6ROFDgHTQYe'),
('00000000-0000-0000-0000-000000000003'::uuid, 'jane@therapy.com', 'Jane Doe', 'therapist', '$2b$12$Xd3RZPUJU7XfVNgQfBWOmuaSO/H8XxBGfm.oU5xV5O6ROFDgHTQYe'),
('00000000-0000-0000-0000-000000000004'::uuid, 'mark@therapy.com', 'Mark Johnson', 'therapist', '$2b$12$Xd3RZPUJU7XfVNgQfBWOmuaSO/H8XxBGfm.oU5xV5O6ROFDgHTQYe');

-- Insert test client (password: admin123)
INSERT INTO users (id, email, name, role, password_hash) VALUES
('00000000-0000-0000-0000-000000000005'::uuid, 'client@example.com', 'Test Client', 'client', '$2b$12$Xd3RZPUJU7XfVNgQfBWOmuaSO/H8XxBGfm.oU5xV5O6ROFDgHTQYe');

-- Insert therapy classes
INSERT INTO therapy_classes (id, name, description, therapist_id, day_of_week, time, duration_minutes, max_participants) VALUES
('00000000-0000-0000-0000-000000000010'::uuid, 'Cognitive Behavioral Therapy', 'Individual CBT sessions focusing on thought patterns and behaviors', '00000000-0000-0000-0000-000000000002'::uuid, 0, '13:00:00', 60, 1),
('00000000-0000-0000-0000-000000000011'::uuid, 'Mindfulness Meditation', 'Group meditation and mindfulness practice', '00000000-0000-0000-0000-000000000003'::uuid, 2, '15:00:00', 90, 5),
('00000000-0000-0000-0000-000000000012'::uuid, 'Art Therapy', 'Express emotions through creative art activities', '00000000-0000-0000-0000-000000000002'::uuid, 4, '10:00:00', 120, 1),
('00000000-0000-0000-0000-000000000013'::uuid, 'Family Therapy', 'Sessions for families to improve communication and resolve conflicts', '00000000-0000-0000-0000-000000000004'::uuid, 1, '14:00:00', 90, 4),
('00000000-0000-0000-0000-000000000014'::uuid, 'Stress Management Workshop', 'Learn techniques to manage and reduce stress', '00000000-0000-0000-0000-000000000003'::uuid, 3, '16:00:00', 60, 8);

-- Insert sample voucher for testing
INSERT INTO vouchers (id, client_id, activated_at) VALUES
('00000000-0000-0000-0000-000000000020'::uuid, '00000000-0000-0000-0000-000000000005'::uuid, NOW());

-- Insert voucher codes (10 regular + 2 backup)
INSERT INTO voucher_codes (id, code, voucher_id, is_backup, status, max_uses) VALUES
('00000000-0000-0000-0000-000000000030'::uuid, 'ABC12345', '00000000-0000-0000-0000-000000000020'::uuid, FALSE, 'used', 1),
('00000000-0000-0000-0000-000000000031'::uuid, 'DEF67890', '00000000-0000-0000-0000-000000000020'::uuid, FALSE, 'active', 1),
('00000000-0000-0000-0000-000000000032'::uuid, 'GHI11111', '00000000-0000-0000-0000-000000000020'::uuid, FALSE, 'active', 1),
('00000000-0000-0000-0000-000000000033'::uuid, 'JKL22222', '00000000-0000-0000-0000-000000000020'::uuid, FALSE, 'active', 1),
('00000000-0000-0000-0000-000000000034'::uuid, 'MNO33333', '00000000-0000-0000-0000-000000000020'::uuid, FALSE, 'active', 1),
('00000000-0000-0000-0000-000000000035'::uuid, 'PQR44444', '00000000-0000-0000-0000-000000000020'::uuid, FALSE, 'active', 1),
('00000000-0000-0000-0000-000000000036'::uuid, 'STU55555', '00000000-0000-0000-0000-000000000020'::uuid, FALSE, 'active', 1),
('00000000-0000-0000-0000-000000000037'::uuid, 'VWX66666', '00000000-0000-0000-0000-000000000020'::uuid, FALSE, 'active', 1),
('00000000-0000-0000-0000-000000000038'::uuid, 'YZA77777', '00000000-0000-0000-0000-000000000020'::uuid, FALSE, 'active', 1),
('00000000-0000-0000-0000-000000000039'::uuid, 'BCD88888', '00000000-0000-0000-0000-000000000020'::uuid, FALSE, 'active', 1),
('00000000-0000-0000-0000-00000000003A'::uuid, 'EFG99999', '00000000-0000-0000-0000-000000000020'::uuid, TRUE, 'active', 1),
('00000000-0000-0000-0000-00000000003B'::uuid, 'HIJ00000', '00000000-0000-0000-0000-000000000020'::uuid, TRUE, 'active', 1);

-- Insert sample reservation
INSERT INTO reservations (id, voucher_code_id, therapy_class_id, client_id, start_date) VALUES
('00000000-0000-0000-0000-000000000040'::uuid, '00000000-0000-0000-0000-000000000030'::uuid, '00000000-0000-0000-0000-000000000010'::uuid, '00000000-0000-0000-0000-000000000005'::uuid, CURRENT_DATE);

-- Generate sessions for the reservation (10 weeks)
SELECT generate_weekly_sessions('00000000-0000-0000-0000-000000000040'::uuid, CURRENT_DATE, 10);