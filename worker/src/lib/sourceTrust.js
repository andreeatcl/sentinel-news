import sourceTrustLabels from "../../../client/utils/sourceTrustLabels.json";

function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function getSourceTrustLabel(article) {
  const hostname = hostnameOf(article?.url || "");
  if (!hostname) return null;
  return sourceTrustLabels.domains[hostname] || null;
}
