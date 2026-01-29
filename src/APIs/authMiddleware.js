import jwt from "jsonwebtoken";

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

export default authMiddleware;