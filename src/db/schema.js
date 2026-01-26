// src/db/schema.js
import { pgTable, serial, varchar, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";

// 1. Table Users (Admin)
export const users = pgTable("users_store", {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 100 }).notNull().unique(),
    password: varchar("password", { length: 256 }).notNull(),
    role: varchar("role", { length: 20 }).default("customer").notNull(), // e.g., 'admin'
});

// 2. Table Categories
export const categories = pgTable("categories_store", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
});

// 3. Table Products
export const products = pgTable("products_store", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    description: text("description"),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    stock: integer("stock").notNull(),
    imageUrl: text("image_url"),
    categoryId: integer("category_id")
        .references(() => categories.id),
});

// 4, Table Orders
export const orders = pgTable("orders_store", {
    id: serial("id").primaryKey(),
    customerName: varchar("customer_name", { length: 256 }).notNull(),
    address: text("address").notNull(),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    status: varchar("status", { length: 20 }).default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})

// 5. Table Order Items (Detail Belajaan)
export const orderItems = pgTable("order_items_store", {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
        .references(() => users.id).notNull(),
    productId: integer("product_id")
        .references(() => products.id).notNull(),
    quantity: integer("quantity").notNull(),
    priceAtTime: numeric("price_at_time", { precision: 12, scale: 2 }).notNull(),
});