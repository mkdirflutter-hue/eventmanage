import express from "express";
import { db } from "../../config/firebaseAdmin.js";
import { requireRole } from "../../middlewares/role.middleware.js";

const router = express.Router();

// Get user by uid
router.get("/:uid", async (req, res, next) => {
	try {
		const { uid } = req.params;
		const doc = await db.collection("users").doc(uid).get();
		if (!doc.exists) return res.status(404).json({ message: "Not found" });
		res.json({ user: { uid: doc.id, ...doc.data() } });
	} catch (err) {
		next(err);
	}
});

// List users (admin)
router.get("/", requireRole("Admin"), async (req, res, next) => {
	try {
		const snap = await db.collection("users").get();
		const users = [];
		snap.forEach((d) => users.push({ uid: d.id, ...d.data() }));
		res.json({ users });
	} catch (err) {
		next(err);
	}
});

// Update profile (self)
router.put("/:uid", async (req, res, next) => {
	try {
		const { uid } = req.params;
		const payload = req.body;
		await db.collection("users").doc(uid).set(payload, { merge: true });
		res.json({ message: "Updated" });
	} catch (err) {
		next(err);
	}
});

export default router;

