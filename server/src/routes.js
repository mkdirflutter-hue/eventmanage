import express from "express";
import authController from "./modules/auth/auth.controller.js";
import userController from "./modules/users/user.controller.js";
import clubController from "./modules/clubs/club.controller.js";
import clubRoutes from "./modules/clubs/club.routes.js";
import eventController from "./modules/events/event.controller.js";
import eventRequestController from "./modules/events/eventRequest.controller.js";
import announcementController from "./modules/community/announcement.controller.js";
import chatController from "./modules/chat/chat.controller.js";
import budgetController from "./modules/budget/budget.controller.js";
import analyticsController from "./modules/analytics/analytics.controller.js";
import authMiddleware from "./middlewares/auth.middleware.js";

const router = express.Router();

router.use("/auth", authController);
router.use("/users", authMiddleware, userController);
router.use("/clubs", clubRoutes);
router.use("/events", eventController);
router.use("/event-requests", eventRequestController);
router.use("/announcements", announcementController);
router.use("/chat", chatController);
router.use("/budget", budgetController);
router.use("/analytics", analyticsController);

export default router;

