import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sentience | AI-Powered Financial Intelligence",
  description:
    "A credit card with a conscience. Using real-time LLMs to audit every swipe, block impulse buys, and enforce the discipline you promised yourself.",
  keywords: [
    "AI",
    "credit card",
    "financial",
    "budgeting",
    "fintech",
    "intelligent spending",
  ],
  authors: [{ name: "Sentience Financial Technologies" }],
  openGraph: {
    title: "Sentience | AI-Powered Financial Intelligence",
    description: "A credit card with a conscience.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#030303",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen mt-4 bg-[#030303] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
