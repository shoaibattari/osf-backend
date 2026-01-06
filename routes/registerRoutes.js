import express from "express";
import {
  getAllParticipants,
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

export default router;
