import * as schema from "./db/schema.js";
import { db, supabase } from "./db/index.js";


const register = async (c) => {
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
            stock: parseInt(body['stock']),
            categoryId: parseInt(body['categoryId']),
            imageUrl: imageUrl
        });

        return c.json({ success: true, message: "Product added successfully", imageUrl });

    } catch (e) {
        return c.json({ success: false, message: e.message }, 500);
    }
}

export default register;