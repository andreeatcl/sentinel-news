import { Router } from "express";
import { getCacheSize, getCacheSnapshot } from "../utils/cache.js";
import { getApiCallsToday } from "../utils/apiUsage.js";

const router = Router();

router.get("/cache/stats", (req, res) => {
  const cacheSnapshot = getCacheSnapshot();
  res.json({
    size: cacheSnapshot.size,
    apiCallsToday: getApiCallsToday(),
    entries: cacheSnapshot.entries,
  });
});

router.get("/health", (req, res) => {
  res.json({
    ok: true,
    apiCallsToday: getApiCallsToday(),
    cacheSize: getCacheSize(),
  });
});

export default router;
