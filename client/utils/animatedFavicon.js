const PERIOD_MS = 4000;
const FRAMES = 40;
const ACCENT = "#D80027";

function blipOpacity(phase) {
  if (phase >= 0.9) return 1 - (phase - 0.9) * 2;
  if (phase < 0.55) return 0.8 - (phase / 0.55) * 0.65;
  return 0.15;
}

export function radarFaviconSvg(angle = 0, blip = 0.8) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
<defs><linearGradient id="s" x1="12" y1="12" x2="22" y2="6" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="${ACCENT}" stop-opacity="0.1"/><stop offset="1" stop-color="${ACCENT}" stop-opacity="0.85"/>
</linearGradient></defs>
<circle cx="12" cy="12" r="11.5" fill="#111113"/>
<circle cx="12" cy="12" r="10.25" stroke="#d4d4d8" stroke-width="1.5"/>
<circle cx="12" cy="12" r="6.25" stroke="#d4d4d8" stroke-opacity="0.4"/>
<path d="M12 1.75v20.5M1.75 12h20.5" stroke="#d4d4d8" stroke-opacity="0.25"/>
<g transform="rotate(${angle.toFixed(1)} 12 12)">
<path d="M12 12 L12 1.75 A10.25 10.25 0 0 1 21.9 9.35 Z" fill="url(#s)"/>
<path d="M12 12 L21.9 9.35" stroke="${ACCENT}" stroke-width="1.75" stroke-linecap="round"/>
</g>
<circle cx="16.3" cy="6.6" r="1.6" fill="${ACCENT}" opacity="${blip.toFixed(2)}"/>
</svg>`;
}

function toDataUrl(svg) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function startAnimatedFavicon() {
  const link = document.getElementById("favicon");
  if (!link) return;

  const desktop = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!desktop.matches || reducedMotion.matches) return;

  const frames = Array.from({ length: FRAMES }, (_, i) => {
    const phase = i / FRAMES;
    return toDataUrl(radarFaviconSvg(phase * 360, blipOpacity(phase)));
  });

  let frame = 0;
  setInterval(() => {
    frame = (frame + 1) % FRAMES;
    link.href = frames[frame];
  }, PERIOD_MS / FRAMES);
}
