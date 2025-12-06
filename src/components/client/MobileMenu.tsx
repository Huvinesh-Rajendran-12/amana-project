'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <button 
        className="md:hidden text-[#efece4] p-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 top-24 z-40 bg-black/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col items-center justify-center h-full gap-8 text-lg font-light tracking-widest uppercase text-[#efece4]/50">
            <a 
              href="#features" 
              className="hover:text-[#efece4] transition-colors duration-300"
              onClick={() => setIsOpen(false)}
            >
              Features
            </a>
            <a 
              href="#comparison" 
              className="hover:text-[#efece4] transition-colors duration-300"
              onClick={() => setIsOpen(false)}
            >
              Compare
            </a>
            <a 
              href="/dashboard" 
              className="hover:text-[#efece4] transition-colors duration-300"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </a>
            <div className="flex flex-col gap-4 mt-8">
              <button className="text-sm tracking-widest text-[#efece4]/50 hover:text-[#efece4] transition-colors uppercase">
                Member Login
              </button>
              <button className="px-8 py-3 bg-[#efece4] text-[#030303] text-sm font-medium tracking-widest uppercase hover:bg-[#f5f3ed] transition-colors duration-300">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
