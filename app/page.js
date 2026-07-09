"use client";

import { useState, useRef, useEffect } from "react";
import { STYLES, RATIOS, MODELS } from "../lib/options";

const COUNTS = [1, 2, 3, 4];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("auto");
  const [ratio, setRatio] = useState("1:1");
  const [model, setModel] = useState("lucid");
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]); // { id, src, prompt, style, ratio, model }
  const [lightbox, setLightbox] = useState(null);
  const galleryRef = useRef(null);

  const selectedModel = MODELS.find((m) => m.id === model);
  const selectedRatio = RATIOS.find((r) => r.id === ratio);
  const effectiveRatio = selectedModel?.supportsRatio ? selectedRatio : RATIOS[0];

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setLightbox(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function handleGenerate() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style, ratio, model, count }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghasilkan gambar.");

      const styleLabel = STYLES.find((s) => s.id === style)?.label || "Auto";
      const items = data.images.map((src, i) => ({
        id: `${Date.now()}-${i}`,
        src,
        prompt,
        style: styleLabel,
        ratio: data.meta.ratio,
        model: data.meta.model,
      }));
      setHistory((prev) => [...items, ...prev]);
      setTimeout(
        () => galleryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        100
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function downloadImage(src, id) {
    // Hasil engine desain berupa SVG -> rasterisasi ke PNG dulu di browser.
    if (src.startsWith("data:image/svg+xml")) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || 1024;
        canvas.height = img.naturalHeight || 1024;
        canvas.getContext("2d").drawImage(img, 0, 0);
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = `image-zaidly-${id}.png`;
        a.click();
      };
      img.src = src;
      return;
    }
    const ext = src.startsWith("data:image/jpeg") ? "jpg" : "png";
    const a = document.createElement("a");
    a.href = src;
    a.download = `image-zaidly-${id}.${ext}`;
    a.click();
  }

  const ratioParts = (r) => {
    const [w, h] = r.split(":").map(Number);
    return `${w} / ${h}`;
  };

  return (
    <main className="container">
      {/* ===== Header ===== */}
      <header className="header">
        <div className="brand">
          <span className="brand-mark">◆</span> image<span className="brand-thin">.zaidly</span>
        </div>
        <a
          className="header-note"
          href="https://zaidly.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          zaidly.com
        </a>
      </header>

      {/* ===== Hero ===== */}
      <section className="hero">
        <h1 className="hero-title">Kreasi berikutnya dimulai di sini</h1>
        <p className="hero-sub">
          Tulis imajinasimu, pilih style dan rasio — biarkan AI yang menggambar.
        </p>
      </section>

      {/* ===== Prompt Card ===== */}
      <section className="prompt-card">
        <textarea
          className="prompt-input"
          placeholder="Contoh: kucing oren astronot melayang di luar angkasa memegang bendera Indonesia..."
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleGenerate();
          }}
        />

        {/* Style chips */}
        <div className="control-group">
          <div className="control-label">Style</div>
          <div className="chips">
            {STYLES.map((s) => (
              <button
                key={s.id}
                className={`chip ${style === s.id ? "chip-active" : ""}`}
                onClick={() => {
                  setStyle(s.id);
                  if (s.ratio) setRatio(s.ratio);
                  if (s.model) {
                    setModel(s.model);
                  } else if (
                    s.ratio &&
                    !MODELS.find((m) => m.id === model)?.supportsRatio
                  ) {
                    setModel("lucid");
                  }
                }}
                type="button"
              >
                <span className="chip-icon">{s.icon}</span> {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ratio */}
        <div className="control-group">
          <div className="control-label">
            Rasio{" "}
            {!selectedModel?.supportsRatio && (
              <span className="label-warn">— FLUX Schnell hanya mendukung 1:1</span>
            )}
          </div>
          <div className="chips">
            {RATIOS.map((r) => (
              <button
                key={r.id}
                type="button"
                title={r.hint}
                disabled={!selectedModel?.supportsRatio && r.id !== "1:1"}
                className={`chip ratio-chip ${effectiveRatio.id === r.id ? "chip-active" : ""}`}
                onClick={() => setRatio(r.id)}
              >
                <span
                  className="ratio-box"
                  style={{ aspectRatio: ratioParts(r.id) }}
                />
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Model + jumlah + tombol */}
        <div className="bottom-row">
          <div className="bottom-left">
            <select
              className="model-select"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              title={selectedModel?.desc}
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} — {m.desc}
                </option>
              ))}
            </select>

            <div className="count-group">
              {COUNTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`count-btn ${count === c ? "count-active" : ""}`}
                  onClick={() => setCount(c)}
                  title={`${c} gambar`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            type="button"
          >
            {loading ? (
              <>
                <span className="spinner" /> Menggambar...
              </>
            ) : (
              <>✦ Generate</>
            )}
          </button>
        </div>

        {error && <div className="error-box">⚠️ {error}</div>}
      </section>

      {/* ===== Gallery ===== */}
      <section className="gallery" ref={galleryRef}>
        {loading && (
          <div className="grid">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="card skeleton"
                style={{ aspectRatio: ratioParts(effectiveRatio.id) }}
              >
                <div className="skeleton-shimmer" />
              </div>
            ))}
          </div>
        )}

        {!loading && history.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🖼️</div>
            <p>Belum ada gambar. Tulis prompt di atas lalu tekan Generate.</p>
          </div>
        )}

        {history.length > 0 && (
          <>
            <h2 className="gallery-title">Hasil Kreasimu</h2>
            <div className="grid">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="card"
                  style={{ aspectRatio: ratioParts(item.ratio) }}
                  onClick={() => setLightbox(item)}
                >
                  <img src={item.src} alt={item.prompt} />
                  <div className="card-overlay">
                    <div className="card-meta">
                      <span className="badge">{item.style}</span>
                      <span className="badge">{item.ratio}</span>
                    </div>
                    <button
                      className="download-btn"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(item.src, item.id);
                      }}
                    >
                      ⬇ Unduh
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ===== Lightbox ===== */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.src} alt={lightbox.prompt} />
            <div className="lightbox-info">
              <p className="lightbox-prompt">{lightbox.prompt}</p>
              <div className="lightbox-actions">
                <span className="badge">{lightbox.model}</span>
                <span className="badge">{lightbox.style}</span>
                <span className="badge">{lightbox.ratio}</span>
                <button
                  className="download-btn solid"
                  type="button"
                  onClick={() => downloadImage(lightbox.src, lightbox.id)}
                >
                  ⬇ Unduh Gambar
                </button>
                <button
                  className="download-btn"
                  type="button"
                  onClick={() => setLightbox(null)}
                >
                  ✕ Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        © {new Date().getFullYear()}{" "}
        <a href="https://zaidly.com" target="_blank" rel="noreferrer">
          zaidly.com
        </a>
      </footer>
    </main>
  );
}
