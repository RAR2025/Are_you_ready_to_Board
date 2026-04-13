declare module 'drizzle-orm-pgvector' {
  import { PgColumnBuilderBase } from 'drizzle-orm/pg-core';

  export function vector(name: string, options: { dimensions: number }): PgColumnBuilderBase & {
    notNull(): PgColumnBuilderBase;
  };
}