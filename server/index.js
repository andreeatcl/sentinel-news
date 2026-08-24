import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import createNewsRoutes from "./routes/newsRoutes.js";
import systemRoutes from "./routes/systemRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const NEWS_API_KEY = process.env.NEWS_API_KEY || "";

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res
    .status(200)
    .send("API server is running. Open UI at http://127.0.0.1:5173");
});

app.use("/api", createNewsRoutes({ newsApiKey: NEWS_API_KEY }));
app.use("/api", systemRoutes);

const server = app.listen(PORT, () => {
  console.log(`[SERVER] News proxy running on http://localhost:${PORT}`);
  console.log(
    `[SERVER] NEWS_API_KEY: ${NEWS_API_KEY ? "SET" : "NOT SET - set NEWS_API_KEY in .env"}`,
  );
});

server.on("error", (err) => {
  if (err?.code === "EADDRINUSE") {
    console.log(
      `[SERVER] Port ${PORT} already in use. Assuming another server instance is running.`,
    );
    process.exit(0);
  }
  throw err;
});
