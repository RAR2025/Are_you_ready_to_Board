-- Create the core org tables if they do not already exist.
CREATE TABLE IF NOT EXISTS organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  unique_org_id VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  email VARCHAR(255) NOT NULL,
  firebase_uid VARCHAR(128) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'employee',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS repositories (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  github_url TEXT NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  last_indexed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tech_stack (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT tech_stack_org_name_unique UNIQUE (organization_id, name)
);

CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(128) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vector_embeddings (
  id SERIAL PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES documents(id),
  embedding vector(1536) NOT NULL
);
