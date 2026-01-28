import express from "express";
import { db } from "../../config/firebaseAdmin.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
	try {
		const snap = await db.collection("events").get();
		const events = [];
		snap.forEach((d) => events.push({ id: d.id, ...d.data() }));
		res.json({ events });
	} catch (err) {
		next(err);
	}
});

router.get("/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const doc = await db.collection("events").doc(id).get();
		if (!doc.exists) return res.status(404).json({ message: "Not found" });
		res.json({ event: { id: doc.id, ...doc.data() } });
	} catch (err) {
		next(err);
	}
});

export default router;

