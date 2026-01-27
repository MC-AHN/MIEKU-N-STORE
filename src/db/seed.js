// src/db/seed.js
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, categories } from "./schema.js";
import bcrypt from "bcryptjs";

// LOAD ENV
process.loadEnvFile();

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

async function seed() {
    console.log("Sedding database...");

    // 1, Create admin user (Pass : 12345678)
    const hash = await bcrypt.hash("12345678", 10);
    await db.insert(users).values({
        username: "admin",
        password: hash,
        role: "admin"
    }).onConflictDoNothing();

    // 2. Insert default categories
    await db.insert(categories).values([
        { name : "Food" }, { name: "Drink"}, { name: "Fashion" }
    ]);

    console.log("Sedding Finished");
    process.exit(0);
}

seed();