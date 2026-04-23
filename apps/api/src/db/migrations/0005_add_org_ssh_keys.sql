DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'org_ssh_keys'
  ) THEN
    CREATE TABLE org_ssh_keys (
      id SERIAL PRIMARY KEY,
      organization_id INTEGER NOT NULL REFERENCES organizations(id),
      label VARCHAR(255) NOT NULL,
      public_key TEXT NOT NULL,
      fingerprint VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'org_ssh_keys_org_fingerprint_unique'
  ) THEN
    ALTER TABLE org_ssh_keys
    ADD CONSTRAINT org_ssh_keys_org_fingerprint_unique UNIQUE (organization_id, fingerprint);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS org_ssh_keys_org_created_idx
  ON org_ssh_keys (organization_id, created_at DESC);
