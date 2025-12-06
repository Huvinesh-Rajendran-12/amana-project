'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Brain, 
  Home,
  CreditCard,
  PieChart,
  Target,
  Wallet,
  Sparkles,
  Settings,
  LogOut
} from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Overview', href: '/dashboard' },
  { icon: CreditCard, label: 'Transactions', href: '/dashboard/transactions' },
  { icon: PieChart, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: Target, label: 'Goals', href: '/dashboard/goals' },
  { icon: Wallet, label: 'Vaults', href: '/dashboard/vaults' },
  { icon: Sparkles, label: 'AI Insights', href: '/dashboard/insights' },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-black/40 backdrop-blur-xl border-r border-[#efece4]/5 z-50 hidden lg:flex flex-col">
      <div className="p-6 flex-1">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-12">
          <div className="w-8 h-8 rounded-full border border-[#efece4]/20 flex items-center justify-center">
            <Brain className="w-4 h-4 text-[#efece4]" />
          </div>
          <span className="text-lg font-light tracking-[0.2em] text-[#efece4]">SENTIENCE</span>
        </Link>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-light tracking-wide transition-all duration-300 ${
                  isActive
                    ? 'bg-[#efece4]/10 text-[#efece4]'
                    : 'text-[#efece4]/50 hover:text-[#efece4] hover:bg-[#efece4]/5'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="p-6 border-t border-[#efece4]/5 space-y-1">
        <Link 
          href="/dashboard/settings"
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-light text-[#efece4]/50 hover:text-[#efece4] transition-colors rounded-lg hover:bg-[#efece4]/5"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <Link 
          href="/"
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-light text-[#efece4]/50 hover:text-[#efece4] transition-colors rounded-lg hover:bg-[#efece4]/5"
        >
          <LogOut className="w-4 h-4" />
          Exit Dashboard
        </Link>
      </div>
    </aside>
  );
}

