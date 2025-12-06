import { Moon } from "lucide-react";
import Link from "next/link";
import MobileMenu from "@/components/client/MobileMenu";

interface NavigationProps {
  scrolled?: boolean;
}

export default function Navigation({ scrolled = false }: NavigationProps) {
  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/60 backdrop-blur-xl border-b border-cream/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="w-8 h-8 rounded-full border border-cream/20 flex items-center justify-center group-hover:border-violet-500 transition-colors duration-500">
            <Moon className="w-4 h-4 text-cream group-hover:text-violet-400 transition-colors" />
          </div>
          <span className="text-xl font-light tracking-[0.2em] text-cream">
            LUMINA
          </span>
        </Link>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-6">
          <button className="text-xs font-light tracking-widest text-cream/50 hover:text-cream transition-colors uppercase">
            Member Login
          </button>
          <button className="px-6 py-2 bg-cream text-sentience-dark text-xs font-medium tracking-widest uppercase hover:bg-white transition-colors duration-300">
            Open Account
          </button>
        </div>

        {/* Mobile Menu */}
        <MobileMenu />
      </div>
    </nav>
  );
}
