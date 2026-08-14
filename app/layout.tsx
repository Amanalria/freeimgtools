import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "FreeImgTools — 106 Free Image & PDF Tools | 100% In-Browser",
  description: "106 free online image & PDF tools. Compress to target KB/MB, convert, resize, merge, split, sign — 100% client-side. Zero uploads.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var theme = localStorage.getItem('theme') || 'dark';
            document.documentElement.className = theme;
          } catch(e) {}
        `}} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Great+Vibes&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Pacifico&display=swap" rel="stylesheet" />
        <Script src="https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js" strategy="beforeInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js" strategy="beforeInteractive" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
