import express from "express";
import { db } from "../../config/firebaseAdmin.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";

const router = express.Router();

// Set monthly budget (admin)
router.post("/set", authMiddleware, requireRole("Admin"), async (req, res, next) => {
	try {
		const { total } = req.body;
		if (typeof total !== "number") return res.status(400).json({ message: "total must be a number" });
		await db.collection("budgets").doc("current").set({ total, remaining: total, updatedAt: Date.now() });
		res.json({ message: "Budget set" });
	} catch (err) {
		next(err);
	}
});

router.get("/current", authMiddleware, requireRole("Admin"), async (req, res, next) => {
	try {
		const doc = await db.collection("budgets").doc("current").get();
		res.json({ budget: doc.exists ? doc.data() : null });
	} catch (err) {
		next(err);
	}
});

export default router;

