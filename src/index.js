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
import postOrder from "./APIs/postOrder.js";

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

app.post('/api/orders', authMiddleware, postOrder);

// Start Server
const port = 8002;
console.log(`Server running at http://localhost:${port}`);
serve({ fetch: app.fetch, port });

export default app;