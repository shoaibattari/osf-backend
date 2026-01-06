import express from "express";
import gameRoutes from "../routes/gameRoutes.js";
import registerRoutes from "../routes/registerRoutes.js";
import authRoutes from "../routes/authRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/register", registerRoutes);
router.use("/games", gameRoutes);

export default router;
