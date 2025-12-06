'use client';

import { Bell, Menu } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { Brain, Home, CreditCard, PieChart, Target, Wallet, Sparkles, X } from 'lucide-react';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

const navItems = [
  { icon: Home, label: 'Overview', href: '/dashboard' },
  { icon: CreditCard, label: 'Transactions', href: '/dashboard/transactions' },
  { icon: PieChart, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: Target, label: 'Goals', href: '/dashboard/goals' },
  { icon: Wallet, label: 'Vaults', href: '/dashboard/vaults' },
  { icon: Sparkles, label: 'AI Insights', href: '/dashboard/insights' },
];

export default function DashboardHeader({ title = 'Dashboard', subtitle }: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#030303]/80 backdrop-blur-xl border-b border-[#efece4]/5">
        <div className="flex items-center justify-between px-6 lg:px-8 h-16">
          {/* Mobile Menu Button & Logo */}
          <div className="flex items-center gap-4 lg:hidden">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-[#efece4]/60 hover:text-[#efece4] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#efece4]" />
              <span className="text-lg font-light tracking-widest text-[#efece4]">SENTIENCE</span>
            </Link>
          </div>

          {/* Title (Desktop) */}
          <div className="hidden lg:block">
            <h1 className="text-lg font-light text-[#efece4]">{title}</h1>
            {subtitle && <p className="text-xs text-[#efece4]/50">{subtitle}</p>}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-[#efece4]/60 hover:text-[#efece4] transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-violet-500/60 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-medium text-white">
              AV
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-[#030303] border-r border-[#efece4]/5 p-6">
            <div className="flex items-center justify-between mb-8">
              <Link href="/" className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#efece4]" />
                <span className="text-lg font-light tracking-widest text-[#efece4]">SENTIENCE</span>
              </Link>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[#efece4]/60 hover:text-[#efece4]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-light text-[#efece4]/60 hover:text-[#efece4] hover:bg-[#efece4]/5 transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

