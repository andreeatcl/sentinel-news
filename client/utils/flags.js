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

export function getFlagSrc(iso2) {
  return (iso2 && FLAGS[iso2.toLowerCase()]) || null;
}
