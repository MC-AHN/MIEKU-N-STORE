ALTER TABLE "order_items_store" DROP CONSTRAINT "order_items_store_order_id_users_store_id_fk";
--> statement-breakpoint
ALTER TABLE "order_items_store" ADD CONSTRAINT "order_items_store_order_id_orders_store_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders_store"("id") ON DELETE no action ON UPDATE no action;