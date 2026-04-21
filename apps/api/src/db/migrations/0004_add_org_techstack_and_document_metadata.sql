-- Convert tech_stack to organization-level entries with name/description.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'tech_stack'
  ) THEN
    ALTER TABLE tech_stack
      ADD COLUMN IF NOT EXISTS organization_id INTEGER,
      ADD COLUMN IF NOT EXISTS name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

    IF EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_name = 'repositories'
    ) THEN
      UPDATE tech_stack ts
      SET organization_id = r.organization_id
      FROM repositories r
      WHERE ts.repository_id = r.id
        AND ts.organization_id IS NULL;
    END IF;

    UPDATE tech_stack
    SET name = technology
    WHERE name IS NULL;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'tech_stack_organization_id_organizations_id_fk'
    ) THEN
      ALTER TABLE tech_stack
      ADD CONSTRAINT tech_stack_organization_id_organizations_id_fk
      FOREIGN KEY (organization_id) REFERENCES organizations(id);
    END IF;

    ALTER TABLE tech_stack
      ALTER COLUMN organization_id SET NOT NULL,
      ALTER COLUMN name SET NOT NULL;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'tech_stack' AND column_name = 'repository_id'
    ) THEN
      ALTER TABLE tech_stack DROP COLUMN repository_id;
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'tech_stack' AND column_name = 'technology'
    ) THEN
      ALTER TABLE tech_stack DROP COLUMN technology;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'tech_stack_org_name_unique'
    ) THEN
      ALTER TABLE tech_stack
      ADD CONSTRAINT tech_stack_org_name_unique UNIQUE (organization_id, name);
    END IF;
  END IF;
END $$;

-- Extend documents with file metadata fields used for uploaded files.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'documents'
  ) THEN
    ALTER TABLE documents
      ADD COLUMN IF NOT EXISTS file_url TEXT,
      ADD COLUMN IF NOT EXISTS file_type VARCHAR(128),
      ADD COLUMN IF NOT EXISTS original_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS storage_path TEXT,
      ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP NOT NULL DEFAULT NOW();

    UPDATE documents
    SET
      file_url = COALESCE(file_url, ''),
      file_type = COALESCE(file_type, 'application/octet-stream'),
      original_name = COALESCE(original_name, title),
      storage_path = COALESCE(storage_path, CONCAT('legacy/', id::text));

    ALTER TABLE documents
      ALTER COLUMN file_url SET NOT NULL,
      ALTER COLUMN file_type SET NOT NULL,
      ALTER COLUMN original_name SET NOT NULL,
      ALTER COLUMN storage_path SET NOT NULL;
  END IF;
END $$;
