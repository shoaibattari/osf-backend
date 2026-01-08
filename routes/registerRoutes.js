import express from "express";
import {
  getAllParticipants,
  getParticipantStats,
  registerParticipant,
} from "../controllers/registerController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post(
  "/",
  upload("omj-sports/payments").single("paymentScreenshot"),
  registerParticipant
);
router.get("/", getAllParticipants);
router.get("/stats", getParticipantStats);

export default router;
