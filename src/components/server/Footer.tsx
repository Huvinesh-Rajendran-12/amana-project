import { Brain } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-20 border-t border-[#efece4]/5 bg-black">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-12">
        {/* Brand */}
        <div className="space-y-6">
          <a href="/" className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full border border-[#efece4]/20 flex items-center justify-center">
              <Brain className="w-3 h-3 text-[#efece4]" />
            </div>
            <span className="text-lg font-light tracking-[0.2em] text-[#efece4]">SENTIENCE</span>
          </a>
          <p className="text-xs text-[#efece4]/30 font-light max-w-xs leading-relaxed">
            The intelligence layer for your capital. <br />
            Constructed for the disciplined.
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-16 text-xs font-light tracking-widest uppercase text-[#efece4]/40">
          <div className="flex flex-col gap-4">
            <span className="text-[#efece4] font-medium">Platform</span>
            <a href="#" className="hover:text-[#efece4] transition-colors">Intelligence</a>
            <a href="#" className="hover:text-[#efece4] transition-colors">Vaults</a>
            <a href="#" className="hover:text-[#efece4] transition-colors">Card</a>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-[#efece4] font-medium">Company</span>
            <a href="#" className="hover:text-[#efece4] transition-colors">Manifesto</a>
            <a href="#" className="hover:text-[#efece4] transition-colors">Careers</a>
            <a href="#" className="hover:text-[#efece4] transition-colors">Legal</a>
          </div>
        </div>
      </div>

      {/* Legal Footer */}
      <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-[#efece4]/5">
        <div className="text-[10px] text-[#efece4]/20 font-mono text-center">
          © 2026 SENTIENCE FINANCIAL TECHNOLOGIES. BANKING SERVICES PROVIDED BY EVOLVE BANK & TRUST, MEMBER FDIC.
        </div>
      </div>
    </footer>
  );
}
