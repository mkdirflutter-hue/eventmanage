import express from "express";
import clubController from "./club.controller.js";

const router = express.Router();

router.use("/", clubController);

export default router;

