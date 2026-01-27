// src/index.js
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import { desc } from "drizzle-orm";
import { serveStatic } from "hono/serve-static";

// 1, LOAD ENV
process.loadEnvFile();

// 2. Setup Connection
const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const app = new Hono();
app.use("/*", cors());
app.use("/*", serveStatic({ root: './public' }));

// -- API LOGIN --
app.post("/login", async (c) => {
    const { username, password } = await c.req.json();

    // 1. Cek user di database
    const user = await db.query.users.findFirst({
        where: eq(schema.users.username, username)
    });

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return c.json({ success: false, message: "Login Failed" }, 401);
    }

    // Create token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: 'id' });
    return c.json({ success: true, token });
});

// MiddleWare Auth
const authMiddleware = async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) return c.json({ success: false, message: "Unauthorized" }, 401);
    try {
        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        c.set('user', payload);
        await next();
    } catch (e) {
        return c.json({ message: "Invalid Token", error: e }, 403);
    }
};

//
app.post('/api/products', authMiddleware, async (c) => {
    try {
        const body = await c.req.parseBody();
        const imageFile = body['image'];

        // validate
        if (!imageFile || !(imageFile instanceof File)) {
            return c.json({ success: false, message: "Image file is required" }, 400);
        }

        // 1. Upload to Supabase Storage
        const fileName = `prod_${Date.now()}_${imageFile.name.replace(/\s/g, '_')}`;
        const arrayBuffer = await imageFile.arrayBuffer();

        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(fileName, arrayBuffer, { contentType: imageFile.type });

        if (uploadError) throw uploadError;

        // 2. Get Public URL
        const { data } = supabase.storage.from('products').getPublicUrl(fileName);
        const imageUrl = data.publicUrl;

        // 3. save to database
        await db.insert(schema.products).values({
            name: body['name'],
            description: body['description'],
            price: body['price'],
            stock: body['stock'],
            categoryId: body['categoryId'],
            imageUrl: imageUrl
        });

        return c.json({ success: true, message: "Product added successfully", imageUrl });

    } catch (e) {
        return c.json({ success: false, message: e.message }, 500);
    }
});


app.get('/api/products', async (c) => {
    const data = await db.select().from(schema.products).orderBy(desc(schema.products.id));
    return c.json({ success: true, data });
});

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
                    .where(eq(schema.product.id, item.productId));

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