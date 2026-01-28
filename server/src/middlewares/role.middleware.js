export function requireRole(requiredRole) {
	return (req, res, next) => {
		const user = req.user || {};
		const role = (user.role || user.roleTitle || "").toString();
		if (!user.uid) return res.status(401).json({ message: "Unauthorized" });
		if (!requiredRole) return next();
		const reqRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
		const normalized = reqRoles.map((r) => (r || "").toString().toLowerCase());
		if (!normalized.includes(role.toLowerCase())) return res.status(403).json({ message: "Forbidden" });
		next();
	};
}

