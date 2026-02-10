// src/index.js
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "@hono/node-server/serve-static";
import login from "./APIs/login.js";
import register from "./APIs/register.js";
import authMiddleware from "./APIs/authMiddleware.js";
import getProduct from "./APIs/getProduct.js";
import postOrder from "./APIs/postOrder.js";

const app = new Hono();
app.use("/*", cors());

// -- STATIC FILES --
if (process.env.NODE_ENV !== 'production') {
  app.use("/*", serveStatic({ root: './public' }));
}

// -- API LOGIN --
app.post("/api/login", login);

//
app.post('/api/products', register);


app.get('/api/products', getProduct);

app.post('/api/orders', postOrder);

// Start Server
const port = 8002;
console.log(`Server running at http://localhost:${port}`);
serve({ fetch: app.fetch, port });

// For serverless deployment
export default app;