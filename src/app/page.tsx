import {
  Shield,
  Zap,
  Activity,
  Lock,
  Moon,
  Building2,
  Landmark,
  Globe2,
  Calculator,
  Brain,
  Users,
  Sparkles,
  Heart,
  BookOpen,
  ArrowRight,
  Star,
  MessageSquare,
} from "lucide-react";
import NavigationWrapper from "@/components/client/NavigationWrapper";
import ThreeCard from "@/components/client/ThreeCard";
import BackgroundGradients from "@/components/server/BackgroundGradients";
import FeatureCard from "@/components/server/FeatureCard";
import Footer from "@/components/server/Footer";
import ModeShowcase from "@/components/client/ModeShowcase";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-cream overflow-x-hidden">
      {/* Background Effects */}
      <BackgroundGradients />

      {/* Navigation */}
      <NavigationWrapper />

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-20 md:pt-38 md:pb-32 px-6 min-h-screen flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
          {/* Hero Copy */}
          <div className="space-y-10 animate-fade-in-up">
            
            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-thin leading-[1.1] tracking-tight text-cream">
              Banking for{" "}
              <span className="font-normal gradient-text">Everyone.</span>
              <br />
              <span className="text-3xl md:text-4xl text-cream/60 font-light">
                Powered by AI.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg font-light text-cream/60 leading-relaxed max-w-lg border-l border-cream/10 pl-6">
              Whether you prefer{" "}
              <span className="text-violet-400">conventional banking</span> or{" "}
              <span className="text-sentience-gold">
                Shariah-compliant finance
              </span>
              , Lumina adapts to you. One intelligent platform, personalized to
              your values and goals.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button className="h-14 px-8 bg-cream text-black hover:bg-white transition-all duration-500 text-xs font-medium tracking-[0.2em] uppercase flex items-center justify-center gap-2">
                Get Early Access
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="/dashboard"
                className="h-14 px-8 border border-cream/30 text-cream hover:border-cream hover:bg-cream/5 transition-all duration-500 text-xs font-medium tracking-[0.2em] uppercase flex items-center justify-center gap-2"
              >
                Explore Dashboard
                <span className="text-cream">→</span>
              </a>
            </div>
          </div>

          {/* 3D Card Visual */}
          <div className="relative h-[400px] w-full flex items-center justify-center">
            {/* Background Glow */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-linear-to-br from-violet-500/10 via-transparent to-sentience-gold/10 blur-[100px] rounded-full pointer-events-none"
              aria-hidden="true"
            />
            <ThreeCard />
          </div>
        </div>
      </section>

      {/* Manifesto Section */}
      <section className="py-32 px-6 relative border-t border-cream/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-thin mb-12 text-cream leading-tight">
            Liberating digital finance for <br />
            <span className="font-normal text-cream">
              every Malaysian.
            </span>
          </h2>

          <div className="space-y-8 text-lg text-cream/60 font-light leading-relaxed max-w-3xl mx-auto">
            <p>
              In a rapidly evolving digital landscape, financial freedom shouldn't be a privilege. It should be the standard. We are here to dismantle the barriers of complexity, exclusivity, and opacity that have long defined the banking industry.
            </p>
            <p className="text-cream/80">
              <span className="text-cream font-medium">
                We believe in a future where your money works for you, on your terms.
              </span>{" "}
              Whether you seek the precision of conventional banking or the ethical grounding of Shariah-compliant finance, we provide a unified, intelligent platform that respects your choices and amplifies your potential.
            </p>
          </div>
        </div>
      </section>

      {/* Mode Showcase Section - Interactive Tabs */}
      <section className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-thin mb-6 text-cream">
              One Platform.{" "}
              <span className="font-normal text-cream">Your Way.</span>
            </h2>
            <p className="text-cream/50 max-w-2xl mx-auto text-lg font-light leading-relaxed">
              Lumina adapts to how you want to bank. Explore what each
              experience offers.
            </p>
          </div>

          <ModeShowcase />
        </div>
      </section>

      {/* iRAG Technology Section */}
      <section className="py-32 px-6 relative border-t border-cream/5 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-violet-950/20 via-transparent to-sentience-gold/5 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20">
                <Brain className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-medium text-violet-400 uppercase tracking-wider">
                  World&apos;s First
                </span>
              </div>

              <h2 className="text-3xl md:text-5xl font-thin text-cream">
                Introducing{" "}
                <span className="font-normal bg-linear-to-r from-violet-400 to-sentience-gold bg-clip-text text-transparent">
                  iRAG
                </span>
              </h2>

              <p className="text-xl text-cream/60 font-light leading-relaxed">
                The first AI Retrieval-Augmented Generation model purpose-built
                for
                <span className="text-sentience-gold">
                  {" "}
                  Islamic finance in a Malaysian context
                </span>
                .
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-cream mb-1">
                      Trained on Malaysian Islamic Finance
                    </h4>
                    <p className="text-sm text-cream/50">
                      From JAKIM rulings to Bank Negara guidelines, SC Shariah
                      resolutions, and fatwas — iRAG understands the local
                      context.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-sentience-gold/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-sentience-gold" />
                  </div>
                  <div>
                    <h4 className="font-medium text-cream mb-1">
                      Ask Anything, Get Clarity
                    </h4>
                    <p className="text-sm text-cream/50">
                      &quot;Is ASB halal?&quot; &quot;How do I calculate Zakat
                      on EPF?&quot; Get accurate, sourced answers in seconds.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-br from-violet-500/20 to-sentience-gold/20 blur-3xl rounded-full" />
              <div className="relative bg-cream/2 border border-cream/10 rounded-2xl p-8">
                <div className="space-y-4">
                  {/* Chat Mockup */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-cream/10 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-cream/60" />
                    </div>
                    <div className="bg-cream/5 rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                      <p className="text-sm text-cream/80">
                        Is my fixed deposit at Maybank Islamic considered halal?
                        What about the returns?
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <div className="bg-linear-to-br from-violet-500/20 to-sentience-gold/20 rounded-2xl rounded-tr-none p-4 max-w-[85%]">
                      <p className="text-sm text-cream/90 mb-3">
                        Yes, Maybank Islamic&apos;s Fixed Deposit-i is
                        Shariah-compliant. It operates on the Commodity
                        Murabahah (Tawarruq) concept.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-cream/50">
                        <Star className="w-3 h-3 text-sentience-gold" />
                        <span>
                          Source: BNM Shariah Advisory Council Resolution 2019
                        </span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-500 to-sentience-gold flex items-center justify-center shrink-0">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-24">
            <h2 className="text-3xl md:text-5xl font-thin mb-8 text-cream">
              Intelligent Features.
            </h2>
            <p className="text-cream/50 max-w-xl text-lg font-light leading-relaxed">
              AI-powered tools that understand your financial needs — whether
              conventional or Shariah-compliant.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-cream/10 border border-cream/10">
            <FeatureCard
              icon={<Calculator className="w-5 h-5 text-sentience-gold" />}
              title="Smart Zakat Calculator"
              description="AI calculates your Zakat based on current nisab (RM25,578). Integrated with PPZ, MAIWP, and state zakat centers."
            />
            <FeatureCard
              icon={<Building2 className="w-5 h-5 text-sentience-gold" />}
              title="Tabung Haji Integration"
              description="Track your Hajj savings, latest hibah rates (4.1%), and waiting list position. Direct top-up support."
            />
            <FeatureCard
              icon={<Shield className="w-5 h-5 text-sentience-gold" />}
              title="Flexible Protection"
              description="Insurance or Takaful — choose the protection that suits your needs. PIDM protected up to RM250,000."
            />
            <FeatureCard
              icon={<Zap className="w-5 h-5 text-violet-400" />}
              title="AI Financial Coach"
              description="Personalized guidance that respects your preferences. Get smart recommendations aligned with your values."
            />
            <FeatureCard
              icon={<Activity className="w-5 h-5 text-violet-400" />}
              title="Real-time Analytics"
              description="Comprehensive dashboard with spending charts, savings progress, and halal compliance tracking."
            />
            <FeatureCard
              icon={<Globe2 className="w-5 h-5 text-violet-400" />}
              title="All Malaysian Banks"
              description="Connect with Maybank, CIMB, Bank Islam, Public Bank, and more. All major banks supported."
            />
          </div>
        </div>
      </section>

      {/* Malaysian Institutions */}
      <section className="py-20 px-6 bg-linear-to-b from-black to-black border-t border-cream/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-thin mb-4 text-cream">
              Our Potential Partners
            </h2>
            <p className="text-cream/50 max-w-xl mx-auto text-sm font-light">
              We partner with Malaysia&apos;s leading financial institutions to
              deliver a seamless and secure banking experience.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InstitutionBadge name="Bank Negara Malaysia" role="Regulator" />
            <InstitutionBadge name="PIDM" role="Deposit Insurance" />
            <InstitutionBadge name="Securities Commission" role="SC Licensed" />
            <InstitutionBadge name="JAKIM" role="Shariah Certified" />
            <InstitutionBadge name="Tabung Haji" role="Hajj Savings" />
            <InstitutionBadge name="PPZ MAIWP" role="Zakat Collection" />
            <InstitutionBadge name="ASNB" role="Unit Trust" />
            <InstitutionBadge name="Bursa Malaysia" role="Stock Exchange" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-violet-950/20 via-transparent to-sentience-gold/10 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cream/5 border border-cream/10 mb-8">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-medium text-cream/70 uppercase tracking-wider">
              Join the Waitlist
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-thin mb-6 text-cream">
            Ready to experience{" "}
            <span className="font-normal text-violet-400">
              banking done right?
            </span>
          </h2>
          <p className="text-cream/50 text-lg font-light mb-10 max-w-xl mx-auto">
            Be among the first Malaysians to access Lumina. Open your account in
            5 minutes. No commitments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="h-14 px-10 bg-cream text-black hover:bg-white transition-all duration-500 text-xs font-medium tracking-[0.2em] uppercase flex items-center justify-center gap-2">
              Get Early Access
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="/dashboard"
              className="h-14 px-10 border border-cream/30 text-cream hover:border-cream hover:bg-cream/5 transition-all duration-500 text-xs font-medium tracking-[0.2em] uppercase flex items-center justify-center gap-2"
            >
              Explore Demo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function InstitutionBadge({ name, role }: { name: string; role: string }) {
  return (
    <div className="p-4 bg-cream/2 border border-cream/5 rounded-xl text-center hover:border-cream/10 transition-colors">
      <div className="w-10 h-10 rounded-full bg-cream/5 flex items-center justify-center mx-auto mb-3">
        <Landmark className="w-5 h-5 text-cream/40" />
      </div>
      <p className="text-sm text-cream font-light">{name}</p>
      <p className="text-xs text-cream/40 mt-1">{role}</p>
    </div>
  );
}
