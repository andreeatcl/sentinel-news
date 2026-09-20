const NEWS_API_BASE = "https://newsapi.org/v2";

const USER_AGENT = "Sentinel/1.0 (personal news monitor)";

const FETCH_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchEverything({
  apiKey,
  q,
  sortBy = "relevancy",
  from,
  language,
  pageSize = 100,
  page = 1,
  searchIn = "title,description",
}) {
  const url = new URL(`${NEWS_API_BASE}/everything`);
  url.searchParams.set("q", q);
  url.searchParams.set("sortBy", sortBy);
  if (language) {
    url.searchParams.set("language", language);
  }
  url.searchParams.set("pageSize", pageSize);
  url.searchParams.set("page", page);
  url.searchParams.set("searchIn", searchIn);
  if (from) url.searchParams.set("from", from);

  const response = await fetchWithTimeout(url.toString(), {
    headers: { "X-Api-Key": apiKey, "User-Agent": USER_AGENT },
  });

  const data = await response.json();
  return { response, data, url };
}

export async function fetchTopHeadlines({
  apiKey,
  country = "us",
  category = "general",
  pageSize = 10,
}) {
  const url = new URL(`${NEWS_API_BASE}/top-headlines`);
  url.searchParams.set("country", country);
  url.searchParams.set("category", category);
  url.searchParams.set("pageSize", pageSize);

  const response = await fetchWithTimeout(url.toString(), {
    headers: { "X-Api-Key": apiKey, "User-Agent": USER_AGENT },
  });

  const data = await response.json();
  return { response, data, url };
}
