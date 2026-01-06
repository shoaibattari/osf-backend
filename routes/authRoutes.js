import express from "express";
import {
  getUserProfile,
  loginUser,
  registerUser,
  uploadUserAvatar,
} from "../controllers/authController.js";
import verifyToken from "../middlewares/verifyToken.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", verifyToken, getUserProfile);

router.put(
  "/profile/upload-avatar",
  verifyToken,
  upload("profileImages").single("avatar"),
  uploadUserAvatar
);

export default router;
