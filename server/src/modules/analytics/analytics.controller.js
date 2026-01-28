import express from "express";
import { db } from "../../config/firebaseAdmin.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.get("/overview", authMiddleware, requireRole("Admin"), async (req, res, next) => {
	try {
		const counts = {};
		const collections = ["users", "clubs", "eventRequests", "events", "announcements", "chats"];
		for (const c of collections) {
			const snap = await db.collection(c).get();
			counts[c] = snap.size;
		}
		res.json({ counts });
	} catch (err) {
		next(err);
	}
});

export default router;

