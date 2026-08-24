import fetch from "node-fetch";

const NEWS_API_BASE = "https://newsapi.org/v2";

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

  const response = await fetch(url.toString(), {
    headers: { "X-Api-Key": apiKey },
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

  const response = await fetch(url.toString(), {
    headers: { "X-Api-Key": apiKey },
  });

  const data = await response.json();
  return { response, data, url };
}
