import express from "express";
import {
  getAllParticipants,
  registerParticipant,
} from "../controllers/registerController.js";

const router = express.Router();

router.post("/", registerParticipant);
router.get("/", getAllParticipants);

export default router;
