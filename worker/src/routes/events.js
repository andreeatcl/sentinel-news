import { Hono } from "hono";
import { getFipsCodes } from "../lib/countryCodes.js";
import { decodeActor } from "../lib/gdeltActorCodes.js";
import { decodeEventCode } from "../lib/cameoEventCodes.js";
import { getEventsForRange } from "../lib/eventsStore.js";
import { ingestLatestEventsFile } from "../services/gdeltEventsService.js";
import { fetchPageMetadata } from "../lib/pageMetadata.js";
import { isLowQualityDomain } from "../lib/lowQualitySources.js";

const MAX_RANGE_DAYS = 30;
const DEFAULT_LIMIT = 20;

const events = new Hono();

function toDayString(isoDate) {
  return isoDate.replaceAll("-", "");
}

function dedupeBySourceUrl(rows) {
  const bestByUrl = new Map();
  const noUrl = [];

  for (const row of rows) {
    if (!row.sourceUrl) {
      noUrl.push(row);
      continue;
    }
    const existing = bestByUrl.get(row.sourceUrl);
    if (!existing || row.numMentions > existing.numMentions) {
      bestByUrl.set(row.sourceUrl, row);
    }
  }

  return [...bestByUrl.values(), ...noUrl];
}

// use GDELT's own classification system and add tone magnitude logic
// so that we don't get served 10 articles in a row about the "Top 5 things tourists MUST KNOW before visiting Narnia!!"
const QUAD_CLASS_WEIGHT = { 1: 0.5, 2: 0.6, 3: 1.2, 4: 1.6 };

function significanceScore(row) {
  const quadWeight = QUAD_CLASS_WEIGHT[row.quadClass] || 0.5;
  const toneMagnitude = Math.abs(row.goldstein) || 0;
  const mentionSignal = Math.log(1 + Math.max(0, row.numMentions));
  return quadWeight * (1 + toneMagnitude) * (1 + mentionSignal);
}

function toneCategoryForRow(goldstein) {
  if (goldstein > 1) return "positive";
  if (goldstein < -1) return "negative";
  return "neutral";
}

function hasStateActor(row) {
  return !!(
    decodeActor(row.actor1Code)?.country || decodeActor(row.actor2Code)?.country
  );
}

function dateAddedTimestamp(row) {
  if (row.dateAdded) return Date.parse(row.dateAdded);
  const day = row.day || "";
  return Date.parse(
    `${day.slice(0, 4)}-${day.slice(4, 6)}-${day.slice(6, 8)}T00:00:00Z`,
  );
}

function coverageScore(row) {
  return row.numSources * 1000 + row.numMentions;
}

const SORTERS = {
  significance: (a, b) => significanceScore(b) - significanceScore(a),
  date: (a, b) => dateAddedTimestamp(b) - dateAddedTimestamp(a),
  coverage: (a, b) => coverageScore(b) - coverageScore(a),
};

events.get("/events", async (c) => {
  const {
    country,
    from,
    to,
    limit = String(DEFAULT_LIMIT),
    offset = "0",
    category = "",
    tone = "",
    sortBy = "significance",
    sortDir = "desc",
  } = c.req.query();

  if (!country) {
    return c.json({ error: "Query parameter country is required" }, 400);
  }
  if (!from || !to) {
    return c.json(
      { error: "Query parameters from and to are required (YYYY-MM-DD)" },
      400,
    );
  }

  const fipsCodes = getFipsCodes(country);
  if (fipsCodes.length === 0) {
    return c.json({
      events: [],
      meta: {
        country,
        matched: 0,
        note: "Country not recognized for GDELT lookup",
      },
    });
  }

  const fromDay = toDayString(from);
  const toDay = toDayString(to);
  const spanDays = (Date.parse(to) - Date.parse(from)) / 86400000;
  if (spanDays > MAX_RANGE_DAYS) {
    return c.json(
      { error: `Range too large — max ${MAX_RANGE_DAYS} days` },
      400,
    );
  }

  const rawRows = await getEventsForRange(c.env, fipsCodes, fromDay, toDay);
  let rows = dedupeBySourceUrl(rawRows);

  rows = rows.filter(
    (row) => hasStateActor(row) && !isLowQualityDomain(row.sourceUrl),
  );

  const categories = category ? category.split(",").filter(Boolean) : [];
  const tones = tone ? tone.split(",").filter(Boolean) : [];
  if (categories.length > 0) {
    rows = rows.filter((row) => categories.includes(String(row.eventRootCode)));
  }
  if (tones.length > 0) {
    rows = rows.filter((row) =>
      tones.includes(toneCategoryForRow(row.goldstein)),
    );
  }

  const rankedAll = [...rows].sort(SORTERS[sortBy] || SORTERS.significance);
  if (sortDir === "asc") rankedAll.reverse();

  const offsetNum = Number(offset);
  const limitNum = Number(limit);
  const ranked = rankedAll.slice(offsetNum, offsetNum + limitNum);

  const decorated = await Promise.all(
    ranked.map(async (row) => {
      const pageMeta = row.sourceUrl
        ? await fetchPageMetadata(c.env, row.sourceUrl)
        : null;

      return {
        ...row,
        actor1: decodeActor(row.actor1Code),
        actor2: decodeActor(row.actor2Code),
        eventTypeLabel: decodeEventCode(row.eventCode, row.eventRootCode),
        headline: pageMeta?.title || null,
        preview: pageMeta?.description || null,
        image: pageMeta?.image || null,
      };
    }),
  );

  return c.json({
    events: decorated,
    meta: {
      country,
      matched: rows.length,
      returned: decorated.length,
      offset: offsetNum,
      hasMore: offsetNum + decorated.length < rows.length,
    },
  });
});

// temporary measure that acts as a 15 min cron job locally
events.post("/events/_ingest-latest", async (c) => {
  const result = await ingestLatestEventsFile(c.env);
  return c.json(result);
});

export default events;
