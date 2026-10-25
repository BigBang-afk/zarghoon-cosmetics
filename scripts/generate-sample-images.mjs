// Draws the simple product illustrations used by the sample products.
// Run with: node scripts/generate-sample-images.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = new URL("../public/samples/", import.meta.url);
mkdirSync(OUT, { recursive: true });

const INK = "#1A2B22";

function label(x, y, w, name, light) {
  const c = light ? "#ffffff" : INK;
  return `<g font-family="Georgia, serif" text-anchor="middle" fill="${c}">
    <text x="${x + w / 2}" y="${y}" font-size="13" letter-spacing="4">ZARGHOON</text>
    <text x="${x + w / 2}" y="${y + 22}" font-size="11" font-family="Arial, sans-serif" letter-spacing="1.5" opacity=".8">${name}</text>
  </g>`;
}

const shapes = {
  dropper: (c, name) => `
    <rect x="235" y="120" width="30" height="70" rx="6" fill="${INK}"/>
    <ellipse cx="250" cy="115" rx="22" ry="26" fill="${INK}"/>
    <rect x="215" y="185" width="70" height="30" rx="4" fill="#C9A15A"/>
    <rect x="180" y="210" width="140" height="190" rx="28" fill="${c}"/>
    <rect x="196" y="225" width="18" height="150" rx="9" fill="#fff" opacity=".18"/>
    <rect x="200" y="270" width="100" height="70" rx="6" fill="#F5F6F2" opacity=".92"/>
    ${label(200, 298, 100, name)}`,
  pump: (c, name) => `
    <rect x="232" y="95" width="80" height="16" rx="6" fill="${INK}"/>
    <rect x="240" y="105" width="20" height="60" fill="${INK}"/>
    <rect x="222" y="160" width="56" height="30" rx="6" fill="${INK}"/>
    <rect x="185" y="185" width="130" height="225" rx="22" fill="${c}"/>
    <rect x="200" y="200" width="16" height="190" rx="8" fill="#fff" opacity=".18"/>
    <rect x="200" y="260" width="100" height="80" rx="6" fill="#F5F6F2" opacity=".92"/>
    ${label(200, 292, 100, name)}`,
  bottle: (c, name) => `
    <rect x="222" y="95" width="56" height="70" rx="8" fill="${INK}"/>
    <rect x="232" y="160" width="36" height="25" fill="${c}" opacity=".85"/>
    <path d="M195 210 Q195 182 232 182 H268 Q305 182 305 210 V395 Q305 410 290 410 H210 Q195 410 195 395Z" fill="${c}"/>
    <rect x="208" y="215" width="14" height="170" rx="7" fill="#fff" opacity=".2"/>
    <rect x="207" y="265" width="86" height="80" rx="6" fill="#F5F6F2" opacity=".92"/>
    ${label(207, 298, 86, name)}`,
  jar: (c, name) => `
    <rect x="160" y="215" width="180" height="50" rx="12" fill="${INK}"/>
    <rect x="165" y="258" width="170" height="135" rx="26" fill="${c}"/>
    <rect x="180" y="272" width="14" height="105" rx="7" fill="#fff" opacity=".2"/>
    <rect x="200" y="290" width="100" height="72" rx="6" fill="#F5F6F2" opacity=".92"/>
    ${label(200, 320, 100, name)}`,
  tube: (c, name) => `
    <path d="M200 120 H300 L285 360 H215Z" fill="${c}"/>
    <rect x="196" y="110" width="108" height="14" rx="3" fill="${c}" opacity=".7"/>
    <rect x="222" y="358" width="56" height="52" rx="8" fill="${INK}"/>
    <rect x="212" y="135" width="12" height="200" rx="6" fill="#fff" opacity=".2"/>
    <rect x="215" y="200" width="70" height="80" rx="6" fill="#F5F6F2" opacity=".92"/>
    <g font-family="Georgia, serif" text-anchor="middle" fill="${INK}">
      <text x="250" y="232" font-size="10" letter-spacing="2">ZARGHOON</text>
      <text x="250" y="252" font-size="9" font-family="Arial, sans-serif">${name}</text>
    </g>`,
  lipstick: (c, name) => `
    <path d="M222 150 L278 125 V215 H222Z" fill="${c}"/>
    <rect x="216" y="210" width="68" height="55" rx="4" fill="#C9A15A"/>
    <rect x="210" y="262" width="80" height="150" rx="8" fill="${INK}"/>
    <rect x="222" y="275" width="10" height="125" rx="5" fill="#fff" opacity=".15"/>
    <g font-family="Georgia, serif" text-anchor="middle" fill="#F5F6F2">
      <text x="250" y="335" font-size="10" letter-spacing="2">ZARGHOON</text>
      <text x="250" y="355" font-size="9" font-family="Arial, sans-serif" opacity=".8">${name}</text>
    </g>`,
  pencil: (c, name) => `
    <g transform="rotate(-35 250 260)">
      <rect x="150" y="245" width="210" height="28" rx="4" fill="${INK}"/>
      <path d="M360 245 L400 259 L360 273Z" fill="#E7D2B3"/>
      <path d="M385 254 L400 259 L385 264Z" fill="${c}"/>
      <rect x="128" y="245" width="26" height="28" rx="4" fill="#C9A15A"/>
      <text x="255" y="264" font-family="Georgia, serif" font-size="11" letter-spacing="3" fill="#F5F6F2" text-anchor="middle">ZARGHOON · ${name}</text>
    </g>`,
  oil: (c, name) => `
    <rect x="232" y="100" width="36" height="55" rx="6" fill="#C9A15A"/>
    <rect x="238" y="150" width="24" height="30" fill="${c}"/>
    <circle cx="250" cy="295" r="115" fill="${c}"/>
    <ellipse cx="205" cy="255" rx="16" ry="50" fill="#fff" opacity=".18"/>
    <rect x="200" y="270" width="100" height="62" rx="6" fill="#F5F6F2" opacity=".92"/>
    ${label(200, 296, 100, name)}`,
};

function svg(shape, color, name, bg, accent) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="1000" height="1000">
  <rect width="500" height="500" fill="${bg}"/>
  <circle cx="390" cy="110" r="120" fill="${accent}" opacity=".35"/>
  <circle cx="90" cy="430" r="90" fill="${accent}" opacity=".25"/>
  <ellipse cx="250" cy="425" rx="120" ry="14" fill="${INK}" opacity=".08"/>
  ${shapes[shape](color, name)}
</svg>`;
}

const products = [
  ["saffron-glow-serum", "dropper", "#B5742A", "GLOW SERUM"],
  ["juniper-calm-cleanser", "pump", "#2F5D46", "GEL CLEANSER"],
  ["rosewater-toner", "bottle", "#D99A9A", "ROSE TONER"],
  ["barrier-night-cream", "jar", "#E8DCC8", "NIGHT CREAM"],
  ["daily-defence-moisturiser", "tube", "#9DB8A5", "DAILY DEFENCE"],
  ["velvet-matte-lipstick", "lipstick", "#A23B45", "VELVET MATTE"],
  ["silk-tint-lip-oil", "dropper", "#D97B6C", "LIP OIL"],
  ["skin-tint-foundation", "pump", "#C89B7B", "SKIN TINT"],
  ["brow-sculpt-pencil", "pencil", "#6B4A33", "BROW"],
  ["argan-shine-hair-oil", "oil", "#C98B2E", "HAIR OIL"],
  ["shea-oud-body-butter", "jar", "#7A5C46", "BODY BUTTER"],
  ["kohl-eyeliner", "pencil", "#1A2B22", "KOHL"],
];

for (const [slug, shape, color, name] of products) {
  writeFileSync(new URL(`${slug}-1.svg`, OUT), svg(shape, color, name, "#F5F6F2", "#E3ECE6"));
  writeFileSync(new URL(`${slug}-2.svg`, OUT), svg(shape, color, name, "#F6EBDC", "#E7C9A0"));
}

// Shade swatches for lip products, used as variant images.
const shades = {
  "velvet-matte-lipstick": { rose: "#C2566B", brick: "#9C3B2C", plum: "#6E2A47", nude: "#C48E7B" },
  "silk-tint-lip-oil": { clear: "#E8D9C5", peach: "#E59A7A", berry: "#8E2C4C" },
};
for (const [slug, map] of Object.entries(shades)) {
  const shape = slug.includes("lipstick") ? "lipstick" : "dropper";
  for (const [shade, color] of Object.entries(map)) {
    writeFileSync(new URL(`${slug}-${shade}.svg`, OUT), svg(shape, color, shade.toUpperCase(), "#F5F6F2", "#E3ECE6"));
  }
}

// Home page banner.
writeFileSync(
  new URL("hero.svg", OUT),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" width="2400" height="1400">
  <rect width="1200" height="700" fill="#E3ECE6"/>
  <circle cx="900" cy="340" r="300" fill="#F6EBDC"/>
  <circle cx="1120" cy="80" r="140" fill="#2F5D46" opacity=".12"/>
  <circle cx="660" cy="640" r="110" fill="#B5742A" opacity=".15"/>
  <g transform="translate(560 120) scale(0.9)">${shapes.bottle("#D99A9A", "ROSE TONER")}</g>
  <g transform="translate(720 60)">${shapes.dropper("#B5742A", "GLOW SERUM")}</g>
  <g transform="translate(860 150) scale(0.85)">${shapes.jar("#E8DCC8", "NIGHT CREAM")}</g>
</svg>`,
);

console.log("Sample images written to public/samples/");
