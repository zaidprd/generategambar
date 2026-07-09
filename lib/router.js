// OTAK ROUTER (gratis, tanpa LLM berbayar).
// Meniru cara Claude di skill Hassan memilih engine: baca 1 prompt lalu putuskan
// apakah ini permintaan DESAIN (butuh teks tajam -> engine SVG) atau FOTO
// (diffusion Cloudflare). Untuk desain, teks yang ditampilkan DIEKSTRAK dari
// prompt itu sendiri -> user cukup 1 prompt, tanpa input teks terpisah.

// Kata kunci yang menandakan permintaan "desain berteks".
const DESIGN_WORDS = [
  "poster", "quote", "kutipan", "quote card", "kartu ucapan", "ucapan",
  "cover", "sampul", "banner", "spanduk", "thumbnail", "judul", "tulisan",
  "bertuliskan", "teks", "text", "logo", "caption", "flyer", "pamflet",
  "undangan", "kata-kata", "headline", "tipografi", "typography", "feed",
  "carousel", "story ig", "reels cover", "cover tiktok",
];

// Petunjuk mood -> palette (dipakai engine desain).
const MOOD_MAP = [
  { m: "neon", k: ["neon", "synthwave", "cyberpunk", "vaporwave", "glow"] },
  { m: "dark", k: ["dark", "gelap", "malam", "hitam", "night", "mewah", "luxury"] },
  { m: "warm", k: ["promo", "sale", "diskon", "obral", "flash", "semangat", "api", "merah"] },
  { m: "soft", k: ["soft", "pastel", "lembut", "minimal", "clean", "bersih", "tenang"] },
  { m: "elegant", k: ["islami", "muslim", "walimah", "nikah", "syar", "elegan", "emas", "gold", "hijau"] },
];

function stripAccents(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Ambil teks di dalam tanda kutip: "..." '...' “...” ‘...’
function extractQuoted(prompt) {
  const m = prompt.match(/["“'‘]([^"”'’]{2,80})["”'’]/);
  return m ? m[1].trim() : null;
}

// Ambil teks setelah kata kunci seperti: judul/tulisan/bertuliskan/teks/kata.
function extractAfterKeyword(prompt) {
  const m = prompt.match(
    /(?:judul|tulisan|bertuliskan|teks|text|kata|headline)\s*[:\-]?\s*["“'‘]?([^"”'’.,;\n]{2,60})/i
  );
  return m ? m[1].trim() : null;
}

// Bersihkan kata kunci desain dari prompt supaya sisanya bisa jadi headline.
function fallbackHeadline(prompt) {
  let t = prompt;
  DESIGN_WORDS.forEach((w) => {
    t = t.replace(new RegExp(`\\b${w}\\b`, "gi"), " ");
  });
  t = t.replace(/\b(buat|bikin|gambar|desain|design|untuk|tentang|dengan|yang|sebuah|dong|ya)\b/gi, " ");
  t = t.replace(/\s+/g, " ").trim();
  // ambil maksimal ~6 kata pertama sebagai headline
  const words = t.split(" ").filter(Boolean).slice(0, 6);
  return words.join(" ");
}

const ACRONYMS = new Set([
  "seo", "sem", "ai", "ig", "pdf", "html", "css", "cta", "roi", "kpi",
  "umkm", "cv", "faq", "url", "ux", "ui", "wa", "pt", "cv",
]);

function titleCase(s) {
  return s.replace(/\w\S*/g, (w) =>
    ACRONYMS.has(w.toLowerCase())
      ? w.toUpperCase()
      : w.charAt(0).toUpperCase() + w.slice(1)
  );
}

function detectMood(promptLc) {
  for (const { m, k } of MOOD_MAP) {
    if (k.some((w) => promptLc.includes(w))) return m;
  }
  return "default";
}

// Ekstrak headline + mood dari prompt APA PUN (dipakai style desain yang
// dipaksa ke engine SVG, mis. Poster/Carousel IG/Cover TikTok — di situ user
// cuma menulis topik, bukan kata kunci "poster/carousel").
export function designFromPrompt(prompt) {
  const raw = (prompt || "").trim();
  const lc = stripAccents(raw.toLowerCase());
  const quoted = extractQuoted(raw);
  let headline = quoted || extractAfterKeyword(raw) || fallbackHeadline(raw) || raw;
  if (!quoted && headline === headline.toLowerCase()) headline = titleCase(headline);
  headline = headline.slice(0, 80) || "Tanpa Judul";
  return { headline, mood: detectMood(lc) };
}

// Parse field opsional untuk template desain:
//   judul "..."  sub "..."  isi "..."  kicker "..."  badges "a, b, c"
//   note "..."   dan nomor halaman "2/7".
// Semua opsional — minimal cukup topik polos.
export function parseDesignFields(prompt) {
  const raw = (prompt || "").trim();
  const get = (kw) => {
    const m = raw.match(new RegExp(`${kw}\\s*[:=]?\\s*["“]([^"”]{1,300})["”]`, "i"));
    return m ? m[1].trim() : null;
  };
  const subtitle = get("sub(?:judul)?");
  const body = get("isi") || get("body");
  const kicker = get("kicker") || get("label");
  const badgesRaw = get("badges?") || get("pills?");
  const note = get("note") || get("catatan");
  const pageM = raw.match(/\b(\d{1,2})\s*\/\s*(\d{1,2})\b/);

  // Buang semua field bertanda kutip selain judul, lalu ekstrak headline+mood.
  const rest = raw
    .replace(/\b(sub(?:judul)?|isi|body|kicker|label|badges?|pills?|note|catatan)\s*[:=]?\s*["“][^"”]*["”]/gi, " ")
    .replace(/\b\d{1,2}\s*\/\s*\d{1,2}\b/, " ");
  const base = designFromPrompt(rest);

  return {
    headline: base.headline,
    mood: base.mood,
    subtitle,
    body,
    kicker,
    badges: badgesRaw ? badgesRaw.split(/[,;]/).map((s) => s.trim()).filter(Boolean).slice(0, 4) : null,
    note,
    page: pageM ? [parseInt(pageM[1], 10), parseInt(pageM[2], 10)] : null,
  };
}

// Keputusan utama.
export function classifyPrompt(prompt) {
  const raw = (prompt || "").trim();
  const lc = stripAccents(raw.toLowerCase());

  const quoted = extractQuoted(raw);
  const hasDesignWord = DESIGN_WORDS.some((w) => lc.includes(w));
  const isDesign = Boolean(quoted) || hasDesignWord;

  if (!isDesign) {
    return { type: "photo" };
  }

  // Tentukan teks headline yang akan dirender tajam.
  let headline =
    quoted ||
    extractAfterKeyword(raw) ||
    fallbackHeadline(raw) ||
    raw;

  // Kalau bukan dari kutipan, rapikan kapitalisasinya.
  if (!quoted && headline === headline.toLowerCase()) {
    headline = titleCase(headline);
  }
  headline = headline.slice(0, 80);

  return {
    type: "design",
    headline,
    mood: detectMood(lc),
  };
}
