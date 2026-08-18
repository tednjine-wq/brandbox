import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrandBox — Branded Merchandise, Kenya",
  description:
    "Promotional products with transparent bulk pricing. M-Pesa checkout and WhatsApp enquiries.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-paper font-body text-ink antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}