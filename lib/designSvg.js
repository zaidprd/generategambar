// ENGINE DESAIN — versi web/SVG dari "Level 1" Hassan.
// Membangun grafis dari gradient + bentuk + tipografi (font vektor) => TEKS
// SELALU TAJAM & benar, tanpa model AI, tanpa biaya. Dipakai untuk prompt yang
// diklasifikasikan router sebagai "design".

import { RATIOS } from "./options.js";

// Palette per mood (bg = 2 stop gradient, plus warna teks/aksen/kicker).
const PALETTES = {
  neon:    { bg: ["#0b0618", "#2a0a4a"], glow: "#ff2fb0", text: "#ffffff", accent: "#22d3ee", kicker: "#c4b5fd", shape: "#ff2fb0" },
  dark:    { bg: ["#0f172a", "#1e293b"], glow: "#334155", text: "#f8fafc", accent: "#fbbf24", kicker: "#94a3b8", shape: "#38bdf8" },
  warm:    { bg: ["#7f1d1d", "#ea580c"], glow: "#fb923c", text: "#fff7ed", accent: "#fde047", kicker: "#fed7aa", shape: "#fdba74" },
  soft:    { bg: ["#f5f0e6", "#e7ded0"], glow: "#ffffff", text: "#1f2937", accent: "#c2603f", kicker: "#8a8377", shape: "#d9b8a5" },
  elegant: { bg: ["#052e2b", "#0f5132"], glow: "#0b3d39", text: "#f4f1e8", accent: "#d4af37", kicker: "#9db8a6", shape: "#1c6b52" },
  default: { bg: ["#1e1b4b", "#2563eb"], glow: "#3b82f6", text: "#ffffff", accent: "#fbbf24", kicker: "#c7d2fe", shape: "#60a5fa" },
};

// RNG sederhana berbasis seed supaya tiap varian sedikit berbeda.
function rng(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Perkiraan lebar teks bold sans (cukup akurat untuk fit).
function textWidth(text, size) {
  return text.length * size * 0.56;
}

// Bungkus teks jadi beberapa baris agar muat dalam maxWidth.
function wrap(text, size, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = words[0] || "";
  for (let i = 1; i < words.length; i++) {
    const test = `${line} ${words[i]}`;
    if (textWidth(test, size) > maxWidth) {
      lines.push(line);
      line = words[i];
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// ====================== TEMPLATE "ZINE TERRACOTTA" ======================
// Meniru gaya retro zine: kertas cream, serif besar dengan 1 kata terracotta,
// subjudul typewriter + garis gelombang, pill badge, maskot pixel-art,
// catatan script. Dipakai default oleh style Carousel IG & Cover TikTok.

const ZINE = {
  bg: "#F2ECE0",
  ink: "#2E2B27",
  accent: "#C05B33",
  muted: "#8A8377",
  card: "#EDE3CE",
  yellow: "#E4B04A",
  blue: "#A9C8DC",
  ground: "#6B5B45",
  serif: "Georgia,'Times New Roman',serif",
  type: "'Courier New',Courier,monospace",
  script: "'Segoe Script','Bradley Hand',cursive",
  sans: "'Segoe UI',Arial,'Noto Sans',sans-serif",
};

// Garis bergelombang (squiggle) khas zine.
function wavy(x, y, w, color, amp = 4, step = 14, sw = 3) {
  let d = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
  const n = Math.max(2, Math.round(w / step));
  for (let i = 0; i < n; i++) d += ` q ${step / 2} ${i % 2 ? amp : -amp} ${step} 0`;
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`;
}

// Gambar pixel-art dari peta karakter. R=terracotta K=ink B=biru C=cream Y=kuning
function pixels(map, x0, y0, cell, extra = {}) {
  const colors = { R: ZINE.accent, K: ZINE.ink, B: ZINE.blue, C: ZINE.bg, Y: ZINE.yellow, ...extra };
  let out = "";
  map.forEach((row, r) => {
    [...row].forEach((ch, c) => {
      const col = colors[ch];
      if (col)
        out += `<rect x="${(x0 + c * cell).toFixed(1)}" y="${(y0 + r * cell).toFixed(1)}" width="${cell + 0.6}" height="${cell + 0.6}" fill="${col}"/>`;
    });
  });
  return out;
}

const ROBOT = [
  "..RRRRRR..",
  ".RRRRRRRR.",
  ".RKKRRKKR.",
  ".RKKRRKKR.",
  ".RRRRRRRR.",
  ".RRKKKKRR.",
  ".RRRRRRRR.",
  "..R.RR.R..",
];
const MAGNIFIER = [
  ".RRRR...",
  "R....R..",
  "R.BB.R..",
  "R.BB.R..",
  "R....R..",
  ".RRRR...",
  "....KK..",
  ".....KK.",
];
const DOC_ICON = [
  "RRRRRRRR",
  "RCCCCCCR",
  "RCKKKKCR",
  "RCCCCCCR",
  "RCKKKCCR",
  "RCCCCCCR",
  "RCKKCCCR",
  "RRRRRRRR",
];

// Kata aksen: tanda *kata* di judul, atau otomatis kata terpanjang (>=5 huruf).
function splitAccent(headline) {
  let text = headline || "";
  let accent = null;
  const m = text.match(/\*([^*]{2,40})\*/);
  if (m) {
    accent = m[1].trim();
    text = text.replace(/\*/g, "");
  } else {
    const words = text.split(/\s+/).filter((w) => w.replace(/\W/g, "").length >= 5);
    if (words.length) accent = words.reduce((a, b) => (b.length > a.length ? b : a));
  }
  const accentSet = new Set(
    (accent || "").toLowerCase().split(/\s+/).map((w) => w.replace(/[^\w&%+-]/g, ""))
  );
  return { text: text.replace(/\s+/g, " ").trim(), accentSet };
}

// Bungkus kata (dengan faktor lebar font) jadi baris-baris array kata.
function wrapWords(words, size, maxW, factor) {
  const lines = [];
  let cur = [];
  let curW = 0;
  const spaceW = size * factor;
  for (const w of words) {
    const ww = w.t.length * size * factor;
    if (cur.length && curW + spaceW + ww > maxW) {
      lines.push(cur);
      cur = [w];
      curW = ww;
    } else {
      cur.push(w);
      curW += cur.length === 1 ? ww : spaceW + ww;
    }
  }
  if (cur.length) lines.push(cur);
  return lines;
}

function lineToTspans(line, colorFor) {
  return line
    .map((w, i) => `<tspan fill="${colorFor(w)}">${i ? " " : ""}${esc(w.t)}</tspan>`)
    .join("");
}

function buildZineSVG(opts) {
  const ratio = RATIOS.find((r) => r.id === (opts.ratioId || "4:5")) || RATIOS[1];
  const W = ratio.width;
  const H = ratio.height;
  const Z = ZINE;
  const parts = [`<rect width="${W}" height="${H}" fill="${Z.bg}"/>`];

  const { text: hText, accentSet } = splitAccent(opts.headline || "Tanpa Judul");
  const isSlide = Boolean(opts.body);
  const handle = "@zaidprd";
  const SERIF_F = 0.54; // faktor lebar Georgia bold
  const MONO_F = 0.6;
  const SANS_F = 0.5;

  if (!isSlide) {
    // ---------- LAYOUT COVER ----------
    parts.push(
      `<text x="${W / 2}" y="${H * 0.075}" font-family="${Z.type}" font-weight="bold" font-size="${Math.round(W * 0.028)}" letter-spacing="3" fill="${Z.muted}" text-anchor="middle">${esc(handle)}</text>`
    );

    // Judul serif, fit lebar
    const maxW = W * 0.86;
    let size = Math.round(W * 0.105);
    const words = hText.split(/\s+/).map((t) => ({ t }));
    let lines = wrapWords(words, size, maxW, SERIF_F);
    while (size > W * 0.05 && (lines.length * size * 1.22 > H * 0.34 || lines.some((l) => l.reduce((a, w) => a + w.t.length, l.length - 1) * size * SERIF_F > maxW))) {
      size -= 2;
      lines = wrapWords(words, size, maxW, SERIF_F);
    }
    const lineH = size * 1.22;
    let y = H * 0.175 + size * 0.85;
    const colorFor = (w) => (accentSet.has(w.t.toLowerCase().replace(/[^\w&%+-]/g, "")) ? Z.accent : Z.ink);
    for (const line of lines) {
      parts.push(
        `<text x="${W / 2}" y="${y.toFixed(1)}" font-family="${Z.serif}" font-weight="bold" font-size="${size}" text-anchor="middle" xml:space="preserve">${lineToTspans(line, colorFor)}</text>`
      );
      y += lineH;
    }

    // Subjudul typewriter + squiggle
    if (opts.subtitle) {
      const ss = Math.round(W * 0.031);
      const sw = opts.subtitle.length * ss * MONO_F;
      y += ss * 0.4;
      parts.push(
        `<text x="${W / 2}" y="${y.toFixed(1)}" font-family="${Z.type}" font-weight="bold" font-size="${ss}" fill="${Z.ink}" text-anchor="middle">${esc(opts.subtitle)}</text>`
      );
      parts.push(wavy(W / 2 - Math.min(sw, W * 0.7) / 2, y + ss * 0.55, Math.min(sw, W * 0.7), Z.accent));
      y += ss * 1.6;
    }

    // Pill badges
    if (opts.badges && opts.badges.length) {
      const bs = Math.round(W * 0.024);
      const ph = bs * 2.3;
      const pad = bs * 1.1;
      const gap = W * 0.022;
      const widths = opts.badges.map((b) => b.length * bs * MONO_F + pad * 2);
      const total = widths.reduce((a, b) => a + b, 0) + gap * (widths.length - 1);
      let bx = W / 2 - total / 2;
      const by = y + H * 0.02;
      opts.badges.forEach((b, i) => {
        parts.push(
          `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${widths[i].toFixed(1)}" height="${ph}" rx="${ph / 2}" fill="none" stroke="${Z.accent}" stroke-width="2.5"/>`,
          `<text x="${(bx + widths[i] / 2).toFixed(1)}" y="${(by + ph * 0.66).toFixed(1)}" font-family="${Z.type}" font-weight="bold" font-size="${bs}" fill="${Z.ink}" text-anchor="middle">${esc(b)}</text>`
        );
        bx += widths[i] + gap;
      });
      y = by + ph; // posisi bawah baris badge
    }

    // Maskot pixel: robot + kaca pembesar, di atas garis tanah.
    // Posisinya mengikuti bawah konten agar tidak menabrak badge/subjudul.
    const cell = W * 0.028;
    const groupW = (10 + 3 + 8) * cell;
    const mx = W / 2 - groupW / 2;
    const my = Math.min(Math.max(H * 0.56, y + H * 0.05), H * 0.68);
    parts.push(pixels(ROBOT, mx, my, cell));
    parts.push(pixels(MAGNIFIER, mx + 13 * cell, my + 0.5 * cell, cell));
    const gy = my + 8.6 * cell;
    parts.push(`<rect x="${W * 0.16}" y="${gy.toFixed(1)}" width="${W * 0.68}" height="${Math.max(4, W * 0.006)}" fill="${Z.ground}"/>`);

    // Catatan script bawah
    if (opts.note) {
      const ns = Math.round(W * 0.042);
      const ny = H * 0.905;
      const nw = Math.min(opts.note.length * ns * 0.46, W * 0.7);
      parts.push(
        `<text x="${W / 2}" y="${ny}" font-family="${Z.script}" font-size="${ns}" fill="${Z.accent}" text-anchor="middle">${esc(opts.note)}</text>`
      );
      parts.push(wavy(W / 2 - nw / 2, ny + ns * 0.5, nw, Z.accent));
    }
  } else {
    // ---------- LAYOUT SLIDE ISI ----------
    const LX = W * 0.08;
    let y = H * 0.09;
    if (opts.kicker) {
      const ks = Math.round(W * 0.032);
      parts.push(
        `<text x="${LX}" y="${y.toFixed(1)}" font-family="${Z.type}" font-weight="bold" font-size="${ks}" fill="${Z.accent}">${esc(opts.kicker)}</text>`
      );
      parts.push(wavy(LX, y + ks * 0.55, opts.kicker.length * ks * MONO_F, Z.accent));
      y += ks * 2.2;
    }

    // Judul kiri
    const maxW = W * 0.84;
    let size = Math.round(W * 0.082);
    const words = hText.split(/\s+/).map((t) => ({ t }));
    let lines = wrapWords(words, size, maxW, SERIF_F);
    while (size > W * 0.045 && lines.length * size * 1.2 > H * 0.24) {
      size -= 2;
      lines = wrapWords(words, size, maxW, SERIF_F);
    }
    y += size * 0.9;
    const colorFor = (w) => (accentSet.has(w.t.toLowerCase().replace(/[^\w&%+-]/g, "")) ? Z.accent : Z.ink);
    for (const line of lines) {
      parts.push(
        `<text x="${LX}" y="${y.toFixed(1)}" font-family="${Z.serif}" font-weight="bold" font-size="${size}">${lineToTspans(line, colorFor)}</text>`
      );
      y += size * 1.2;
    }

    // Kartu isi + tab folder
    const bodyRaw = opts.body || "";
    const colonIdx = bodyRaw.indexOf(":");
    const prefix = colonIdx > 0 && colonIdx < 25 ? bodyRaw.slice(0, colonIdx + 1) : "";
    const restText = prefix ? bodyRaw.slice(colonIdx + 1).trim() : bodyRaw;
    const bWords = [
      ...prefix.split(/\s+/).filter(Boolean).map((t) => ({ t, a: true })),
      ...restText.split(/\s+/).filter(Boolean).map((t) => ({ t, a: false })),
    ];
    const bSize = Math.round(W * 0.036);
    const pad = W * 0.05;
    const cardX = LX;
    const cardW = W * 0.84;
    const bLines = wrapWords(bWords, bSize, cardW - pad * 2, SANS_F);
    const bLineH = bSize * 1.75;
    const cardY = y + H * 0.035;
    const cardH = pad * 1.6 + bLines.length * bLineH;
    const tabColor = opts.page && opts.page[0] % 2 === 0 ? Z.blue : Z.yellow;
    parts.push(
      `<rect x="${(cardX + W * 0.02).toFixed(1)}" y="${(cardY - H * 0.022).toFixed(1)}" width="${W * 0.13}" height="${H * 0.05}" rx="12" fill="${tabColor}"/>`,
      `<rect x="${cardX}" y="${cardY.toFixed(1)}" width="${cardW}" height="${cardH.toFixed(1)}" rx="26" fill="${Z.card}"/>`
    );
    let by = cardY + pad * 0.9 + bSize * 0.8;
    for (const line of bLines) {
      parts.push(
        `<text x="${(cardX + pad).toFixed(1)}" y="${by.toFixed(1)}" font-family="${Z.sans}" font-size="${bSize}" font-weight="500">${line
          .map((w, i) => `<tspan fill="${w.a ? Z.accent : Z.ink}"${w.a ? ' font-weight="bold"' : ""}>${i ? " " : ""}${esc(w.t)}</tspan>`)
          .join("")}</text>`
      );
      by += bLineH;
    }

    // Ikon pixel dokumen kanan-bawah
    const icell = W * 0.02;
    parts.push(pixels(DOC_ICON, W * 0.72, Math.min(cardY + cardH + H * 0.05, H * 0.76), icell));

    // Footer: handle kiri, nomor halaman kanan
    const fs = Math.round(W * 0.028);
    const fy = H * 0.945;
    parts.push(
      `<text x="${LX}" y="${fy}" font-family="${Z.type}" font-weight="bold" font-size="${fs}" fill="${Z.muted}">${esc(handle)}</text>`
    );
    if (opts.page) {
      const pg = `${String(opts.page[0]).padStart(2, "0")}/${String(opts.page[1]).padStart(2, "0")}`;
      parts.push(
        `<text x="${W * 0.92}" y="${fy}" font-family="${Z.type}" font-weight="bold" font-size="${fs}" fill="${Z.muted}" text-anchor="end">${esc(pg)}</text>`
      );
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${parts.join("\n  ")}
</svg>`;
}

export function buildDesignSVG({ headline, mood = "default", ratioId = "1:1", seed = 1, template, subtitle, body, kicker, badges, note, page }) {
  if (template === "zine") {
    return buildZineSVG({ headline, ratioId, subtitle, body, kicker, badges, note, page });
  }
  headline = (headline || "").replace(/\*/g, "");
  return buildGradientSVG({ headline, mood, ratioId, seed });
}

function buildGradientSVG({ headline, mood = "default", ratioId = "1:1", seed = 1 }) {
  const ratio = RATIOS.find((r) => r.id === ratioId) || RATIOS[0];
  const W = ratio.width;
  const H = ratio.height;
  const p = PALETTES[mood] || PALETTES.default;
  const rand = rng(seed * 7 + W);

  const text = (headline || "").trim() || "Tanpa Judul";
  const maxWidth = W * 0.84;

  // Cari ukuran font terbesar yang muat lebar & tinggi.
  let size = Math.round(W * 0.16);
  const minSize = Math.round(W * 0.05);
  let lines = wrap(text, size, maxWidth);
  while (size > minSize) {
    lines = wrap(text, size, maxWidth);
    const widest = Math.max(...lines.map((l) => textWidth(l, size)));
    const blockH = lines.length * size * 1.12;
    if (widest <= maxWidth && blockH <= H * 0.5) break;
    size -= 2;
  }
  const lineH = size * 1.12;
  const blockH = lines.length * lineH;
  const startY = H / 2 - blockH / 2 + size * 0.82;

  // Bentuk dekoratif (lingkaran besar low-opacity) untuk kedalaman.
  const shapes = [];
  const n = 2 + Math.floor(rand() * 2);
  for (let i = 0; i < n; i++) {
    const cx = Math.round(rand() * W);
    const cy = Math.round(rand() * H);
    const r = Math.round((0.2 + rand() * 0.35) * Math.min(W, H));
    shapes.push(
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${p.shape}" opacity="0.14"/>`
    );
  }

  const kicker = mood === "elegant" ? "بِسْمِ اللّٰه" : "◆ ZAIDLY";
  const fontStack =
    "'Segoe UI','Helvetica Neue',Arial,'Noto Sans',system-ui,sans-serif";

  const headlineSpans = lines
    .map(
      (l, i) =>
        `<text x="${W / 2}" y="${startY + i * lineH}" font-family="${fontStack}" font-size="${size}" font-weight="800" fill="${p.text}" text-anchor="middle" letter-spacing="-0.5">${esc(l)}</text>`
    )
    .join("");

  // Garis aksen di bawah headline.
  const accentY = startY + (lines.length - 1) * lineH + size * 0.55;
  const accentW = Math.min(maxWidth * 0.5, W * 0.32);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.bg[0]}"/>
      <stop offset="1" stop-color="${p.bg[1]}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.42" r="0.7">
      <stop offset="0" stop-color="${p.glow}" stop-opacity="0.45"/>
      <stop offset="1" stop-color="${p.glow}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${shapes.join("\n  ")}
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <text x="${W / 2}" y="${H * 0.14}" font-family="${fontStack}" font-size="${Math.round(W * 0.032)}" font-weight="700" fill="${p.kicker}" text-anchor="middle" letter-spacing="6">${esc(kicker)}</text>
  ${headlineSpans}
  <rect x="${(W - accentW) / 2}" y="${accentY}" width="${accentW}" height="${Math.max(4, Math.round(W * 0.006))}" rx="3" fill="${p.accent}"/>
</svg>`;
}

// Bungkus jadi data URL siap pakai di <img>.
export function designToDataUrl(opts) {
  const svg = buildDesignSVG(opts);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
