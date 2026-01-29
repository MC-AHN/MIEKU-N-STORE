import * as schema from "./db/schema.js";
import { desc } from "drizzle-orm";


const getProduct = async (c) => {
    const data = await db.select().from(schema.products).orderBy(desc(schema.products.id));
    return c.json({ success: true, data });
};

export default getProduct;