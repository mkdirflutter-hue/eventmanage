import express from "express";
import { db } from "../../config/firebaseAdmin.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";

const router = express.Router();

// Signup: create a user document awaiting admin approval
router.post("/signup", async (req, res, next) => {
	try {
		const { uid, displayName, email } = req.body;
		if (!uid || !email) return res.status(400).json({ message: "uid and email required" });
		const userRef = db.collection("users").doc(uid);
		await userRef.set({ displayName: displayName || null, email, status: "pending", role: "student", createdAt: Date.now() }, { merge: true });
		res.json({ message: "Signup pending admin approval" });
	} catch (err) {
		next(err);
	}
});

// Get current user
router.get("/me", authMiddleware, async (req, res, next) => {
	try {
		res.json({ user: req.user });
	} catch (err) {
		next(err);
	}
});

// Admin approves a user
router.post("/approve/:uid", authMiddleware, requireRole("Admin"), async (req, res, next) => {
	try {
		const { uid } = req.params;
		await db.collection("users").doc(uid).set({ status: "approved" }, { merge: true });
		res.json({ message: "User approved" });
	} catch (err) {
		next(err);
	}
});

export default router;

