const flagModules = import.meta.glob("../assets/flags/*.svg", {
  eager: true,
  import: "default",
});
const FLAGS = Object.fromEntries(
  Object.entries(flagModules).map(([path, src]) => [
    path.match(/([a-z]{2})\.svg$/)[1],
    src,
  ]),
);

const CHIP_CLASS =
  "text-[8px] font-mono font-bold border rounded px-1 py-0.5 uppercase tracking-wider shrink-0";

const TIER_STYLE = {
  trusted: {
    chip: "text-signal-green border-signal-green/40 bg-signal-green/10",
    label: "TRUSTED",
  },
  "state-affiliated": {
    chip: "text-signal-red border-signal-red/40 bg-signal-red/10",
    label: "STATE MEDIA",
  },
  unreliable: {
    chip: "text-signal-red border-signal-red/40 bg-signal-red/10",
    label: "UNRELIABLE",
  },
};

export default function TrustBadge({ trust, detailed = false }) {
  if (!trust?.tier) return null;
  const style = TIER_STYLE[trust.tier];
  if (!style) return null;

  const flagSrc = trust.country && FLAGS[trust.country];

  return (
    <>
      {flagSrc && (
        <img
          src={flagSrc}
          alt={trust.country.toUpperCase()}
          title={trust.country.toUpperCase()}
          className="w-3.5 h-2.5 rounded-[1px] shrink-0 object-cover"
        />
      )}
      <span className={`${CHIP_CLASS} ${style.chip}`}>{style.label}</span>
      {detailed && trust.note && (
        <span className="block text-[10px] font-mono text-carbon-500 mt-1.5 normal-case font-normal">
          {trust.note}
        </span>
      )}
    </>
  );
}
