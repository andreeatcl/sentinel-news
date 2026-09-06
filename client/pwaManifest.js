export const pwaManifest = {
  name: "Sentinel - Global News Monitor",
  short_name: "Sentinel",
  description: "Country-by-country geopolitical news monitoring.",
  start_url: "/",
  display: "standalone",
  background_color: "#080a0e",
  theme_color: "#080a0e",
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
