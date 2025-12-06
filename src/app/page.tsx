import { Shield, Zap, Activity, Lock, Check, X } from 'lucide-react';
import NavigationWrapper from '@/components/client/NavigationWrapper';
import ThreeCard from '@/components/client/ThreeCard';
import BackgroundGradients from '@/components/server/BackgroundGradients';
import FeatureCard from '@/components/server/FeatureCard';
import Footer from '@/components/server/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#030303] text-[#efece4] overflow-x-hidden">
      {/* Background Effects */}
      <BackgroundGradients />

      {/* Navigation */}
      <NavigationWrapper />

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-20 md:pt-48 md:pb-32 px-6 min-h-screen flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
          
          {/* Hero Copy */}
          <div className="space-y-10 animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#efece4]/5 border border-[#efece4]/5 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-[10px] font-light tracking-widest uppercase text-[#efece4]/70">
                Early Access Open
              </span>
            </div>
            
            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-thin leading-[1.1] tracking-tight text-[#efece4]">
              A credit card with a <br />
              <span className="font-normal gradient-text">conscience.</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg font-light text-[#efece4]/60 leading-relaxed max-w-lg border-l border-[#efece4]/10 pl-6">
              Sentience acts as your 24/7 financial underwriter. Using real-time LLMs, 
              it audits every swipe to block impulse buys and enforce the discipline 
              you promised yourself.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button className="h-14 px-8 bg-[#efece4] text-[#030303] hover:bg-[#f5f3ed] transition-all duration-500 text-xs font-medium tracking-[0.2em] uppercase">
                Mint Access Card
              </button>
              <a 
                href="/dashboard" 
                className="h-14 px-8 border border-[#efece4]/30 text-[#efece4] hover:border-[#efece4] hover:bg-[#efece4]/5 transition-all duration-500 text-xs font-medium tracking-[0.2em] uppercase flex items-center justify-center gap-2"
              >
                Experience Now
                <span className="text-violet-400">→</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-8 pt-8 text-[10px] font-light tracking-widest uppercase text-[#efece4]/40">
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3" />
                <span>FDIC Insured</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3 h-3" />
                <span>256-bit Encryption</span>
              </div>
            </div>
          </div>

          {/* 3D Card Visual */}
          <div className="relative h-[400px] w-full flex items-center justify-center">
            {/* Background Glow */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-violet-500/5 blur-[100px] rounded-full pointer-events-none" 
              aria-hidden="true"
            />
            <ThreeCard />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-24">
            <h2 className="text-3xl md:text-5xl font-thin mb-8 text-[#efece4]">
              Willpower as a Service.
            </h2>
            <p className="text-[#efece4]/50 max-w-xl text-lg font-light leading-relaxed">
              Most cards profit when you lose control. We profit when you keep it. 
              Our AI acts as a firewall between your wallet and the world.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-[#efece4]/10 border border-[#efece4]/10">
            <FeatureCard 
              icon={<Shield className="w-5 h-5 text-violet-300" />}
              title="Active Interception"
              description="The card declines transactions that violate your goals. Trying to buy a $400 jacket when rent is due? Declined."
            />
            <FeatureCard 
              icon={<Zap className="w-5 h-5 text-violet-300" />}
              title="Dynamic Limits"
              description="Your credit limit breathes. $50 cap on Mondays. $200 cap on Friday nights. $0 cap at 3AM."
            />
            <FeatureCard 
              icon={<Activity className="w-5 h-5 text-violet-300" />}
              title="Wealth Optimization"
              description="We don't just block; we invest. Every saved dollar is automatically swept into a 5% APY yield vault."
            />
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="comparison" className="py-32 px-6 bg-gradient-to-b from-[#050505] to-[#030303] border-t border-[#efece4]/5">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-thin mb-6 text-[#efece4]">
              A Different <span className="font-normal text-violet-400">Philosophy</span>
            </h2>
            <p className="text-[#efece4]/50 text-lg font-light leading-relaxed max-w-2xl mx-auto">
              Traditional credit cards profit from your failures. We built something different.
            </p>
          </div>

          {/* Comparison Cards */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Conventional Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent rounded-2xl" />
              <div className="relative p-8 md:p-10 rounded-2xl border border-[#efece4]/5 bg-[#efece4]/[0.01]">
                {/* Header */}
                <div className="mb-10">
                  <p className="text-xs font-medium tracking-widest uppercase text-[#efece4]/40 mb-2">The Industry Standard</p>
                  <h3 className="text-2xl font-light text-[#efece4]/70">Conventional Cards</h3>
                </div>

                {/* Features List */}
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/5 flex items-center justify-center">
                      <X className="w-4 h-4 text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium text-[#efece4] mb-1">Profits from Debt</p>
                      <p className="text-sm text-[#efece4]/40">Encourages spending. Charges 24% APR when you fail.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/5 flex items-center justify-center">
                      <X className="w-4 h-4 text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium text-[#efece4] mb-1">Passive Tracking</p>
                      <p className="text-sm text-[#efece4]/40">Tells you that you&apos;re broke 30 days later.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/5 flex items-center justify-center">
                      <X className="w-4 h-4 text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium text-[#efece4] mb-1">Maximizes Spending</p>
                      <p className="text-sm text-[#efece4]/40">Rewards points that encourage more consumption.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sentience Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 to-transparent rounded-2xl" />
              <div className="absolute inset-0 rounded-2xl border border-violet-500/20" />
              <div className="relative p-8 md:p-10 rounded-2xl bg-violet-500/[0.02]">
                {/* Header */}
                <div className="mb-10">
                  <p className="text-xs font-medium tracking-widest uppercase text-violet-400 mb-2">The New Standard</p>
                  <h3 className="text-2xl font-normal text-[#efece4]">Sentience</h3>
                </div>

                {/* Features List */}
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                      <Check className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="font-medium text-[#efece4] mb-1">Profits from Wealth</p>
                      <p className="text-sm text-[#efece4]/50">Annual fee model. We lose money if you default.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                      <Check className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="font-medium text-[#efece4] mb-1">Active Defense</p>
                      <p className="text-sm text-[#efece4]/50">Blocks the transaction before money leaves your account.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                      <Check className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="font-medium text-[#efece4] mb-1">Maximizes Wealth</p>
                      <p className="text-sm text-[#efece4]/50">AI-driven savings automatically invested at 5% APY.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
