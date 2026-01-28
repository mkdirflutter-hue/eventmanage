import express from "express";
import { db, FieldValue } from "../../config/firebaseAdmin.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Create or append message to chat
router.post("/:chatId/message", authMiddleware, async (req, res, next) => {
	try {
		const { chatId } = req.params;
		const { text, meta } = req.body;
		const msg = { sender: req.uid, text, meta: meta || null, ts: Date.now() };
		const chatRef = db.collection("chats").doc(chatId);
		await chatRef.set({ messages: FieldValue.arrayUnion(msg) }, { merge: true });
		res.json({ message: "Saved" });
	} catch (err) {
		next(err);
	}
});

router.get("/:chatId/messages", authMiddleware, async (req, res, next) => {
	try {
		const { chatId } = req.params;
		const doc = await db.collection("chats").doc(chatId).get();
		if (!doc.exists) return res.json({ messages: [] });
		res.json({ messages: doc.data().messages || [] });
	} catch (err) {
		next(err);
	}
});

export default router;

