-- Align repositories table with org repo management requirements.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'repositories'
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'repositories' AND column_name = 'url'
    ) AND NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'repositories' AND column_name = 'github_url'
    ) THEN
      ALTER TABLE repositories RENAME COLUMN url TO github_url;
    END IF;

    ALTER TABLE repositories
      ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS last_indexed_at TIMESTAMP;
  END IF;
END $$;
