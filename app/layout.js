import "./globals.css";

export const metadata = {
  title: "image.zaidly — Generate Gambar AI",
  description:
    "Buat gambar AI dari teks dengan berbagai style dan rasio. Salah satu aplikasi dari zaidly.com.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
