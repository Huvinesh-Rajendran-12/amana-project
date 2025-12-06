import DashboardHeader from '@/components/client/DashboardHeader';
import { 
  Sparkles, 
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Target,
  Shield,
  Clock,
  ChevronRight,
  Zap
} from 'lucide-react';

// Mock AI insights
const insights = [
  {
    id: 1,
    type: 'saving',
    priority: 'high',
    title: 'Subscription Optimization',
    description: 'We found 3 subscriptions you haven\'t used in 60+ days. Canceling them could save you $47.99/month.',
    potentialSavings: 576,
    action: 'Review Subscriptions',
    services: ['Adobe Creative Cloud', 'Spotify Duo', 'Headspace'],
  },
  {
    id: 2,
    type: 'warning',
    priority: 'medium',
    title: 'Dining Budget Alert',
    description: 'You\'ve spent 78% of your monthly dining budget with 12 days remaining. At this pace, you\'ll exceed by $120.',
    projectedOverspend: 120,
    action: 'Adjust Budget',
  },
  {
    id: 3,
    type: 'success',
    priority: 'info',
    title: 'Impulse Block Success',
    description: 'The AI blocked your $2,400 Louis Vuitton purchase. Your savings goal is now 23% closer.',
    amountSaved: 2400,
    action: 'View Details',
  },
  {
    id: 4,
    type: 'pattern',
    priority: 'medium',
    title: 'Late-Night Spending Pattern',
    description: 'Purchases made between 11PM-3AM cost you $890 last month. These tend to be 40% more impulsive.',
    suggestion: 'Enable night mode spending limits',
    action: 'Enable Night Mode',
  },
  {
    id: 5,
    type: 'opportunity',
    priority: 'low',
    title: 'Better APY Available',
    description: 'Moving $5,000 from your regular savings to the High-Yield Vault could earn you an extra $125/year.',
    potentialGain: 125,
    action: 'Transfer Funds',
  },
  {
    id: 6,
    type: 'goal',
    priority: 'info',
    title: 'Goal Acceleration',
    description: 'Your emergency fund is 84% complete. Increasing monthly contribution by $100 would complete it 2 months early.',
    action: 'Adjust Contribution',
  },
];

const weeklyStats = {
  blocked: 3,
  blockedAmount: 4240,
  suggestions: 12,
  actioned: 8,
  savedThisWeek: 890,
};

export default function InsightsPage() {
  const getIcon = (type: string) => {
    switch (type) {
      case 'saving': return TrendingDown;
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle;
      case 'pattern': return Clock;
      case 'opportunity': return Lightbulb;
      case 'goal': return Target;
      default: return Sparkles;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'saving': return { bg: 'bg-cyan-500/5', border: 'border-cyan-500/10', text: 'text-cyan-400' };
      case 'warning': return { bg: 'bg-amber-500/5', border: 'border-amber-500/10', text: 'text-amber-400' };
      case 'success': return { bg: 'bg-emerald-500/5', border: 'border-emerald-500/10', text: 'text-emerald-400' };
      case 'pattern': return { bg: 'bg-violet-500/5', border: 'border-violet-500/10', text: 'text-violet-400' };
      case 'opportunity': return { bg: 'bg-blue-500/5', border: 'border-blue-500/10', text: 'text-blue-400' };
      case 'goal': return { bg: 'bg-pink-500/5', border: 'border-pink-500/10', text: 'text-pink-400' };
      default: return { bg: 'bg-[#efece4]/10', border: 'border-[#efece4]/20', text: 'text-[#efece4]' };
    }
  };

  return (
    <div className="text-[#efece4]">
      <DashboardHeader 
        title="AI Insights" 
        subtitle="Personalized recommendations from your financial guardian"
      />

      <div className="p-6 lg:p-8 space-y-8">
        {/* AI Status Banner */}
        <div className="bg-gradient-to-r from-violet-900/30 to-cyan-900/30 border border-violet-500/20 rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-violet-500/10 flex items-center justify-center">
                <Brain className="w-7 h-7 text-violet-400" />
              </div>
              <div>
                <h2 className="text-xl font-light text-[#efece4]">Your AI Guardian is Active</h2>
                <p className="text-sm text-[#efece4]/50">Continuously analyzing your spending patterns</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 md:gap-8">
              <div className="text-center">
                <p className="text-2xl font-light text-violet-400">{weeklyStats.blocked}</p>
                <p className="text-xs text-[#efece4]/40">Blocked</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-light text-emerald-400">${weeklyStats.savedThisWeek}</p>
                <p className="text-xs text-[#efece4]/40">Saved This Week</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-light text-cyan-400">{weeklyStats.actioned}/{weeklyStats.suggestions}</p>
                <p className="text-xs text-[#efece4]/40">Actions Taken</p>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-red-400" />
              <span className="text-sm text-red-400">High Priority</span>
            </div>
            <p className="text-3xl font-light font-mono text-[#efece4]">
              {insights.filter(i => i.priority === 'high').length}
            </p>
            <p className="text-xs text-[#efece4]/40 mt-1">Action required</p>
          </div>
          <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-amber-400">Medium Priority</span>
            </div>
            <p className="text-3xl font-light font-mono text-[#efece4]">
              {insights.filter(i => i.priority === 'medium').length}
            </p>
            <p className="text-xs text-[#efece4]/40 mt-1">Review recommended</p>
          </div>
          <div className="p-6 bg-[#efece4]/[0.02] border border-[#efece4]/5 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-5 h-5 text-[#efece4]/60" />
              <span className="text-sm text-[#efece4]/60">Opportunities</span>
            </div>
            <p className="text-3xl font-light font-mono text-[#efece4]">
              {insights.filter(i => i.priority === 'low' || i.priority === 'info').length}
            </p>
            <p className="text-xs text-[#efece4]/40 mt-1">When you have time</p>
          </div>
        </div>

        {/* Insights List */}
        <div className="space-y-4">
          <h3 className="text-lg font-light flex items-center gap-2">
            <Zap className="w-5 h-5 text-violet-400" />
            Active Insights
          </h3>
          
          {insights.map((insight) => {
            const IconComponent = getIcon(insight.type);
            const colors = getColor(insight.type);
            
            return (
              <div 
                key={insight.id}
                className={`p-6 rounded-xl border ${colors.bg} ${colors.border} hover:scale-[1.01] transition-transform cursor-pointer`}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4 className="font-medium text-[#efece4]">{insight.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        insight.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                        insight.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-[#efece4]/10 text-[#efece4]/60'
                      }`}>
                        {insight.priority}
                      </span>
                    </div>
                    <p className="text-sm text-[#efece4]/60 mb-4">{insight.description}</p>
                    
                    {/* Additional info based on type */}
                    <div className="flex flex-wrap items-center gap-4">
                      {insight.potentialSavings && (
                        <span className="text-sm text-emerald-400">
                          Save ${insight.potentialSavings}/year
                        </span>
                      )}
                      {insight.amountSaved && (
                        <span className="text-sm text-emerald-400">
                          Saved ${insight.amountSaved}
                        </span>
                      )}
                      {insight.projectedOverspend && (
                        <span className="text-sm text-amber-400">
                          Projected overspend: ${insight.projectedOverspend}
                        </span>
                      )}
                      {insight.potentialGain && (
                        <span className="text-sm text-cyan-400">
                          Potential gain: ${insight.potentialGain}/year
                        </span>
                      )}
                      {insight.services && (
                        <div className="flex gap-2">
                          {insight.services.map((service, i) => (
                            <span key={i} className="px-2 py-1 bg-[#efece4]/5 rounded text-xs text-[#efece4]/50">
                              {service}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm ${colors.bg} ${colors.text} hover:opacity-80 transition-opacity flex-shrink-0`}>
                    {insight.action}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Learning Section */}
        <div className="bg-[#efece4]/[0.02] border border-[#efece4]/5 rounded-xl p-6">
          <h3 className="font-light text-lg mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-400" />
            How Your AI Learns
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-violet-500/5 flex items-center justify-center">
                <span className="text-violet-400 font-mono">1</span>
              </div>
              <h4 className="font-medium text-[#efece4]">Pattern Recognition</h4>
              <p className="text-sm text-[#efece4]/50">Analyzes your spending habits across 50+ behavioral signals</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/5 flex items-center justify-center">
                <span className="text-cyan-400 font-mono">2</span>
              </div>
              <h4 className="font-medium text-[#efece4]">Goal Alignment</h4>
              <p className="text-sm text-[#efece4]/50">Connects every transaction to your financial objectives</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/5 flex items-center justify-center">
                <span className="text-emerald-400 font-mono">3</span>
              </div>
              <h4 className="font-medium text-[#efece4]">Continuous Improvement</h4>
              <p className="text-sm text-[#efece4]/50">Gets smarter with every transaction and feedback you provide</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

