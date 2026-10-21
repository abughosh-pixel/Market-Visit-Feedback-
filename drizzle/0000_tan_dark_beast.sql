CREATE TABLE `visits` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`visitor` text NOT NULL,
	`country` text NOT NULL,
	`department` text NOT NULL,
	`visit_date` text NOT NULL,
	`payload` text NOT NULL,
	`photos` text NOT NULL
);
