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

// 1, LOAD ENV
process.loadEnvFile();

// 2. Setup Connection
const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const app = new Hono();
app.use("/*", cors());

// -- API LOGIN --
app.post("/login", async (c) => {
    const {username, password} = await c.req.json();
    
    // 1. Cek user di database
    const user = await db.query.users.findFirst({
        where: eq(schema.users.username, username)
    });

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return c.json({ success: false, message: "Login Failed" }, 401);
    }

    // Create token
    const token = jwt.sign({ id: user.id, role: user.role}, process.env.JWT_SECRET, { expiresIn: 'id'});
    return c.json({ success: true, token });
});

// MiddleWare Auth
const authMiddleware = async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) return c.json({ success: false, message: "Unauthorized"}, 401);
    try {
        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        c.set('user', payload);
        await next();
    } catch (e) {
        return c.json({ message: "Invalid Token", error: e}, 403);
    }
};
