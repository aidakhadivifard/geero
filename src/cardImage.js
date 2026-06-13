// Renders a card to a shareable PNG (doc §4.6 step 2). Dependency-free: we compose
// a self-contained SVG (reusing the on-screen illustration markup) and rasterize it
// via canvas. Export type uses a system serif stack (Georgia) so it renders
// deterministically without fetching/embedding the web font — no CORS/taint risk.
const W = 1080;
const MARGIN = 48;
const PIN = 64;
const NIGHT = "#2E2430";
const CREAM = "#FBF6EE";
const GOLD = "#E8B872";
const GOLD_SOFT = "#F0CE98";
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Helvetica Neue', Arial, sans-serif";

let _measureCtx = null;
function measureCtx() {
  if (!_measureCtx) _measureCtx = document.createElement("canvas").getContext("2d");
  return _measureCtx;
}

function wrap(text, font, maxWidth) {
  const ctx = measureCtx();
  ctx.font = font;
  const lines = [];
  for (const para of String(text || "").split("\n")) {
    let line = "";
    for (const word of para.split(/\s+/)) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    lines.push(line);
  }
  return lines;
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function tspans(lines, x, startY, lineHeight) {
  return lines
    .map((l, i) => `<tspan x="${x}" y="${startY + i * lineHeight}">${esc(l)}</tspan>`)
    .join("");
}

// `illustrationInner` is the inner markup of the rendered card-art <svg>.
export function buildShareSVG(card, illustrationInner) {
  const cardX = MARGIN;
  const cardW = W - 2 * MARGIN;
  const innerW = cardW - 2 * PIN;
  const artX = cardX + PIN;
  const artY = MARGIN + PIN;
  const artW = innerW;
  const artH = Math.round(artW * (7 / 6));

  const nameSize = 64;
  const msgSize = 46;
  const msgLine = 62;
  const ctxSize = 30;
  const ctxLine = 42;

  const nameY = artY + artH + 92;
  const msgLines = wrap(card.message, `400 ${msgSize}px ${SERIF}`, innerW);
  const msgStart = nameY + 64;
  const msgEnd = msgStart + msgLines.length * msgLine;

  let ctxLines = [];
  let ctxStart = msgEnd + 18;
  if (card.context) {
    ctxLines = wrap(card.context, `400 ${ctxSize}px ${SANS}`, innerW);
  }
  const ctxEnd = card.context ? ctxStart + ctxLines.length * ctxLine : msgEnd;

  const footY = ctxEnd + 70;
  const cardH = footY + 30 - MARGIN;
  const H = cardH + MARGIN * 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${CREAM}"/>
  <rect x="${cardX}" y="${MARGIN}" width="${cardW}" height="${cardH}" rx="56" fill="${NIGHT}"/>
  <clipPath id="art-clip"><rect x="${artX}" y="${artY}" width="${artW}" height="${artH}" rx="40"/></clipPath>
  <g clip-path="url(#art-clip)">
    <svg x="${artX}" y="${artY}" width="${artW}" height="${artH}" viewBox="0 0 240 280" preserveAspectRatio="xMidYMid slice">${illustrationInner}</svg>
  </g>
  <text x="${artX}" y="${nameY}" font-family="${SERIF}" font-size="${nameSize}" fill="${GOLD_SOFT}">${esc(card.cardName)}</text>
  <text font-family="${SERIF}" font-size="${msgSize}" fill="${CREAM}">${tspans(msgLines, artX, msgStart, msgLine)}</text>
  ${card.context ? `<text font-family="${SANS}" font-size="${ctxSize}" fill="rgba(251,246,238,0.7)">${tspans(ctxLines, artX, ctxStart, ctxLine)}</text>` : ""}
  <text x="${artX}" y="${footY}" font-family="${SANS}" font-size="26" letter-spacing="3" fill="${GOLD}">DAWNHALO ✦</text>
</svg>`;
}

function svgToPngBlob(svg) {
  return new Promise((resolve, reject) => {
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || W;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
    };
    img.onerror = () => reject(new Error("svg render failed"));
    img.src = url;
  });
}

// High-level: given the rendered card DOM element + card data, return a PNG Blob.
export async function renderCardPng(cardEl, card) {
  const svgEl = cardEl?.querySelector(".card-art svg");
  const inner = svgEl ? svgEl.innerHTML : "";
  return svgToPngBlob(buildShareSVG(card, inner));
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
