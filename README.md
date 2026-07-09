# ◆ image.zaidly — Website Generate Gambar AI

Aplikasi generate gambar AI dari [zaidly.com](https://zaidly.com). Dibangun dengan **Next.js** + **Cloudflare Workers AI**, siap deploy ke **Vercel**.

## Fitur

- 🎨 **10 kategori style**: Auto, Realistis, Muslim Faceless (tanpa mata/mulut, kepala terpisah — sesuai kaidah sunnah), Carousel IG (otomatis 4:5), Cover TikTok (otomatis 9:16), Sinematik, Cat Air, Logo, Poster, Minimalis
- 📐 **7 pilihan rasio**: 1:1, 4:5, 3:4, 9:16, 4:3, 3:2, 16:9
- 🤖 **6 model AI**: Leonardo Lucid Origin, Leonardo Phoenix, FLUX Schnell, SDXL Lightning, SDXL Base, DreamShaper 8
- 🖼️ Generate 1–4 gambar sekaligus, galeri hasil, lightbox, dan tombol unduh PNG

## 1. Ambil Kredensial Cloudflare

1. Daftar/masuk ke [dash.cloudflare.com](https://dash.cloudflare.com) (Workers AI punya kuota gratis harian).
2. **Account ID**: buka menu **Workers & Pages** — Account ID ada di sidebar kanan.
3. **API Token**: buka [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) → **Create Token** → pilih template **Workers AI** (atau custom dengan permission `Workers AI : Read`) → **Create Token** → salin token-nya.

## 2. Jalankan Lokal

```bash
npm install
```

Isi file `.env.local`:

```
CLOUDFLARE_ACCOUNT_ID=account_id_kamu
CLOUDFLARE_API_TOKEN=api_token_kamu
```

Lalu:

```bash
npm run dev
```

Buka http://localhost:3000

> **⚠️ Error "fetch failed" saat generate (khusus lokal Windows)?**
> Jaringan/antivirus kamu memakai sertifikat TLS sendiri, sehingga Node.js gagal konek ke Cloudflare. Jalankan dengan:
>
> ```bash
> npm run dev:win
> ```
>
> (script ini menyetel `NODE_OPTIONS=--use-system-ca` agar Node memakai sertifikat sistem Windows). Di Vercel hal ini **tidak diperlukan**.

## 3. Deploy ke Vercel

### Cara A — via GitHub (disarankan)

1. Push folder ini ke repository GitHub.
2. Buka [vercel.com/new](https://vercel.com/new) → import repository → framework otomatis terdeteksi (Next.js).
3. Di bagian **Environment Variables**, tambahkan:
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_API_TOKEN`
4. Klik **Deploy**. Selesai! 🎉

### Cara B — via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

Lalu tambahkan environment variables:

```bash
vercel env add CLOUDFLARE_ACCOUNT_ID production
vercel env add CLOUDFLARE_API_TOKEN production
vercel --prod
```

## Catatan Model

| Model | Rasio | Karakter |
|---|---|---|
| Leonardo Lucid Origin | semua rasio | Kualitas terbaik, teks rapi (default) |
| Leonardo Phoenix | semua rasio | Kualitas tinggi, terbaik untuk cover/poster |
| FLUX Schnell | hanya 1:1 | Cepat & bagus |
| SDXL Lightning | semua rasio | Paling cepat |
| SDXL Base | semua rasio | Detail tinggi |
| DreamShaper 8 | semua rasio | Artistik/ilustrasi |

Kuota gratis Workers AI: ±10.000 neuron/hari (cukup untuk puluhan gambar per hari).
