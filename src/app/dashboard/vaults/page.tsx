import DashboardHeader from '@/components/client/DashboardHeader';
import { 
  Wallet, 
  Plus,
  TrendingUp,
  Lock,
  Unlock,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Shield,
  Sparkles,
  ChevronRight
} from 'lucide-react';

// Mock vaults data
const vaults = [
  { 
    id: 1,
    name: 'High-Yield Savings', 
    balance: 8432.50, 
    apy: 5.2,
    type: 'flexible',
    lastDeposit: 500,
    monthlyEarnings: 36.54,
    color: '#8b5cf6'
  },
  { 
    id: 2,
    name: 'Emergency Reserve', 
    balance: 15000.00, 
    apy: 4.8,
    type: 'locked',
    lockPeriod: '6 months',
    monthlyEarnings: 60.00,
    color: '#06b6d4'
  },
  { 
    id: 3,
    name: 'Vacation Fund', 
    balance: 2150.75, 
    apy: 5.0,
    type: 'flexible',
    lastDeposit: 300,
    monthlyEarnings: 8.96,
    color: '#10b981'
  },
  { 
    id: 4,
    name: 'Investment Ready', 
    balance: 5280.00, 
    apy: 5.5,
    type: 'locked',
    lockPeriod: '12 months',
    monthlyEarnings: 24.20,
    color: '#f59e0b'
  },
];

const recentActivity = [
  { type: 'deposit', vault: 'High-Yield Savings', amount: 500, date: 'Dec 1, 2025' },
  { type: 'interest', vault: 'Emergency Reserve', amount: 60, date: 'Dec 1, 2025' },
  { type: 'deposit', vault: 'Vacation Fund', amount: 300, date: 'Dec 1, 2025' },
  { type: 'interest', vault: 'High-Yield Savings', amount: 36.54, date: 'Nov 30, 2025' },
  { type: 'withdrawal', vault: 'High-Yield Savings', amount: 200, date: 'Nov 28, 2025' },
];

export default function VaultsPage() {
  const totalBalance = vaults.reduce((acc, v) => acc + v.balance, 0);
  const totalMonthlyEarnings = vaults.reduce((acc, v) => acc + v.monthlyEarnings, 0);
  const avgApy = vaults.reduce((acc, v) => acc + v.apy, 0) / vaults.length;

  return (
    <div className="text-[#efece4]">
      <DashboardHeader 
        title="Yield Vaults" 
        subtitle="Grow your savings with high-yield accounts"
      />

      <div className="p-6 lg:p-8 space-y-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 bg-gradient-to-br from-violet-900/20 to-transparent border border-violet-500/20 rounded-xl">
            <p className="text-xs text-violet-400/70 mb-2">Total Balance</p>
            <p className="text-3xl font-light font-mono text-violet-400">${totalBalance.toLocaleString()}</p>
          </div>
          <div className="p-6 bg-[#efece4]/[0.02] border border-[#efece4]/5 rounded-xl">
            <p className="text-xs text-[#efece4]/40 mb-2">Active Vaults</p>
            <p className="text-3xl font-light font-mono">{vaults.length}</p>
          </div>
          <div className="p-6 bg-[#efece4]/[0.02] border border-[#efece4]/5 rounded-xl">
            <p className="text-xs text-[#efece4]/40 mb-2">Avg APY</p>
            <p className="text-3xl font-light font-mono">{avgApy.toFixed(1)}%</p>
          </div>
          <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
            <p className="text-xs text-emerald-400/70 mb-2">Monthly Earnings</p>
            <p className="text-3xl font-light font-mono text-emerald-400">+${totalMonthlyEarnings.toFixed(2)}</p>
          </div>
        </div>

        {/* Create Vault Button */}
        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-6 py-3 bg-violet-500/10 border border-violet-500/20 rounded-lg text-violet-400 hover:bg-violet-500/15 transition-colors">
            <Plus className="w-4 h-4" />
            Create New Vault
          </button>
        </div>

        {/* Vaults Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vaults.map((vault) => (
            <div 
              key={vault.id}
              className="p-6 bg-[#efece4]/[0.02] border border-[#efece4]/5 rounded-xl hover:border-[#efece4]/10 transition-colors group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${vault.color}20` }}
                  >
                    <Wallet className="w-5 h-5" style={{ color: vault.color }} />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#efece4]">{vault.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {vault.type === 'locked' ? (
                        <span className="flex items-center gap-1 text-xs text-amber-400">
                          <Lock className="w-3 h-3" />
                          Locked ({vault.lockPeriod})
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                          <Unlock className="w-3 h-3" />
                          Flexible
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-emerald-500/5 text-emerald-400 rounded text-xs font-mono">
                    {vault.apy}% APY
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-[#efece4]/40 mb-1">Balance</p>
                  <p className="text-2xl font-light font-mono text-[#efece4]">
                    ${vault.balance.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#efece4]/5">
                  <div>
                    <p className="text-xs text-[#efece4]/40">Monthly Earnings</p>
                    <p className="text-sm font-mono text-emerald-400">+${vault.monthlyEarnings.toFixed(2)}</p>
                  </div>
                  <button className="flex items-center gap-1 text-xs text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Manage <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-[#efece4]/[0.02] border border-[#efece4]/5 rounded-xl p-6">
          <h3 className="font-light text-lg mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#efece4]/60" />
            Recent Activity
          </h3>
          
          <div className="space-y-3">
            {recentActivity.map((activity, i) => (
              <div 
                key={i}
                className="flex items-center justify-between p-4 bg-[#efece4]/[0.02] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'deposit' ? 'bg-emerald-500/5' :
                    activity.type === 'interest' ? 'bg-violet-500/5' :
                    'bg-red-500/5'
                  }`}>
                    {activity.type === 'deposit' ? (
                      <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                    ) : activity.type === 'interest' ? (
                      <TrendingUp className="w-4 h-4 text-violet-400" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-[#efece4]">
                      {activity.type === 'deposit' ? 'Deposit to' :
                       activity.type === 'interest' ? 'Interest earned in' :
                       'Withdrawal from'} {activity.vault}
                    </p>
                    <p className="text-xs text-[#efece4]/40">{activity.date}</p>
                  </div>
                </div>
                <span className={`font-mono text-sm ${
                  activity.type === 'withdrawal' ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {activity.type === 'withdrawal' ? '-' : '+'}${activity.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Note */}
        <div className="bg-[#efece4]/[0.02] border border-[#efece4]/5 rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h4 className="font-medium text-[#efece4] mb-1">Your funds are protected</h4>
            <p className="text-sm text-[#efece4]/50">
              All vault deposits are FDIC insured up to $250,000 through our banking partner, Evolve Bank & Trust.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

