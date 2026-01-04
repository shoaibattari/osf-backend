import express from "express";
import {
  bulkCreateGames,
  createGame,
  getAvailableGames,
} from "../controllers/gameController.js";

const router = express.Router();

router.get("/", getAvailableGames);
router.post("/create", createGame);
router.post("/bulk-create", bulkCreateGames);

export default router;
    