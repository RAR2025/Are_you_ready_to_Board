-- Add firebase_uid and role columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128),
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'employee',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'users_firebase_uid_unique'
	) THEN
		ALTER TABLE users
		ADD CONSTRAINT users_firebase_uid_unique UNIQUE (firebase_uid);
	END IF;
END $$;

ALTER TABLE users
ALTER COLUMN firebase_uid SET NOT NULL,
ALTER COLUMN role SET NOT NULL,
ALTER COLUMN updated_at SET NOT NULL;

-- Remove password column (deprecated)
ALTER TABLE users DROP COLUMN IF EXISTS password;