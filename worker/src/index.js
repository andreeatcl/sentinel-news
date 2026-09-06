import { Hono } from "hono";
import { cors } from "hono/cors";
import news from "./routes/news.js";
import health from "./routes/health.js";

const app = new Hono();

app.use("/api/*", cors());
app.route("/api", news);
app.route("/api", health);

app.get("/", (c) => c.text("Sentinel API worker is running."));

export default app;
