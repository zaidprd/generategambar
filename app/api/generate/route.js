import { STYLES, RATIOS, MODELS } from "../../../lib/options";
import { classifyPrompt, designFromPrompt, parseDesignFields } from "../../../lib/router";
import { designToDataUrl } from "../../../lib/designSvg";

export const runtime = "nodejs";
export const maxDuration = 60;

async function callCloudflare({ accountId, token, cfModel, input }) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${cfModel}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = await res.json();
    if (!res.ok || data.success === false) {
      const msg =
        data?.errors?.map((e) => e.message).join("; ") ||
        `Cloudflare API error (HTTP ${res.status})`;
      throw new Error(msg);
    }
    const b64 = data?.result?.image;
    if (!b64) throw new Error("Respons Cloudflare tidak berisi gambar.");
    const mime = b64.startsWith("/9j/") ? "image/jpeg" : "image/png";
    return `data:${mime};base64,${b64}`;
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudflare API error (HTTP ${res.status}): ${text.slice(0, 200)}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const prompt = (body.prompt || "").trim();
    if (!prompt) {
      return Response.json({ error: "Prompt tidak boleh kosong." }, { status: 400 });
    }

    const style = STYLES.find((s) => s.id === body.style) || STYLES[0];
    const ratio = RATIOS.find((r) => r.id === body.ratio) || RATIOS[0];
    const model = MODELS.find((m) => m.id === body.model) || MODELS[0];
    const count = Math.min(Math.max(parseInt(body.count, 10) || 1, 1), 4);

    // === OTAK ROUTER: kapan pakai ENGINE DESAIN SVG (teks tajam, GRATIS) ===
    // - style "Auto": sistem yang menilai (design vs foto).
    // - style desain (Poster/Carousel IG/Cover TikTok): selalu engine desain,
    //   dengan rasio preset.
    const DESIGN_STYLE_RATIO = {
      "carousel-ig": "4:5",
      "cover-tiktok": "9:16",
      poster: null, // pakai rasio pilihan user
    };

    let design = null;
    let designRatioId = ratio.id;
    if (style.id === "auto") {
      const decision = classifyPrompt(prompt);
      if (decision.type === "design") design = decision;
    } else if (Object.prototype.hasOwnProperty.call(DESIGN_STYLE_RATIO, style.id)) {
      design = designFromPrompt(prompt);
      if (DESIGN_STYLE_RATIO[style.id]) designRatioId = DESIGN_STYLE_RATIO[style.id];
    }

    if (design) {
      // Field opsional (sub/isi/kicker/badges/note/halaman) + pilihan template.
      const fields = parseDesignFields(prompt);
      const zineStyle = style.id === "carousel-ig" || style.id === "cover-tiktok";
      const zineWord = /\b(zine|retro|terracotta|terakota|jadul)\b/i.test(prompt);
      const template = zineStyle || zineWord ? "zine" : "gradient";

      const images = Array.from({ length: count }, (_, i) =>
        designToDataUrl({
          ...fields,
          template,
          ratioId: designRatioId,
          seed: (Date.now() % 100000) + i * 131,
        })
      );
      return Response.json({
        images,
        meta: {
          prompt: fields.headline,
          model: template === "zine" ? "Engine Desain — Zine Terracotta" : "Engine Desain (teks tajam)",
          ratio: designRatioId,
          engine: "design",
        },
      });
    }

    // Jalur FOTO (diffusion) — baru di sini key Cloudflare wajib.
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const token = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !token) {
      return Response.json(
        {
          error:
            "Konfigurasi Cloudflare belum diisi. Tambahkan CLOUDFLARE_ACCOUNT_ID dan CLOUDFLARE_API_TOKEN di file .env.local (lokal) atau di Environment Variables Vercel.",
        },
        { status: 500 }
      );
    }

    const finalPrompt = `${style.prefix}${prompt}${style.suffix}`;

    const input = { prompt: finalPrompt };
    if (model.supportsRatio) {
      input.width = ratio.width;
      input.height = ratio.height;
      if (model.supportsNegative) {
        const baseNegative =
          "blurry, low quality, distorted, deformed, watermark, text artifacts, ugly";
        input.negative_prompt = style.negative
          ? `${style.negative}, ${baseNegative}`
          : baseNegative;
      }
    } else {
      // FLUX Schnell: hanya prompt + steps (output 1:1)
      input.steps = 6;
    }

    const jobs = Array.from({ length: count }, () => {
      const jobInput = { ...input };
      jobInput.seed = Math.floor(Math.random() * 2147483647);
      return callCloudflare({ accountId, token, cfModel: model.cfModel, input: jobInput });
    });

    const results = await Promise.allSettled(jobs);
    const images = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);

    if (images.length === 0) {
      const firstError =
        results.find((r) => r.status === "rejected")?.reason?.message ||
        "Gagal menghasilkan gambar.";
      return Response.json({ error: firstError }, { status: 502 });
    }

    return Response.json({
      images,
      meta: {
        prompt: finalPrompt,
        model: model.label,
        ratio: model.supportsRatio ? ratio.id : "1:1",
      },
    });
  } catch (err) {
    return Response.json(
      { error: err.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
