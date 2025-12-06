import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FinanceModeProvider } from "@/context/FinanceModeContext";

export const metadata: Metadata = {
  title: "Lumina | Intelligent Banking",
  description:
    "Malaysia's first dual-mode digital bank. Seamlessly switch between Conventional and Islamic finance with AI-powered insights.",
  keywords: [
    "AI",
    "Islamic Banking",
    "Conventional Banking",
    "Fintech",
    "Malaysia",
    "Lumina",
  ],
  authors: [{ name: "Lumina Financial Technologies" }],
  openGraph: {
    title: "Lumina | Dual-Mode Financial Intelligence",
    description: "Malaysia's first dual-mode digital bank.",
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
      <body className="mt-12 min-h-screen bg-black text-white antialiased selection:bg-violet-500/30">
        <FinanceModeProvider>{children}</FinanceModeProvider>
      </body>
    </html>
  );
}
