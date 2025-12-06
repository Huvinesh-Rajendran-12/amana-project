import DashboardHeader from '@/components/client/DashboardHeader';
import { 
  Wallet, 
  CreditCard, 
  Shield, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Sparkles,
  ChevronRight,
  ShoppingBag,
  Car,
  Coffee,
  Utensils,
  Activity
} from 'lucide-react';

// Mock data
const recentTransactions = [
  { id: 1, merchant: 'Whole Foods Market', category: 'Groceries', amount: -127.43, status: 'approved', time: '2 hours ago', icon: ShoppingBag },
  { id: 2, merchant: 'Tesla Supercharger', category: 'Auto', amount: -34.20, status: 'approved', time: '5 hours ago', icon: Car },
  { id: 3, merchant: 'Louis Vuitton', category: 'Luxury', amount: -2400.00, status: 'blocked', time: '6 hours ago', icon: ShoppingBag },
  { id: 4, merchant: 'Starbucks', category: 'Dining', amount: -8.75, status: 'approved', time: '8 hours ago', icon: Coffee },
];

const spendingCategories = [
  { name: 'Housing', amount: 2400, budget: 2400, color: '#8b5cf6' },
  { name: 'Groceries', amount: 680, budget: 800, color: '#06b6d4' },
  { name: 'Dining', amount: 390, budget: 500, color: '#f59e0b' },
  { name: 'Transport', amount: 245, budget: 400, color: '#10b981' },
];

export default function DashboardPage() {
  return (
    <div className="text-[#efece4]">
      <DashboardHeader 
        title="Welcome back, Alexander" 
        subtitle="Here's your financial overview"
      />

      <div className="p-6 lg:p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Available Balance"
            value="$12,847.32"
            change="+2.4%"
            trend="up"
            icon={<Wallet className="w-5 h-5" />}
          />
          <StatCard
            title="Monthly Spending"
            value="$3,895.43"
            change="-12.3%"
            trend="down"
            icon={<CreditCard className="w-5 h-5" />}
          />
          <StatCard
            title="Blocked This Month"
            value="$4,240.00"
            subtitle="3 transactions"
            icon={<Shield className="w-5 h-5" />}
            highlight
          />
          <StatCard
            title="Vault Balance"
            value="$8,432.00"
            change="+5.2% APY"
            trend="up"
            icon={<TrendingUp className="w-5 h-5" />}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-light flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Recent Transactions
              </h2>
              <a href="/dashboard/transactions" className="text-xs text-[#efece4]/50 hover:text-[#efece4] transition-colors flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-[#efece4]/[0.02] border border-[#efece4]/5 rounded-xl overflow-hidden">
              {recentTransactions.map((tx, i) => (
                <div 
                  key={tx.id} 
                  className={`flex items-center justify-between p-4 ${i !== recentTransactions.length - 1 ? 'border-b border-[#efece4]/5' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#efece4]/5 flex items-center justify-center">
                      <tx.icon className="w-4 h-4 text-[#efece4]/60" />
                    </div>
                    <div>
                      <p className="font-light text-[#efece4]">{tx.merchant}</p>
                      <p className="text-xs text-[#efece4]/40">{tx.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono ${tx.status === 'blocked' ? 'text-[#efece4]/30 line-through' : 'text-[#efece4]'}`}>
                      ${Math.abs(tx.amount).toFixed(2)}
                    </p>
                    <p className={`text-xs ${
                      tx.status === 'approved' ? 'text-emerald-400' : 
                      tx.status === 'blocked' ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {tx.status === 'approved' ? 'Approved' : tx.status === 'blocked' ? 'Blocked' : 'Pending'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spending Breakdown */}
          <div className="space-y-4">
            <h2 className="text-lg font-light flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              Spending Breakdown
            </h2>

            <div className="bg-[#efece4]/[0.02] border border-[#efece4]/5 rounded-xl p-6 space-y-6">
              {spendingCategories.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#efece4]/60">{category.name}</span>
                    <span className="font-mono text-[#efece4]">
                      ${category.amount.toLocaleString()} 
                      <span className="text-[#efece4]/30"> / ${category.budget.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#efece4]/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min((category.amount / category.budget) * 100, 100)}%`,
                        backgroundColor: category.color,
                        opacity: category.amount > category.budget ? 1 : 0.7
                      }}
                    />
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-[#efece4]/5">
                <div className="flex items-center justify-between">
                  <span className="text-[#efece4]/60 text-sm">Total Spent</span>
                  <span className="text-lg font-light font-mono text-[#efece4]">
                    $3,715 <span className="text-[#efece4]/30 text-sm">/ $4,100</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Guardian Status */}
        <div className="bg-gradient-to-r from-violet-900/20 to-cyan-900/20 border border-[#efece4]/5 rounded-xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h3 className="font-light text-lg text-[#efece4]">AI Guardian Status</h3>
                <p className="text-sm text-[#efece4]/50">Actively monitoring all transactions</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-light text-violet-400">98.7%</div>
                <div className="text-xs text-[#efece4]/40">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-light text-cyan-400">147ms</div>
                <div className="text-xs text-[#efece4]/40">Avg Response</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-light text-emerald-400">24/7</div>
                <div className="text-xs text-[#efece4]/40">Protection</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  change, 
  subtitle, 
  trend, 
  icon, 
  highlight 
}: { 
  title: string;
  value: string;
  change?: string;
  subtitle?: string;
  trend?: 'up' | 'down';
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className={`p-6 rounded-xl border transition-all duration-300 hover:border-[#efece4]/10 ${
      highlight 
        ? 'bg-gradient-to-br from-violet-900/20 to-transparent border-violet-500/20' 
        : 'bg-[#efece4]/[0.02] border-[#efece4]/5'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg ${highlight ? 'bg-violet-500/10 text-violet-400' : 'bg-[#efece4]/5 text-[#efece4]/60'}`}>
          {icon}
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs ${
            trend === 'up' ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </div>
        )}
      </div>
      <div className="text-2xl font-light mb-1 font-mono text-[#efece4]">{value}</div>
      <div className="text-xs text-[#efece4]/40">{subtitle || title}</div>
    </div>
  );
}
