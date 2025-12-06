import DashboardHeader from '@/components/client/DashboardHeader';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// Mock spending data by category
const spendingByCategory = [
  { name: 'Housing', amount: 2400, percentage: 45, color: '#8b5cf6' },
  { name: 'Groceries', amount: 680, percentage: 13, color: '#06b6d4' },
  { name: 'Dining', amount: 520, percentage: 10, color: '#f59e0b' },
  { name: 'Transport', amount: 380, percentage: 7, color: '#10b981' },
  { name: 'Entertainment', amount: 290, percentage: 5, color: '#ec4899' },
  { name: 'Shopping', amount: 450, percentage: 8, color: '#f43f5e' },
  { name: 'Utilities', amount: 320, percentage: 6, color: '#6366f1' },
  { name: 'Other', amount: 310, percentage: 6, color: '#64748b' },
];

// Mock monthly trends
const monthlyTrends = [
  { month: 'Jul', spending: 4200, savings: 1200 },
  { month: 'Aug', spending: 4800, savings: 800 },
  { month: 'Sep', spending: 3900, savings: 1500 },
  { month: 'Oct', spending: 4100, savings: 1300 },
  { month: 'Nov', spending: 5200, savings: 600 },
  { month: 'Dec', spending: 3500, savings: 1800 },
];

const insights = [
  { 
    title: 'Spending Down 15%', 
    description: 'Your spending this month is 15% lower than last month. Great progress!',
    trend: 'positive'
  },
  { 
    title: 'Dining Budget Alert', 
    description: 'You\'ve used 78% of your dining budget with 12 days remaining.',
    trend: 'warning'
  },
  { 
    title: 'Savings Goal On Track', 
    description: 'You\'re on track to save $2,400 this month, exceeding your goal by 20%.',
    trend: 'positive'
  },
];

export default function AnalyticsPage() {
  const maxSpending = Math.max(...monthlyTrends.map(m => m.spending));

  return (
    <div className="text-[#efece4]">
      <DashboardHeader 
        title="Analytics" 
        subtitle="Track your spending patterns and insights"
      />

      <div className="p-6 lg:p-8 space-y-8">
        {/* Time Period Selector */}
        <div className="flex items-center gap-4">
          <div className="flex bg-[#efece4]/5 rounded-lg p-1">
            <button className="px-4 py-2 text-sm bg-violet-500/10 text-violet-400 rounded-md">
              This Month
            </button>
            <button className="px-4 py-2 text-sm text-[#efece4]/50 hover:text-[#efece4] transition-colors">
              Last 3 Months
            </button>
            <button className="px-4 py-2 text-sm text-[#efece4]/50 hover:text-[#efece4] transition-colors">
              This Year
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#efece4]/5 rounded-lg text-sm text-[#efece4]/60 hover:text-[#efece4] transition-colors">
            <Calendar className="w-4 h-4" />
            Custom Range
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-[#efece4]/[0.02] border border-[#efece4]/5 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#efece4]/50 text-sm">Total Spending</span>
              <div className="flex items-center gap-1 text-red-400 text-xs">
                <ArrowDownRight className="w-3 h-3" />
                -15%
              </div>
            </div>
            <p className="text-3xl font-light font-mono">$5,350</p>
            <p className="text-xs text-[#efece4]/40 mt-1">vs $6,294 last month</p>
          </div>
          <div className="p-6 bg-[#efece4]/[0.02] border border-[#efece4]/5 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#efece4]/50 text-sm">Total Saved</span>
              <div className="flex items-center gap-1 text-emerald-400 text-xs">
                <ArrowUpRight className="w-3 h-3" />
                +32%
              </div>
            </div>
            <p className="text-3xl font-light font-mono">$1,800</p>
            <p className="text-xs text-[#efece4]/40 mt-1">vs $1,360 last month</p>
          </div>
          <div className="p-6 bg-violet-500/5 border border-violet-500/10 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-violet-400/70 text-sm">Blocked Spending</span>
              <div className="flex items-center gap-1 text-violet-400 text-xs">
                <TrendingUp className="w-3 h-3" />
                Protected
              </div>
            </div>
            <p className="text-3xl font-light font-mono text-violet-400">$4,240</p>
            <p className="text-xs text-violet-400/50 mt-1">3 transactions blocked</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending by Category */}
          <div className="bg-[#efece4]/[0.02] border border-[#efece4]/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="w-5 h-5 text-violet-400" />
              <h3 className="font-light text-lg">Spending by Category</h3>
            </div>
            
            <div className="space-y-4">
              {spendingByCategory.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-[#efece4]/70">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[#efece4]">${category.amount.toLocaleString()}</span>
                      <span className="text-[#efece4]/40 w-10 text-right">{category.percentage}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-[#efece4]/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${category.percentage}%`,
                        backgroundColor: category.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="bg-[#efece4]/[0.02] border border-[#efece4]/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <h3 className="font-light text-lg">Monthly Trends</h3>
            </div>
            
            <div className="flex items-end justify-between gap-2 h-48">
              {monthlyTrends.map((month) => (
                <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col gap-1">
                    <div 
                      className="w-full bg-violet-500/40 rounded-t"
                      style={{ height: `${(month.spending / maxSpending) * 150}px` }}
                    />
                    <div 
                      className="w-full bg-emerald-500/40 rounded-b"
                      style={{ height: `${(month.savings / maxSpending) * 150}px` }}
                    />
                  </div>
                  <span className="text-xs text-[#efece4]/40">{month.month}</span>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-[#efece4]/5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-violet-500/40" />
                <span className="text-xs text-[#efece4]/50">Spending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500/40" />
                <span className="text-xs text-[#efece4]/50">Savings</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-[#efece4]/[0.02] border border-[#efece4]/5 rounded-xl p-6">
          <h3 className="font-light text-lg mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            AI-Powered Insights
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, i) => (
              <div 
                key={i}
                className={`p-4 rounded-xl border ${
                  insight.trend === 'positive' 
                    ? 'bg-emerald-500/[0.03] border-emerald-500/10' 
                    : 'bg-amber-500/[0.03] border-amber-500/10'
                }`}
              >
                <h4 className={`font-medium mb-2 ${
                  insight.trend === 'positive' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {insight.title}
                </h4>
                <p className="text-sm text-[#efece4]/50">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

