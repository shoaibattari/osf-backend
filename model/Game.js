import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  ageGroup: String,
  gameName: String,
  token: Number,
  maleCount: Number,
  femaleCount: Number,
});

const Game = mongoose.model("Game", gameSchema);
export default Game;
