import { auth, db } from "../config/firebaseAdmin.js";

export default async function authMiddleware(req, res, next) {
	try {
		const header = req.headers.authorization || "";
		if (!header.startsWith("Bearer ")) return res.status(401).json({ message: "Missing or invalid Authorization header" });
		const idToken = header.split(" ")[1];
		const decoded = await auth.verifyIdToken(idToken);
		req.uid = decoded.uid;

		const userDoc = await db.collection("users").doc(req.uid).get();
		req.user = userDoc.exists ? { uid: req.uid, id: userDoc.id, ...userDoc.data() } : { uid: req.uid };
		next();
	} catch (err) {
		console.error("authMiddleware error", err);
		res.status(401).json({ message: "Unauthorized" });
	}
}

