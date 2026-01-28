import express from "express";
import eventController from "./event.controller.js";
import eventRequestController from "./eventRequest.controller.js";

const router = express.Router();

router.use("/", eventController);
router.use("/requests", eventRequestController);

export default router;
