import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FinanceModeProvider } from "@/context/FinanceModeContext";
import { ConvexClientProvider } from "@/providers/ConvexClientProvider";
import { UserProvider } from "@/context/UserContext";

export const metadata: Metadata = {
  title: "Amana | Intelligent Banking",
  description:
    "Malaysia's first dual-mode digital bank. Seamlessly switch between Conventional and Islamic finance with AI-powered insights.",
  keywords: [
    "AI",
    "Islamic Banking",
    "Conventional Banking",
    "Fintech",
    "Malaysia",
    "Amana",
  ],
  authors: [{ name: "Amana Financial Technologies" }],
  openGraph: {
    title: "Amana | Dual-Mode Financial Intelligence",
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
        <ConvexClientProvider>
          <UserProvider>
            <FinanceModeProvider>{children}</FinanceModeProvider>
          </UserProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
