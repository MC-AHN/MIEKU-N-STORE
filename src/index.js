// src/index.js
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./db/schema.js";
import { eq } from "drizzle-orm";
import { createClient } from "@supabase/supabase-js";
import { serveStatic } from "@hono/node-server/serve-static";
import login from "./APIs/login.js";
import register from "./APIs/register.js";
import authMiddleware from "./APIs/authMiddleware.js";
import getProduct from "./APIs/getProduct.js";

// 1, LOAD ENV
process.loadEnvFile();

// 2. Setup Connection
const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const app = new Hono();
app.use("/*", cors());
app.use("/*", serveStatic({ root: './public' }));

// -- API LOGIN --
app.post("/api/login", login);

//
app.post('/api/products', authMiddleware, register);


app.get('/api/products', getProduct);

app.post('/api/orders', async (c) => {
    const { customerName, address, items } = await c.req.json();
    // items: [{ productId: 1, quantity: 2}]

    try {
        const result = await db.transaction(async (tx) => {
            let total = 0;

            // 1. Create Order Header
            const [newOrder] = await tx.insert(schema.orders).values({
                customerName, address, totalAmount: "0", status: "pending"
            }).returning();

            // 2. Process Item
            for (const item of items) {
                // Cek Stock
                const product = await tx.query.products.findFirst({
                    where: eq(schema.products.id, item.productId)
                });

                if (!product || product.stock < item.quantity) {
                    throw new Error(`Stock ${product?.name} not enough`);
                }

                total += (parseFloat(product.price) * item.quantity);

                // insert item and update stock
                await tx.insert(schema.orderItems).values({
                    orderId: newOrder.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    priceAtTime: product.price
                });

                await tx.update(schema.products)
                    .set({ stock: product.stock - item.quantity })
                    .where(eq(schema.products.id, item.productId));
            }

            // Update Total Price
            await tx.update(schema.orders)
                .set({ totalAmount: total })
                .where(eq(schema.orders.id, newOrder.id));

            return { orderId: newOrder.id, total };
        });

        return c.json({ success: true, ...result })
    
    } catch (e) {
        return c.json({ success: false, message: e.message }, 400);
    }
});

// Start Server
const port = 8002;
console.log(`Server running at http://localhost:${port}`);
serve({ fetch: app.fetch, port });

export default app;