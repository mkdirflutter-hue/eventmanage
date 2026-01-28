import express from "express";
import { db } from "../../config/firebaseAdmin.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";

const router = express.Router();

// Create announcement for a club (committee only)
router.post("/clubs/:clubId", authMiddleware, async (req, res, next) => {
	try {
		const { clubId } = req.params;
		const payload = { ...req.body, clubId, createdBy: req.uid, createdAt: Date.now() };
		await db.collection("announcements").add(payload);
		res.json({ message: "Announcement created" });
	} catch (err) {
		next(err);
	}
});

router.get("/clubs/:clubId", async (req, res, next) => {
	try {
		const { clubId } = req.params;
		const snap = await db.collection("announcements").where("clubId", "==", clubId).get();
		const items = [];
		snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
		res.json({ announcements: items });
	} catch (err) {
		next(err);
	}
});

export default router;

