// Konfigurasi bersama untuk UI dan API (style, rasio, model)

export const STYLES = [
  {
    id: "auto",
    label: "Auto",
    icon: "✨",
    prefix: "",
    suffix: ", highly detailed, best quality",
  },
  {
    id: "realistis",
    label: "Realistis",
    icon: "📷",
    prefix: "professional photography of ",
    suffix:
      ", photorealistic, ultra detailed, natural lighting, shallow depth of field, shot on DSLR, 8k",
  },
  {
    id: "muslim-faceless",
    label: "Muslim Faceless",
    icon: "🕌",
    prefix: "faceless flat vector illustration of ",
    suffix:
      ", islamic faceless character design, every face is a completely empty blank plain skin-colored oval with absolutely no eyes, no mouth, no nose, no eyebrows, no facial features whatsoever, featureless smooth blank face, head slightly detached from the body with a small visible gap at the neck, modest islamic clothing, women wearing hijab, long loose garments, soft pastel color palette, simple flat shapes, minimalist design, clean plain background",
    negative:
      "face, eyes, mouth, nose, lips, eyebrows, teeth, smile, pupils, eyelashes, facial features, detailed face, realistic face, portrait, face details, skin texture",
  },
  {
    id: "carousel-ig",
    label: "Carousel IG",
    icon: "📱",
    ratio: "4:5",
    model: "phoenix",
    prefix:
      "minimalist retro zine style instagram carousel cover poster about ",
    suffix:
      ", single clean centered layout on plain cream textured paper background, one large elegant bold serif headline in dark charcoal with one word highlighted in terracotta rust orange, small typewriter font subtitle underneath with a wavy squiggle underline, a row of three small rounded outline pill badges, one cute simple pixel art mascot illustration at the bottom center, short handwritten script note in terracotta at the very bottom, flat retro print design, lots of empty whitespace, uncluttered, muted warm earthy palette, portrait editorial poster composition",
    negative:
      "photo, photorealistic, 3d render, glossy, neon colors, dark background, cluttered, busy, collage, many panels, multiple frames, gradient background, watermark",
  },
  {
    id: "cover-tiktok",
    label: "Cover TikTok",
    icon: "🎵",
    ratio: "9:16",
    model: "phoenix",
    prefix:
      "minimalist retro zine style vertical tiktok video cover poster about ",
    suffix:
      ", single clean centered layout on plain cream textured paper background, one very large elegant bold serif headline in dark charcoal with one word highlighted in terracotta rust orange, small typewriter font subtitle underneath with a wavy squiggle underline, one cute simple pixel art mascot illustration at the bottom center, short handwritten script note in terracotta at the very bottom, flat retro print design, lots of empty whitespace, uncluttered, muted warm earthy palette, tall vertical poster composition",
    negative:
      "photo, photorealistic, 3d render, glossy, neon colors, dark background, cluttered, busy, collage, many panels, multiple frames, gradient background, watermark",
  },
  {
    id: "cinematic",
    label: "Sinematik",
    icon: "🎬",
    prefix: "cinematic still of ",
    suffix:
      ", cinematic lighting, dramatic atmosphere, film grain, anamorphic lens, movie scene, color graded",
  },
  {
    id: "catair",
    label: "Cat Air",
    icon: "🎨",
    prefix: "watercolor painting of ",
    suffix:
      ", soft watercolor style, delicate brush strokes, paper texture, pastel palette, artistic",
  },
  {
    id: "logo",
    label: "Logo",
    icon: "🔷",
    prefix: "minimalist vector logo design of ",
    suffix:
      ", flat design, clean lines, simple shapes, professional branding, white background, vector art",
  },
  {
    id: "poster",
    label: "Poster",
    icon: "🖼️",
    prefix: "graphic design poster of ",
    suffix:
      ", bold typography layout, striking composition, modern poster design, print quality",
  },
  {
    id: "minimalis",
    label: "Minimalis",
    icon: "⬜",
    prefix: "minimalist illustration of ",
    suffix:
      ", simple composition, negative space, limited palette, elegant, clean aesthetic",
  },
];

// Dimensi mengikuti bucket resolusi SDXL agar hasil optimal
export const RATIOS = [
  { id: "1:1", label: "1:1", width: 1024, height: 1024, hint: "Persegi" },
  { id: "4:5", label: "4:5", width: 896, height: 1120, hint: "Potret feed" },
  { id: "3:4", label: "3:4", width: 896, height: 1152, hint: "Potret" },
  { id: "9:16", label: "9:16", width: 768, height: 1344, hint: "Story/Reels" },
  { id: "4:3", label: "4:3", width: 1152, height: 896, hint: "Lanskap" },
  { id: "3:2", label: "3:2", width: 1216, height: 832, hint: "Foto" },
  { id: "16:9", label: "16:9", width: 1344, height: 768, hint: "Layar lebar" },
];

export const MODELS = [
  {
    id: "lucid",
    label: "Leonardo Lucid Origin",
    desc: "Kualitas terbaik, semua rasio, teks rapi",
    cfModel: "@cf/leonardo/lucid-origin",
    supportsRatio: true,
    supportsNegative: false,
  },
  {
    id: "phoenix",
    label: "Leonardo Phoenix",
    desc: "Kualitas tinggi, gaya artistik",
    cfModel: "@cf/leonardo/phoenix-1.0",
    supportsRatio: true,
    supportsNegative: true,
  },
  {
    id: "flux",
    label: "FLUX Schnell",
    desc: "Cepat & bagus (hanya rasio 1:1)",
    cfModel: "@cf/black-forest-labs/flux-1-schnell",
    supportsRatio: false,
    supportsNegative: false,
  },
  {
    id: "sdxl-lightning",
    label: "SDXL Lightning",
    desc: "Paling cepat, semua rasio",
    cfModel: "@cf/bytedance/stable-diffusion-xl-lightning",
    supportsRatio: true,
    supportsNegative: true,
  },
  {
    id: "sdxl",
    label: "SDXL Base",
    desc: "Detail tinggi, sedikit lebih lambat",
    cfModel: "@cf/stabilityai/stable-diffusion-xl-base-1.0",
    supportsRatio: true,
    supportsNegative: true,
  },
  {
    id: "dreamshaper",
    label: "DreamShaper 8",
    desc: "Gaya artistik & ilustrasi",
    cfModel: "@cf/lykon/dreamshaper-8-lcm",
    supportsRatio: true,
    supportsNegative: true,
  },
];
