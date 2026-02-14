import express from "express";
import {
  exportParticipantsExcel,
  getAllParticipants,
  getParticipantStats,
  registerParticipant,
  statusPaymentUpdate,
  updateParticipantBasicInfo,
} from "../controllers/registerController.js";
import upload from "../middlewares/upload.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.post(
  "/",
  upload("omj-sports/payments").single("paymentScreenshot"),
  registerParticipant
);
router.get("/", getAllParticipants);
router.patch("/:id/basic-info", verifyToken, updateParticipantBasicInfo);

router.get("/stats", getParticipantStats);

router.patch("/:id/payment-status", verifyToken, statusPaymentUpdate);
router.get("/export-excel", exportParticipantsExcel);

export default router;
