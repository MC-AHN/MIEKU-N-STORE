// src/index.js
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "@hono/node-server/serve-static";
import login from "./src/APIs/login.js";
import register from "./src/APIs/register.js";
import authMiddleware from "./src/APIs/authMiddleware.js";
import getProduct from "./src/APIs/getProduct.js";
import postOrder from "./src/APIs/postOrder.js";

const app = new Hono();
app.use("/*", cors());
app.use("/*", serveStatic({ root: './public' }));

// -- API LOGIN --
app.post("/api/login", login);

//
app.post('/api/products', register);


app.get('/api/products', getProduct);

app.post('/api/orders', authMiddleware, postOrder);

// Start Server
const port = 8002;
console.log(`Server running at http://localhost:${port}`);
serve({ fetch: app.fetch, port });

export default app;