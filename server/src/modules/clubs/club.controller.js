import express from "express";
import { db, FieldValue } from "../../config/firebaseAdmin.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";

const router = express.Router();

// Create club (admin)
router.post("/", authMiddleware, requireRole("Admin"), async (req, res, next) => {
	try {
		const data = req.body;
		const ref = await db.collection("clubs").add({ ...data, members: [], committee: [], createdAt: Date.now() });
		res.json({ id: ref.id });
	} catch (err) {
		next(err);
	}
});

// Get clubs
router.get("/", async (req, res, next) => {
	try {
		const snap = await db.collection("clubs").get();
		const clubs = [];
		snap.forEach((d) => clubs.push({ id: d.id, ...d.data() }));
		res.json({ clubs });
	} catch (err) {
		next(err);
	}
});

// Join club (student)
router.post("/:id/join", authMiddleware, async (req, res, next) => {
	try {
		const { id } = req.params;
		const uid = req.uid;
		const clubRef = db.collection("clubs").doc(id);
		await clubRef.update({ members: FieldValue.arrayUnion(uid) });
		res.json({ message: "Joined" });
	} catch (err) {
		next(err);
	}
});

// Assign committee member (admin)
router.post("/:id/assign", authMiddleware, requireRole("Admin"), async (req, res, next) => {
	try {
		const { id } = req.params;
		const { uid, roleTitle } = req.body;
		const clubRef = db.collection("clubs").doc(id);
		await clubRef.update({ committee: FieldValue.arrayUnion({ uid, roleTitle }) });
		res.json({ message: "Assigned" });
	} catch (err) {
		next(err);
	}
});

export default router;

