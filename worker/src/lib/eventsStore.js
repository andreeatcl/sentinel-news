// Stores GDELT events bucketed by day, one KV key per day holding every
// tracked country's rows for that day: { [fipsCode]: [...rows] }.
// One key per day (not per country) deliberately keeps writes to a single
// KV op per ingestion tick — Cloudflare KV's free tier caps daily writes,
// and a 15-minute cron ticking 96x/day would blow past that if it wrote
// once per country instead of once per day touched.

const CURSOR_KEY = "gdelt:cursor";
const DAY_TTL_SECONDS = 60 * 60 * 24 * 45; // keep ~45 days, then self-clean

function dayKey(day) {
  return `gdelt:events:${day}`;
}

export async function getCursor(env) {
  return (await env.CACHE.get(CURSOR_KEY)) || null;
}

export async function setCursor(env, cursor) {
  await env.CACHE.put(CURSOR_KEY, cursor);
}

export async function getDayBucket(env, day) {
  const raw = await env.CACHE.get(dayKey(day));
  return raw ? JSON.parse(raw) : {};
}

// Merges newRowsByCountry ({ fipsCode: [...rows] }) into whatever's already
// stored for `day`, appending rather than overwriting.
export async function mergeDayBucket(env, day, newRowsByCountry) {
  const existing = await getDayBucket(env, day);

  for (const [fipsCode, rows] of Object.entries(newRowsByCountry)) {
    existing[fipsCode] = [...(existing[fipsCode] || []), ...rows];
  }

  await env.CACHE.put(dayKey(day), JSON.stringify(existing), {
    expirationTtl: DAY_TTL_SECONDS,
  });
}

// Reads every day in [fromDay, toDay] (inclusive, "YYYYMMDD" strings) and
// returns the concatenated rows matching any of fipsCodes.
export async function getEventsForRange(env, fipsCodes, fromDay, toDay) {
  const days = listDaysBetween(fromDay, toDay);
  const buckets = await Promise.all(days.map((day) => getDayBucket(env, day)));

  const results = [];
  for (const bucket of buckets) {
    for (const code of fipsCodes) {
      if (bucket[code]) results.push(...bucket[code]);
    }
  }
  return results;
}

function listDaysBetween(fromDay, toDay) {
  const parse = (d) =>
    new Date(
      Date.UTC(
        Number(d.slice(0, 4)),
        Number(d.slice(4, 6)) - 1,
        Number(d.slice(6, 8)),
      ),
    );
  const format = (date) => date.toISOString().slice(0, 10).replace(/-/g, "");

  const start = parse(fromDay);
  const end = parse(toDay);
  const days = [];
  for (
    let cursor = start;
    cursor <= end;
    cursor = new Date(cursor.getTime() + 86400000)
  ) {
    days.push(format(cursor));
  }
  return days;
}
