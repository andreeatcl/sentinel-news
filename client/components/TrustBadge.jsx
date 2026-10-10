import Badge from "./ui/Badge";
import { getFlagSrc } from "../utils/flags";

const TIER_STYLE = {
  trusted: { tone: "positive", label: "Trusted" },
  "state-affiliated": { tone: "negative", label: "State media" },
  unreliable: { tone: "negative", label: "Unreliable" },
};

export default function TrustBadge({ trust, detailed = false }) {
  if (!trust?.tier) return null;
  const style = TIER_STYLE[trust.tier];
  if (!style) return null;

  const flagSrc = getFlagSrc(trust.country);

  return (
    <>
      {flagSrc && (
        <img
          src={flagSrc}
          alt={trust.country.toUpperCase()}
          title={trust.country.toUpperCase()}
          className="w-4 h-3 rounded-sm shrink-0 object-cover ring-1 ring-white/10"
        />
      )}
      <Badge tone={style.tone}>{style.label}</Badge>
      {detailed && trust.note && (
        <span className="block w-full text-xs text-carbon-500 mt-1.5 font-normal leading-relaxed">
          {trust.note}
        </span>
      )}
    </>
  );
}
