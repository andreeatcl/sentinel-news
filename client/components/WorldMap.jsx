import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION = "&copy; OpenStreetMap contributors";

// local copy with github dataset as fallback
const GEOJSON_SOURCES = [
  "/data/countries.geojson",
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson",
];

const ACCENT_RED = "#D80027";
const GEOJSON_TIMEOUT_MS = 10000;

async function fetchJsonWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

// check for country name mismatch
function getCountryName(feature) {
  const properties = feature?.properties ?? {};
  const candidates = [
    properties.ADMIN,
    properties.NAME,
    properties.NAME_EN,
    properties.FORMAL_EN,
    properties.GEONUNIT,
    properties.BRK_NAME,
    properties.SOVEREIGNT,
    properties.COUNTRY,
    properties.country,
    properties.name,
    properties.NAME_LONG,
  ];

  const resolved = candidates.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );

  return resolved?.trim() ?? "Unknown";
}

// country border styling
function countryStyle(feature, selectedCountry) {
  const countryName = getCountryName(feature);
  const isSelected = selectedCountry && countryName === selectedCountry;
  return {
    weight: isSelected ? 1.4 : 0.6,
    color: ACCENT_RED,
    fillColor: ACCENT_RED,
    fillOpacity: 0,
    opacity: isSelected ? 0.9 : 0.4,
  };
}

// Separate component so it lives inside MapContainer context
function GeoJSONLayer({ geoData, selectedCountry, onCountryClick }) {
  // Use a new key whenever selectedCountry changes so react-leaflet
  // re-creates the layer with fresh styles — avoids stale closure issues.
  const layerKey = selectedCountry || "__none__";
  const layerRef = useRef(null);

  function onEachFeature(feature, layer) {
    const name = getCountryName(feature);

    layer.on({
      mouseover(e) {
        e.target.setStyle({
          weight: 1.6,
          color: ACCENT_RED,
          fillOpacity: 0.2,
          opacity: 0.9,
        });
        e.target
          .bindTooltip(
            `<span style="font-family:'JetBrains Mono',monospace;font-size:11px;` +
              `letter-spacing:0.1em;color:${ACCENT_RED};background:#0d1017;` +
              `border:1px solid ${ACCENT_RED};padding:4px 8px;border-radius:2px;">` +
              `${name.toUpperCase()}</span>`,
            { sticky: true, className: "leaflet-tooltip-dark" },
          )
          .openTooltip();
      },
      mouseout(e) {
        if (layerRef.current) layerRef.current.resetStyle(e.target);
        e.target.closeTooltip();
      },
      click() {
        if (name !== "Unknown") {
          onCountryClick(name);
        }
      },
    });
  }

  return (
    <GeoJSON
      key={layerKey}
      ref={layerRef}
      data={geoData}
      style={(feature) => countryStyle(feature, selectedCountry)}
      onEachFeature={onEachFeature}
    />
  );
}

export default function WorldMap({ selectedCountry, onCountryClick }) {
  const [geoData, setGeoData] = useState(null);
  const [geoError, setGeoError] = useState(false);

  useEffect(() => {
    let canceled = false;

    async function loadGeoData() {
      for (const source of GEOJSON_SOURCES) {
        try {
          const data = await fetchJsonWithTimeout(source, GEOJSON_TIMEOUT_MS);
          if (!canceled) {
            setGeoData(data);
            setGeoError(false);
          }
          return;
        } catch {
          continue;
        }
      }

      if (!canceled) {
        setGeoError(true);
      }
    }

    loadGeoData();

    return () => {
      canceled = true;
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[20, 10]}
        zoom={2.5}
        minZoom={2}
        maxZoom={10}
        style={{ width: "100%", height: "100%" }}
        zoomControl={true}
        attributionControl={true}
        worldCopyJump={false}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        {geoData && (
          <GeoJSONLayer
            geoData={geoData}
            selectedCountry={selectedCountry}
            onCountryClick={onCountryClick}
          />
        )}
      </MapContainer>

      {/* GeoJSON loading overlay */}
      {!geoData && !geoError && (
        <div className="absolute bottom-10 left-4 z-[999] flex items-center gap-2 bg-carbon-900/90 border border-carbon-700/60 rounded px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-signal-amber pulse-dot" />
          <span className="text-[10px] font-mono text-carbon-400 uppercase tracking-widest">
            Loading borders…
          </span>
        </div>
      )}
      {geoError && (
        <div className="absolute bottom-10 left-4 z-[999] bg-carbon-900/90 border border-signal-red/40 rounded px-3 py-1.5">
          <span className="text-[10px] font-mono text-signal-red">
            Failed to load country borders (check
            /public/data/countries.geojson)
          </span>
        </div>
      )}
    </div>
  );
}
