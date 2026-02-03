import * as schema from "../db/schema.js";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";

const postOrder = async (c) => {
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
};

export default postOrder;