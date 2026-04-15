-- Ensure organizations has a human-facing Org ID used during registration.
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS unique_org_id VARCHAR(64);

-- Backfill existing rows with deterministic unique values.
UPDATE organizations
SET unique_org_id = CONCAT('ORG-', id)
WHERE unique_org_id IS NULL;

ALTER TABLE organizations
ALTER COLUMN unique_org_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'organizations_unique_org_id_key'
  ) THEN
    ALTER TABLE organizations
    ADD CONSTRAINT organizations_unique_org_id_key UNIQUE (unique_org_id);
  END IF;
END $$;
