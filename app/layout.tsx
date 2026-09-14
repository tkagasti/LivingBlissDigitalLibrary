import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "श्रीमद्भगवद्गीता · Shreemad Bhagavad Geeta",
    template: "%s | Living Bliss Digital Library",
  },
  description:
    "A structured, verse-by-verse study of Shreemad Bhagavad Geeta across all 18 chapters, with the Sanskrit text in Devanagari.",
  metadataBase: new URL("https://library.livingbliss.org"),
  openGraph: {
    title: "श्रीमद्भगवद्गीता · Shreemad Bhagavad Geeta",
    description: "Study all 18 chapters in sequence, one Sanskrit shloka at a time.",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "श्रीमद्भगवद्गीता · Shreemad Bhagavad Geeta",
    description: "Study all 18 chapters in sequence, one Sanskrit shloka at a time.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer className="global-copyright" aria-label="Copyright">
          <span>© {new Date().getFullYear()} Living Bliss. All rights reserved.</span>
        </footer>
      </body>
    </html>
  );
}
