import { pgTable, serial, text, varchar, integer, foreignKey, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { vector } from 'drizzle-orm-pgvector';

// Organizations table
export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  email: varchar('email', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Departments table
export const departments = pgTable('departments', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  name: varchar('name', { length: 255 }).notNull(),
});

// Employees table
export const employees = pgTable('employees', {
  id: serial('id').primaryKey(),
  departmentId: integer('department_id').notNull().references(() => departments.id),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 255 }).notNull(),
});

// Repositories table
export const repositories = pgTable('repositories', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  name: varchar('name', { length: 255 }).notNull(),
  url: text('url').notNull(),
});

// Tech Stack table
export const techStack = pgTable('tech_stack', {
  id: serial('id').primaryKey(),
  repositoryId: integer('repository_id').notNull().references(() => repositories.id),
  technology: varchar('technology', { length: 255 }).notNull(),
});

// Documents table
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
});

// Vector Embeddings table
export const vectorEmbeddings = pgTable('vector_embeddings', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').notNull().references(() => documents.id),
  embedding: vector('embedding', { dimensions: 1536 }).notNull(),
});
