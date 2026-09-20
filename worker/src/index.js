import { Hono } from "hono";
import { cors } from "hono/cors";
import news from "./routes/news.js";
import health from "./routes/health.js";
import events from "./routes/events.js";
import { scheduled } from "./scheduled.js";

const app = new Hono();

app.use("/api/*", cors());
app.route("/api", news);
app.route("/api", health);
app.route("/api", events);

app.get("/", (c) => c.text("Sentinel API worker is running."));

export default { fetch: app.fetch, scheduled };
