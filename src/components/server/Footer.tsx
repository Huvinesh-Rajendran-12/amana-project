import { Moon } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-20 border-t border-cream/5 bg-black">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-12">
        {/* Brand */}
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full border border-cream/20 flex items-center justify-center">
              <Moon className="w-3 h-3 text-cream" />
            </div>
            <span className="text-lg font-light tracking-[0.2em] text-cream">
              AMANA
            </span>
          </Link>
          <p className="text-xs text-cream/30 font-light max-w-xs leading-relaxed">
            AI-powered banking for everyone. <br />
            Conventional or Islamic — your choice.
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-16 text-xs font-light tracking-widest uppercase text-cream/40">
          <div className="flex flex-col gap-4">
            <span className="text-cream font-medium">Services</span>
            <a href="#" className="hover:text-cream transition-colors">
              Savings
            </a>
            <a href="#" className="hover:text-cream transition-colors">
              Investments
            </a>
            <a href="#" className="hover:text-cream transition-colors">
              Insurance & Takaful
            </a>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-cream font-medium">Company</span>
            <a href="#" className="hover:text-cream transition-colors">
              About Us
            </a>
            <a href="#" className="hover:text-cream transition-colors">
              Shariah Board
            </a>
            <a href="#" className="hover:text-cream transition-colors">
              Careers
            </a>
          </div>
        </div>
      </div>

      {/* Legal Footer */}
      <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-cream/5">
        <div className="text-[10px] text-cream/20 font-mono text-center">
          © 2026 AMANA DIGITAL BANK. LICENSED BY BANK NEGARA MALAYSIA. DEPOSITS
          PROTECTED BY PIDM.
        </div>
      </div>
    </footer>
  );
}
