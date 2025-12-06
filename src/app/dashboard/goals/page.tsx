import DashboardHeader from '@/components/client/DashboardHeader';
import { 
  Target, 
  Plus,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  Home,
  Car,
  Plane,
  GraduationCap,
  Briefcase
} from 'lucide-react';

// Mock goals data
const goals = [
  { 
    id: 1,
    name: 'Emergency Fund', 
    target: 10000, 
    current: 8432, 
    deadline: 'Mar 2026',
    icon: Briefcase,
    color: '#8b5cf6',
    monthlyContribution: 500,
    status: 'on_track'
  },
  { 
    id: 2,
    name: 'Vacation to Japan', 
    target: 5000, 
    current: 2150, 
    deadline: 'Aug 2026',
    icon: Plane,
    color: '#06b6d4',
    monthlyContribution: 300,
    status: 'on_track'
  },
  { 
    id: 3,
    name: 'New Car Down Payment', 
    target: 15000, 
    current: 4200, 
    deadline: 'Dec 2026',
    icon: Car,
    color: '#10b981',
    monthlyContribution: 800,
    status: 'behind'
  },
  { 
    id: 4,
    name: 'Home Down Payment', 
    target: 60000, 
    current: 12500, 
    deadline: 'Dec 2027',
    icon: Home,
    color: '#f59e0b',
    monthlyContribution: 2000,
    status: 'on_track'
  },
  { 
    id: 5,
    name: 'Education Fund', 
    target: 20000, 
    current: 20000, 
    deadline: 'Completed',
    icon: GraduationCap,
    color: '#22c55e',
    monthlyContribution: 0,
    status: 'completed'
  },
];

const aiSuggestions = [
  'Increase your Emergency Fund contribution by $100/month to reach your goal 2 months earlier.',
  'Your dining expenses could fund your Japan trip 3 months sooner if reduced by 20%.',
  'Consider automating your car down payment savings on payday for better consistency.',
];

export default function GoalsPage() {
  const totalSaved = goals.reduce((acc, g) => acc + g.current, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.target, 0);

  return (
    <div className="text-[#efece4]">
      <DashboardHeader 
        title="Savings Goals" 
        subtitle="Track progress toward your financial goals"
      />

      <div className="p-6 lg:p-8 space-y-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 bg-[#efece4]/[0.02] border border-[#efece4]/5 rounded-xl">
            <p className="text-xs text-[#efece4]/40 mb-2">Total Goals</p>
            <p className="text-3xl font-light font-mono">{goals.length}</p>
          </div>
          <div className="p-6 bg-[#efece4]/[0.02] border border-[#efece4]/5 rounded-xl">
            <p className="text-xs text-[#efece4]/40 mb-2">Total Saved</p>
            <p className="text-3xl font-light font-mono">${totalSaved.toLocaleString()}</p>
          </div>
          <div className="p-6 bg-[#efece4]/[0.02] border border-[#efece4]/5 rounded-xl">
            <p className="text-xs text-[#efece4]/40 mb-2">Total Target</p>
            <p className="text-3xl font-light font-mono">${totalTarget.toLocaleString()}</p>
          </div>
          <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
            <p className="text-xs text-emerald-400/70 mb-2">Overall Progress</p>
            <p className="text-3xl font-light font-mono text-emerald-400">
              {Math.round((totalSaved / totalTarget) * 100)}%
            </p>
          </div>
        </div>

        {/* Add Goal Button */}
        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-6 py-3 bg-violet-500/10 border border-violet-500/20 rounded-lg text-violet-400 hover:bg-violet-500/15 transition-colors">
            <Plus className="w-4 h-4" />
            Create New Goal
          </button>
        </div>

        {/* Goals List */}
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = (goal.current / goal.target) * 100;
            const IconComponent = goal.icon;
            
            return (
              <div 
                key={goal.id}
                className="p-6 bg-[#efece4]/[0.02] border border-[#efece4]/5 rounded-xl hover:border-[#efece4]/10 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Icon & Name */}
                  <div className="flex items-center gap-4 flex-1">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${goal.color}20` }}
                    >
                      <IconComponent className="w-6 h-6" style={{ color: goal.color }} />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#efece4]">{goal.name}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-[#efece4]/40 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {goal.deadline}
                        </span>
                        {goal.monthlyContribution > 0 && (
                          <span className="text-xs text-[#efece4]/40">
                            ${goal.monthlyContribution}/mo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-mono text-[#efece4]">
                        ${goal.current.toLocaleString()}
                      </span>
                      <span className="text-sm font-mono text-[#efece4]/40">
                        ${goal.target.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-[#efece4]/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(progress, 100)}%`,
                          backgroundColor: goal.color
                        }}
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    {goal.status === 'completed' ? (
                      <span className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/5 text-emerald-400 rounded-full text-xs">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </span>
                    ) : goal.status === 'on_track' ? (
                      <span className="flex items-center gap-1 px-3 py-1.5 bg-violet-500/5 text-violet-400 rounded-full text-xs">
                        <TrendingUp className="w-3 h-3" />
                        On Track
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/5 text-amber-400 rounded-full text-xs">
                        <Clock className="w-3 h-3" />
                        Behind
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Suggestions */}
        <div className="bg-gradient-to-r from-violet-900/20 to-cyan-900/20 border border-[#efece4]/5 rounded-xl p-6">
          <h3 className="font-light text-lg mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            AI Suggestions to Reach Your Goals Faster
          </h3>
          <div className="space-y-3">
            {aiSuggestions.map((suggestion, i) => (
              <div 
                key={i}
                className="flex items-start gap-3 p-4 bg-[#efece4]/[0.02] rounded-lg"
              >
                <div className="w-6 h-6 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-violet-400">{i + 1}</span>
                </div>
                <p className="text-sm text-[#efece4]/70">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

