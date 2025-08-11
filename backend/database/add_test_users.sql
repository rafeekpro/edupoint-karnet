-- Add users required for role-based access tests
-- Each user has their specific password

-- Add admin user (password: admin123)
INSERT INTO users (email, name, password_hash, role, is_active, created_at) 
VALUES ('admin@system.com', 'Admin User', '$2b$12$CzHO7y49zEggbzEvrFkcTeSK6s4.vNd1EkYFjNGIlkHMtdHeWS1Y6', 'admin', true, NOW())
ON CONFLICT (email) DO UPDATE SET 
  password_hash = '$2b$12$CzHO7y49zEggbzEvrFkcTeSK6s4.vNd1EkYFjNGIlkHMtdHeWS1Y6',
  role = 'admin';

-- Add owner user (password: owner123) - using organization_owner role in DB
INSERT INTO users (email, name, password_hash, role, is_active, created_at) 
VALUES ('owner@company.com', 'Owner User', '$2b$12$K6TiJEEzVgdisZk1QruP2ujkSam6RULEFjM8.vCJrzvVgEldHQNIq', 'organization_owner', true, NOW())
ON CONFLICT (email) DO UPDATE SET 
  password_hash = '$2b$12$K6TiJEEzVgdisZk1QruP2ujkSam6RULEFjM8.vCJrzvVgEldHQNIq',
  role = 'organization_owner';

-- Add employee user (password: employee123) - using therapist role in DB
INSERT INTO users (email, name, password_hash, role, is_active, created_at) 
VALUES ('employee@company.com', 'Employee User', '$2b$12$LBpmq66lbEjSUnsoICsioO8N9xB0ByXG37e4KXPR1sKU5lTlAcyvm', 'therapist', true, NOW())
ON CONFLICT (email) DO UPDATE SET 
  password_hash = '$2b$12$LBpmq66lbEjSUnsoICsioO8N9xB0ByXG37e4KXPR1sKU5lTlAcyvm',
  role = 'therapist';

-- Add client user (password: client123)
INSERT INTO users (email, name, password_hash, role, is_active, created_at) 
VALUES ('client@example.com', 'Client User', '$2b$12$V6YkilZP.XEhaQUmWhkDKOF.7rX1SjB/ngHh1oYf2czrUzO9t6hPq', 'client', true, NOW())
ON CONFLICT (email) DO UPDATE SET 
  password_hash = '$2b$12$V6YkilZP.XEhaQUmWhkDKOF.7rX1SjB/ngHh1oYf2czrUzO9t6hPq',
  role = 'client';