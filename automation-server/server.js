import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import zomatoRoutes from "./src/routes/zomato.js";
import path from "path";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/zomato", zomatoRoutes);

app.use(
  "/screenshots",
  express.static(path.join(process.cwd(), "screenshots"))
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
