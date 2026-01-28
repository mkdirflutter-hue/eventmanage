import express from "express";
import { db } from "../../config/firebaseAdmin.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";

const router = express.Router();

// Create event request (organizer)
router.post("/", authMiddleware, async (req, res, next) => {
	try {
		const payload = { ...req.body, createdBy: req.uid, status: "pending", createdAt: Date.now() };
		const ref = await db.collection("eventRequests").add(payload);
		res.json({ id: ref.id });
	} catch (err) {
		next(err);
	}
});

// Admin actions: approve, reject, suggest changes
router.post("/:id/approve", authMiddleware, requireRole("Admin"), async (req, res, next) => {
	try {
		const { id } = req.params;
		const reqDoc = await db.collection("eventRequests").doc(id).get();
		if (!reqDoc.exists) return res.status(404).json({ message: "Not found" });
		const data = reqDoc.data();

		// create event from request
		const eventRef = await db.collection("events").add({ ...data, approvedAt: Date.now(), status: "approved" });

		// mark request approved
		await db.collection("eventRequests").doc(id).set({ status: "approved", approvedAt: Date.now(), eventId: eventRef.id }, { merge: true });

		// Deduct budget if requested
		if (data.budgetRequested) {
			const bRef = db.collection("budgets").doc("current");
			const bDoc = await bRef.get();
			const current = bDoc.exists ? bDoc.data().remaining || 0 : 0;
			await bRef.set({ remaining: Math.max(0, current - data.budgetRequested) }, { merge: true });
		}

		res.json({ message: "Approved", eventId: eventRef.id });
	} catch (err) {
		next(err);
	}
});

router.post("/:id/reject", authMiddleware, requireRole("Admin"), async (req, res, next) => {
	try {
		const { id } = req.params;
		await db.collection("eventRequests").doc(id).set({ status: "rejected", rejectedAt: Date.now(), rejectionReason: req.body.reason || null }, { merge: true });
		res.json({ message: "Rejected" });
	} catch (err) {
		next(err);
	}
});

router.post("/:id/suggest", authMiddleware, requireRole("Admin"), async (req, res, next) => {
	try {
		const { id } = req.params;
		await db.collection("eventRequests").doc(id).set({ status: "changes_requested", suggestions: req.body.suggestions || {}, suggestedAt: Date.now() }, { merge: true });
		res.json({ message: "Suggestions added" });
	} catch (err) {
		next(err);
	}
});

export default router;

