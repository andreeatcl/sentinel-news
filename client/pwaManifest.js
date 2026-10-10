export const pwaManifest = {
  name: "Sentinel - Global News Monitor",
  short_name: "Sentinel",
  description: "Country-by-country geopolitical news monitoring.",
  start_url: "/",
  display: "standalone",
  background_color: "#111113",
  theme_color: "#111113",
  icons: [
    { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    {
      src: "/icons/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any maskable",
    },
  ],
};
