// maps a GDELT Goldstein score (-10..+10) onto the app's existing status-color language
export function toneCategory(goldstein) {
  if (goldstein > 1) return "positive";
  if (goldstein < -1) return "negative";
  return "neutral";
}

export const TONE_HEX = {
  positive: "#22c55e",
  negative: "#D80027",
  neutral: "#f59e0b",
};

export const TONE_TEXT_CLASS = {
  positive: "text-signal-green",
  negative: "text-signal-red",
  neutral: "text-signal-amber",
};

export const TONE_LABELS = {
  positive: "Cooperative",
  negative: "Conflict-leaning",
  neutral: "Neutral",
};
