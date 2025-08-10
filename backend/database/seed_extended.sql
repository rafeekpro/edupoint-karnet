-- Extended seed data for comprehensive dashboard testing
-- This provides realistic data for all dashboard features

-- Clear existing data (except base users from seed.sql)
TRUNCATE TABLE 
    audit_logs,
    client_vouchers,
    voucher_types,
    organizations,
    sessions,
    reservations,
    voucher_codes,
    vouchers,
    therapy_classes
RESTART IDENTITY CASCADE;

-- Insert organizations
INSERT INTO organizations (name, description, owner_id, is_active, created_at) VALUES
('Centrum Terapii Rodzinnej', 'Specjalizujemy się w terapii rodzinnej i małżeńskiej', 4, true, NOW() - INTERVAL '180 days'),
('Klinika Psychologiczna Harmony', 'Kompleksowa pomoc psychologiczna dla dzieci i dorosłych', 5, true, NOW() - INTERVAL '365 days'),
('Ośrodek Wsparcia Emocjonalnego', 'Grupy wsparcia i terapia indywidualna', 2, true, NOW() - INTERVAL '90 days');

-- Insert voucher types for each organization
INSERT INTO voucher_types (
    organization_id, 
    name, 
    description, 
    sessions_count, 
    backup_sessions_count,
    session_duration_minutes,
    group_size,
    validity_days,
    price,
    booking_advance_days,
    booking_hour_start,
    booking_hour_end,
    is_active,
    created_at
) VALUES
-- Organization 1 voucher types
(1, 'Pakiet Indywidualny 10', 'Terapia indywidualna - 10 sesji', 10, 2, 60, 1, 90, 1500.00, 7, '08:00', '20:00', true, NOW() - INTERVAL '150 days'),
(1, 'Pakiet Grupowy 5', 'Terapia grupowa - 5 sesji', 5, 1, 90, 8, 60, 600.00, 3, '09:00', '18:00', true, NOW() - INTERVAL '150 days'),
(1, 'Pakiet Rodzinny 8', 'Terapia rodzinna - 8 sesji', 8, 2, 120, 4, 120, 2000.00, 14, '10:00', '19:00', true, NOW() - INTERVAL '150 days'),

-- Organization 2 voucher types
(2, 'Konsultacje 3', 'Pakiet 3 konsultacji', 3, 0, 45, 1, 30, 450.00, 2, '08:00', '20:00', true, NOW() - INTERVAL '300 days'),
(2, 'Intensywny 15', 'Program intensywny - 15 sesji', 15, 3, 60, 1, 180, 2250.00, 7, '07:00', '21:00', true, NOW() - INTERVAL '300 days'),
(2, 'Grupa Wsparcia 10', 'Grupa wsparcia - 10 spotkań', 10, 2, 90, 10, 90, 800.00, 5, '16:00', '20:00', true, NOW() - INTERVAL '300 days'),

-- Organization 3 voucher types  
(3, 'Warsztaty 4', 'Cykl 4 warsztatów', 4, 1, 180, 12, 60, 500.00, 7, '10:00', '16:00', true, NOW() - INTERVAL '60 days'),
(3, 'Standard 10', 'Pakiet standardowy - 10 sesji', 10, 2, 60, 1, 90, 1400.00, 3, '08:00', '20:00', true, NOW() - INTERVAL '60 days'),
(3, 'Premium 20', 'Pakiet premium - 20 sesji', 20, 5, 60, 1, 180, 2600.00, 1, '07:00', '21:00', true, NOW() - INTERVAL '60 days');

-- Update existing therapy classes with organization links
UPDATE therapy_classes SET organization_id = 1 WHERE id IN (1, 2);
UPDATE therapy_classes SET organization_id = 2 WHERE id IN (3, 4);
UPDATE therapy_classes SET organization_id = 3 WHERE id = 5;

-- Insert more therapy classes
INSERT INTO therapy_classes (name, description, duration_minutes, capacity, therapist_id, organization_id, created_at) VALUES
('Terapia Poznawczo-Behawioralna', 'CBT dla zaburzeń lękowych', 60, 1, 4, 1, NOW() - INTERVAL '100 days'),
('Mindfulness dla początkujących', 'Wprowadzenie do uważności', 90, 12, 5, 2, NOW() - INTERVAL '200 days'),
('Terapia par', 'Sesje dla par w kryzysie', 90, 2, 2, 3, NOW() - INTERVAL '50 days'),
('Arteterapia', 'Terapia przez sztukę', 120, 8, 4, 1, NOW() - INTERVAL '80 days'),
('Grupa młodzieżowa', 'Wsparcie dla nastolatków', 90, 10, 5, 2, NOW() - INTERVAL '150 days');

-- Insert client vouchers (new structure for purchased vouchers)
INSERT INTO client_vouchers (
    client_id,
    voucher_type_id,
    purchase_date,
    valid_until,
    sessions_total,
    sessions_used,
    sessions_backup,
    sessions_backup_used,
    status,
    created_at
) VALUES
-- Client 3 (client@voucherskit.com) vouchers
(3, 1, NOW() - INTERVAL '30 days', NOW() + INTERVAL '60 days', 10, 4, 2, 0, 'active', NOW() - INTERVAL '30 days'),
(3, 2, NOW() - INTERVAL '15 days', NOW() + INTERVAL '45 days', 5, 1, 1, 0, 'active', NOW() - INTERVAL '15 days'),

-- Client 6 vouchers
(6, 3, NOW() - INTERVAL '20 days', NOW() + INTERVAL '100 days', 8, 2, 2, 0, 'active', NOW() - INTERVAL '20 days'),
(6, 4, NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days', 3, 1, 0, 0, 'active', NOW() - INTERVAL '10 days'),

-- Client 7 vouchers
(7, 5, NOW() - INTERVAL '60 days', NOW() + INTERVAL '120 days', 15, 5, 3, 1, 'active', NOW() - INTERVAL '60 days'),
(7, 6, NOW() - INTERVAL '30 days', NOW() + INTERVAL '60 days', 10, 3, 2, 0, 'active', NOW() - INTERVAL '30 days'),

-- Client 8 vouchers
(8, 7, NOW() - INTERVAL '40 days', NOW() + INTERVAL '20 days', 4, 2, 1, 0, 'active', NOW() - INTERVAL '40 days'),
(8, 8, NOW() - INTERVAL '5 days', NOW() + INTERVAL '85 days', 10, 0, 2, 0, 'active', NOW() - INTERVAL '5 days'),
(8, 9, NOW() - INTERVAL '90 days', NOW() + INTERVAL '90 days', 20, 8, 5, 2, 'active', NOW() - INTERVAL '90 days');

-- Insert more reservations (upcoming sessions)
INSERT INTO reservations (client_id, therapy_class_id, session_date, status, created_at, voucher_id) VALUES
-- Today's sessions for therapist
(3, 2, CURRENT_DATE + TIME '09:00:00', 'confirmed', NOW() - INTERVAL '3 days', 1),
(6, 1, CURRENT_DATE + TIME '10:30:00', 'confirmed', NOW() - INTERVAL '2 days', 3),
(3, 2, CURRENT_DATE + TIME '14:00:00', 'confirmed', NOW() - INTERVAL '5 days', 1),
(7, 4, CURRENT_DATE + TIME '16:00:00', 'confirmed', NOW() - INTERVAL '1 day', 5),

-- Tomorrow's sessions
(3, 2, CURRENT_DATE + INTERVAL '1 day' + TIME '10:00:00', 'confirmed', NOW() - INTERVAL '4 days', 1),
(6, 3, CURRENT_DATE + INTERVAL '1 day' + TIME '11:30:00', 'pending', NOW() - INTERVAL '1 day', 3),
(7, 5, CURRENT_DATE + INTERVAL '1 day' + TIME '15:00:00', 'confirmed', NOW() - INTERVAL '2 days', 5),

-- This week's sessions
(3, 1, CURRENT_DATE + INTERVAL '2 days' + TIME '09:00:00', 'confirmed', NOW() - INTERVAL '7 days', 2),
(6, 6, CURRENT_DATE + INTERVAL '3 days' + TIME '14:00:00', 'confirmed', NOW() - INTERVAL '5 days', 4),
(7, 7, CURRENT_DATE + INTERVAL '4 days' + TIME '16:00:00', 'pending', NOW() - INTERVAL '3 days', 6),
(8, 8, CURRENT_DATE + INTERVAL '5 days' + TIME '10:00:00', 'confirmed', NOW() - INTERVAL '2 days', 7),

-- Past completed sessions
(3, 2, CURRENT_DATE - INTERVAL '7 days' + TIME '10:00:00', 'completed', NOW() - INTERVAL '14 days', 1),
(3, 2, CURRENT_DATE - INTERVAL '14 days' + TIME '10:00:00', 'completed', NOW() - INTERVAL '21 days', 1),
(3, 2, CURRENT_DATE - INTERVAL '21 days' + TIME '10:00:00', 'completed', NOW() - INTERVAL '28 days', 1),
(6, 3, CURRENT_DATE - INTERVAL '10 days' + TIME '14:00:00', 'completed', NOW() - INTERVAL '17 days', 3),
(6, 6, CURRENT_DATE - INTERVAL '5 days' + TIME '11:00:00', 'completed', NOW() - INTERVAL '12 days', 4),
(7, 5, CURRENT_DATE - INTERVAL '3 days' + TIME '15:00:00', 'completed', NOW() - INTERVAL '10 days', 5),
(7, 5, CURRENT_DATE - INTERVAL '10 days' + TIME '15:00:00', 'completed', NOW() - INTERVAL '17 days', 5),
(7, 5, CURRENT_DATE - INTERVAL '17 days' + TIME '15:00:00', 'completed', NOW() - INTERVAL '24 days', 5),
(7, 5, CURRENT_DATE - INTERVAL '24 days' + TIME '15:00:00', 'completed', NOW() - INTERVAL '31 days', 5),
(7, 6, CURRENT_DATE - INTERVAL '8 days' + TIME '16:00:00', 'completed', NOW() - INTERVAL '15 days', 6),
(7, 6, CURRENT_DATE - INTERVAL '15 days' + TIME '16:00:00', 'completed', NOW() - INTERVAL '22 days', 6),
(8, 7, CURRENT_DATE - INTERVAL '20 days' + TIME '10:00:00', 'completed', NOW() - INTERVAL '27 days', 7),
(8, 7, CURRENT_DATE - INTERVAL '30 days' + TIME '10:00:00', 'completed', NOW() - INTERVAL '37 days', 7),

-- Cancelled sessions
(8, 9, CURRENT_DATE - INTERVAL '2 days' + TIME '14:00:00', 'cancelled', NOW() - INTERVAL '9 days', 9),
(3, 1, CURRENT_DATE - INTERVAL '4 days' + TIME '11:00:00', 'cancelled', NOW() - INTERVAL '11 days', 2);

-- Insert more users for realistic stats
INSERT INTO users (email, name, password_hash, role, is_active, approved_at, created_at) VALUES
-- More therapists
('therapist3@voucherskit.com', 'Dr. Michał Wiśniewski', '$2b$12$pmTEruDHxOnVHoijSZ4lZ.9Ttct8DEziT/n8omlOTSAepYuQ35vhe', 'therapist', true, NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days'),
('therapist4@voucherskit.com', 'Dr. Agnieszka Nowak', '$2b$12$pmTEruDHxOnVHoijSZ4lZ.9Ttct8DEziT/n8omlOTSAepYuQ35vhe', 'therapist', true, NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days'),

-- Organization owners  
('owner1@voucherskit.com', 'Krzysztof Kowalski', '$2b$12$pmTEruDHxOnVHoijSZ4lZ.9Ttct8DEziT/n8omlOTSAepYuQ35vhe', 'organization_owner', true, NOW() - INTERVAL '180 days', NOW() - INTERVAL '180 days'),
('owner2@voucherskit.com', 'Barbara Lewandowska', '$2b$12$pmTEruDHxOnVHoijSZ4lZ.9Ttct8DEziT/n8omlOTSAepYuQ35vhe', 'organization_owner', true, NOW() - INTERVAL '365 days', NOW() - INTERVAL '365 days'),

-- More clients (active)
('client4@example.com', 'Tomasz Nowicki', '$2b$12$pmTEruDHxOnVHoijSZ4lZ.9Ttct8DEziT/n8omlOTSAepYuQ35vhe', 'client', true, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
('client5@example.com', 'Anna Wójcik', '$2b$12$pmTEruDHxOnVHoijSZ4lZ.9Ttct8DEziT/n8omlOTSAepYuQ35vhe', 'client', true, NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
('client6@example.com', 'Robert Kamiński', '$2b$12$pmTEruDHxOnVHoijSZ4lZ.9Ttct8DEziT/n8omlOTSAepYuQ35vhe', 'client', true, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
('client7@example.com', 'Magdalena Szymańska', '$2b$12$pmTEruDHxOnVHoijSZ4lZ.9Ttct8DEziT/n8omlOTSAepYuQ35vhe', 'client', true, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
('client8@example.com', 'Paweł Woźniak', '$2b$12$pmTEruDHxOnVHoijSZ4lZ.9Ttct8DEziT/n8omlOTSAepYuQ35vhe', 'client', true, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),

-- Inactive clients
('inactive1@example.com', 'Jan Inactive', '$2b$12$pmTEruDHxOnVHoijSZ4lZ.9Ttct8DEziT/n8omlOTSAepYuQ35vhe', 'client', false, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days'),
('inactive2@example.com', 'Maria Inactive', '$2b$12$pmTEruDHxOnVHoijSZ4lZ.9Ttct8DEziT/n8omlOTSAepYuQ35vhe', 'client', false, NOW() - INTERVAL '80 days', NOW() - INTERVAL '80 days'),

-- Pending approval users
('pending1@example.com', 'Pending User 1', '$2b$12$pmTEruDHxOnVHoijSZ4lZ.9Ttct8DEziT/n8omlOTSAepYuQ35vhe', 'client', false, NULL, NOW() - INTERVAL '2 days'),
('pending2@example.com', 'Pending User 2', '$2b$12$pmTEruDHxOnVHoijSZ4lZ.9Ttct8DEziT/n8omlOTSAepYuQ35vhe', 'client', false, NULL, NOW() - INTERVAL '1 day'),
('pending3@example.com', 'Pending User 3', '$2b$12$pmTEruDHxOnVHoijSZ4lZ.9Ttct8DEziT/n8omlOTSAepYuQ35vhe', 'therapist', false, NULL, NOW());

-- Insert audit logs for recent activity
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, created_at) VALUES
(1, 'create', 'user', 21, '{"action": "User registered", "user": "pending3@example.com"}', NOW()),
(1, 'update', 'voucher_type', 9, '{"action": "Updated voucher type pricing", "old_price": 2800, "new_price": 2600}', NOW() - INTERVAL '1 day'),
(11, 'create', 'organization', 2, '{"action": "Organization created", "name": "Klinika Psychologiczna Harmony"}', NOW() - INTERVAL '5 hours'),
(3, 'create', 'voucher', 1, '{"action": "Voucher purchased", "type": "Pakiet Indywidualny 10"}', NOW() - INTERVAL '2 hours'),
(1, 'update', 'user', 15, '{"action": "User approved", "user": "client7@example.com"}', NOW() - INTERVAL '10 days'),
(1, 'delete', 'session', 100, '{"action": "Session cancelled", "reason": "Therapist unavailable"}', NOW() - INTERVAL '4 days');

-- Update statistics for more realistic data
UPDATE organizations SET 
    clients_count = (SELECT COUNT(*) FROM client_vouchers cv WHERE cv.voucher_type_id IN (SELECT id FROM voucher_types WHERE organization_id = organizations.id)),
    therapists_count = (SELECT COUNT(DISTINCT therapist_id) FROM therapy_classes WHERE organization_id = organizations.id),
    updated_at = NOW();

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO therapy_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO therapy_user;

-- Display summary
DO $$
DECLARE
    v_users_count INTEGER;
    v_active_users INTEGER;
    v_pending_users INTEGER;
    v_orgs_count INTEGER;
    v_voucher_types_count INTEGER;
    v_active_vouchers INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_users_count FROM users;
    SELECT COUNT(*) INTO v_active_users FROM users WHERE is_active = true;
    SELECT COUNT(*) INTO v_pending_users FROM users WHERE is_active = false AND approved_at IS NULL;
    SELECT COUNT(*) INTO v_orgs_count FROM organizations;
    SELECT COUNT(*) INTO v_voucher_types_count FROM voucher_types;
    SELECT COUNT(*) INTO v_active_vouchers FROM client_vouchers WHERE status = 'active';
    
    RAISE NOTICE '';
    RAISE NOTICE '=== Extended Seed Data Loaded Successfully ===';
    RAISE NOTICE '';
    RAISE NOTICE 'Database Statistics:';
    RAISE NOTICE '  Total Users: %', v_users_count;
    RAISE NOTICE '  Active Users: %', v_active_users;
    RAISE NOTICE '  Pending Approvals: %', v_pending_users;
    RAISE NOTICE '  Organizations: %', v_orgs_count;
    RAISE NOTICE '  Voucher Types: %', v_voucher_types_count;
    RAISE NOTICE '  Active Vouchers: %', v_active_vouchers;
    RAISE NOTICE '';
    RAISE NOTICE 'Test Accounts (all passwords: admin123):';
    RAISE NOTICE '  Admin: admin@voucherskit.com';
    RAISE NOTICE '  Therapist: therapist@voucherskit.com';
    RAISE NOTICE '  Client: client@voucherskit.com';
    RAISE NOTICE '  Org Owner 1: owner1@voucherskit.com';
    RAISE NOTICE '  Org Owner 2: owner2@voucherskit.com';
    RAISE NOTICE '';
END $$;