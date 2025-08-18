-- Final password update for all demo users
-- Generated on 2025-08-18

-- Update admin password (Admin123!)
UPDATE users 
SET password_hash = '$2b$12$AJE7PqDf9nnJ4AmihP12Teoq77vEM/7jlwhRxUA72krKfHg0dceNe',
    updated_at = NOW()
WHERE email = 'admin@voucherskit.com';

-- Update organization owner password (Owner123!)
UPDATE users 
SET password_hash = '$2b$12$sCtbHu6L2PlbjqhHVWy3tO2kdWlDN88/i6KsCFDval1khdNdZ3tJO',
    updated_at = NOW()
WHERE email = 'owner@voucherskit.com';

-- Update therapist password (Therapist123!)
UPDATE users 
SET password_hash = '$2b$12$07/jKE8K/.5B0OqrIpzJy.KvZ2LnRmvTp0pCLMul1mBn9oawwRclu',
    updated_at = NOW()
WHERE email = 'therapist@voucherskit.com';

-- Update staff password (Staff123!)
UPDATE users 
SET password_hash = '$2b$12$byWmH3tmx0OFPnheMEVbNuje.b1MAKxpnSW9iOKL/Q5.QC0AlWRAq',
    updated_at = NOW()
WHERE email = 'staff@voucherskit.com';

-- Update client password (Client123!)
UPDATE users 
SET password_hash = '$2b$12$FDj12rbtUdH9ly55niTr/Opj1RN2iHYYs.XRyEsEf.lN5t8Ogwz6G',
    updated_at = NOW()
WHERE email = 'client@voucherskit.com';

-- Verify the updates
SELECT email, substring(password_hash, 1, 20) as hash_prefix, role 
FROM users 
WHERE email IN (
    'admin@voucherskit.com',
    'owner@voucherskit.com', 
    'therapist@voucherskit.com',
    'staff@voucherskit.com',
    'client@voucherskit.com'
)
ORDER BY 
    CASE role
        WHEN 'admin' THEN 1
        WHEN 'organization_owner' THEN 2
        WHEN 'therapist' THEN 3
        WHEN 'staff' THEN 4
        WHEN 'client' THEN 5
    END;