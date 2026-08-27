import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Living Bliss Digital Library",
    template: "%s | Living Bliss Digital Library",
  },
  description:
    "Authentic scriptures, guided chapter-by-chapter learning, personal progress, assessments and verified achievements.",
  metadataBase: new URL("https://living-bliss-library.sites.openai.com"),
  openGraph: {
    title: "Living Bliss Digital Library",
    description: "Authentic scripture • Guided learning • Progress & certificates",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Living Bliss Digital Library",
    description: "Authentic scripture • Guided learning • Progress & certificates",
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
      <body>{children}</body>
    </html>
  );
}
