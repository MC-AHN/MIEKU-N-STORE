CREATE TABLE "categories_store" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items_store" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"price_at_time" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders_store" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_name" varchar(256) NOT NULL,
	"address" text NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products_store" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"price" numeric(12, 2) NOT NULL,
	"stock" integer NOT NULL,
	"image_url" text,
	"category_id" integer
);
--> statement-breakpoint
CREATE TABLE "users_store" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"password" varchar(256) NOT NULL,
	"role" varchar(20) DEFAULT 'customer' NOT NULL,
	CONSTRAINT "users_store_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "order_items_store" ADD CONSTRAINT "order_items_store_order_id_users_store_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."users_store"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items_store" ADD CONSTRAINT "order_items_store_product_id_products_store_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products_store"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products_store" ADD CONSTRAINT "products_store_category_id_categories_store_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories_store"("id") ON DELETE no action ON UPDATE no action;