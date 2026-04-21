import { pgTable, serial, text, varchar, integer, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import { vector } from './vector.js';

// Organizations table
export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  uniqueOrgId: varchar('unique_org_id', { length: 64 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Updated Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  email: varchar('email', { length: 255 }).notNull(),
  firebaseUid: varchar('firebase_uid', { length: 128 }).notNull().unique(),
  role: varchar('role', { length: 50 }).notNull().default('employee'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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
  githubUrl: text('github_url').notNull(),
  isPrivate: boolean('is_private').notNull().default(false),
  lastIndexedAt: timestamp('last_indexed_at'),
});

// Tech Stack table
export const techStack = pgTable('tech_stack', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull().default(''),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Documents table
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  fileUrl: text('file_url').notNull(),
  fileType: varchar('file_type', { length: 128 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  storagePath: text('storage_path').notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
});

// Vector Embeddings table
export const vectorEmbeddings = pgTable('vector_embeddings', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').notNull().references(() => documents.id),
  embedding: vector('embedding', { dimensions: 1536 }).notNull(),
});

// Quiz Results table
export const quizResults = pgTable('quiz_results', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').notNull().references(() => employees.id),
  score: integer('score').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  topics: jsonb('topics'),
  takenAt: timestamp('taken_at').defaultNow().notNull(),
});

// Chat Interactions table
export const chatInteractions = pgTable('chat_interactions', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').notNull().references(() => employees.id),
  agentId: varchar('agent_id', { length: 255 }).notNull(),
  messageCount: integer('message_count').notNull().default(0),
  sessionStart: timestamp('session_start').defaultNow().notNull(),
  sessionEnd: timestamp('session_end'),
});

// Onboarding Checklists table
export const onboardingChecklists = pgTable('onboarding_checklists', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').notNull().references(() => employees.id),
  items: jsonb('items'),
  completedItems: jsonb('completed_items'),
  generatedAt: timestamp('generated_at').defaultNow().notNull(),
});
