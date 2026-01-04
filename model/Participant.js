import mongoose from "mongoose";

const GameSelectedSchema = new mongoose.Schema(
  {
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true,
    },
    gameName: { type: String, required: true }, // ✅ Add this
    token: { type: Number, required: true },
  },
  { _id: false } // ✅ Prevent MongoDB from auto-generating _id for subdocument
);

const participantSchema = new mongoose.Schema(
  {
    participantId: { type: String, unique: true },
    name: String,
    fatherName: String,
    khundi: String,
    dob: Date,
    gender: String,
    omjCard: String,
    cnic: String,
    whatsapp: String,
    location: String,
    kitSize: String,
    ageGroup: String,
    gamesSelected: [GameSelectedSchema],
  },
  { timestamps: true }
);

const Participant = mongoose.model("Participant", participantSchema);
export default Participant;
