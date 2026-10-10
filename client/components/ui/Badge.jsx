const TONES = {
  neutral: "text-carbon-300 border-carbon-700 bg-carbon-800",
  accent: "text-white border-accent/50 bg-accent/15",
  positive: "text-signal-green border-signal-green/30 bg-signal-green/10",
  warning: "text-signal-amber border-signal-amber/30 bg-signal-amber/10",
  negative: "text-signal-red border-signal-red/30 bg-signal-red/10",
};

// status label used for trust tiers, provider, language etc
export default function Badge({ tone = "neutral", className = "", children }) {
  return (
    <span
      className={`inline-flex items-center h-[18px] px-1.5 rounded border text-2xs font-medium leading-none whitespace-nowrap shrink-0 ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
