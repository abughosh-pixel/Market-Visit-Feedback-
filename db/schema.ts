import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const visits = sqliteTable('visits', {
 id: text('id').primaryKey(), createdAt: text('created_at').notNull(),
 visitor: text('visitor').notNull(), country: text('country').notNull(),
 department: text('department').notNull(), visitDate: text('visit_date').notNull(),
 payload: text('payload').notNull(), photos: text('photos').notNull()
});
