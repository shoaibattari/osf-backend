import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/indexRoutes.js";
import connectDB from "./config/db.js";
import cloudinary from "cloudinary";

const app = express();
const port = process.env.PORT;

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(cors(""));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.get("/", (req, res) => {
  res.send("Hello, OMJ Sports festival!");
});

app.use(routes);

app.listen(port, () => {
  console.log(
    `OMJ Sports festival Server is running on http://localhost:${port}`
  );
});

export default app;
