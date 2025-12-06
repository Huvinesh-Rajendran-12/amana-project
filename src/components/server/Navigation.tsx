import { Brain } from 'lucide-react';
import MobileMenu from '@/components/client/MobileMenu';

interface NavigationProps {
  scrolled?: boolean;
}

export default function Navigation({ scrolled = false }: NavigationProps) {
  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-black/60 backdrop-blur-xl border-b border-[#efece4]/5' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="w-8 h-8 rounded-full border border-[#efece4]/20 flex items-center justify-center group-hover:border-violet-500 transition-colors duration-500">
            <Brain className="w-4 h-4 text-[#efece4] group-hover:text-violet-400 transition-colors" />
          </div>
          <span className="text-xl font-light tracking-[0.2em] text-[#efece4]">SENTIENCE</span>
        </a>

        {/* Desktop Navigation */}
        {/* <div className="hidden md:flex items-center gap-12 text-xs font-light tracking-widest uppercase text-[#efece4]/50">
          <a href="/dashboard" className="hover:text-[#efece4] transition-colors duration-300">
            Dashboard
          </a>
        </div> */}

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-6">
          <button className="text-xs font-light tracking-widest text-[#efece4]/50 hover:text-[#efece4] transition-colors uppercase">
            Member Login
          </button>
          <button className="px-6 py-2 bg-[#efece4] text-[#030303] text-xs font-medium tracking-widest uppercase hover:bg-[#f5f3ed] transition-colors duration-300">
            Apply
          </button>
        </div>

        {/* Mobile Menu */}
        <MobileMenu />
      </div>
    </nav>
  );
}
