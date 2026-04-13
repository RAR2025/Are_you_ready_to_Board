-- Add firebase_uid and role columns to users table
ALTER TABLE users
ADD COLUMN firebase_uid VARCHAR(128) UNIQUE NOT NULL,
ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'employee',
ADD COLUMN updated_at TIMESTAMP DEFAULT NOW() NOT NULL;

-- Remove password column (deprecated)
ALTER TABLE users DROP COLUMN password;