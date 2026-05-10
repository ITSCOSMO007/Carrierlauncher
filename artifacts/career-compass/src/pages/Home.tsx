import { useRef } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Compass, BrainCircuit, BarChart3, Map, BookOpen,
  Shield, Zap, GraduationCap, Bot, Target, TrendingUp, Code, ChevronRight
} from "lucide-react";

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

const OUTPUTS = [
  { icon: <Target className="w-4 h-4" />, label: "Career matches with fit scores" },
  { icon: <BrainCircuit className="w-4 h-4" />, label: "Why each career fits you specifically" },
  { icon: <BarChart3 className="w-4 h-4" />, label: "Realistic salary estimates by country" },
  { icon: <Shield className="w-4 h-4" />, label: "AI automation risk analysis" },
  { icon: <GraduationCap className="w-4 h-4" />, label: "Best degrees for your goals" },
  { icon: <Zap className="w-4 h-4" />, label: "Alternative paths without a degree" },
  { icon: <BookOpen className="w-4 h-4" />, label: "Scholarships and entrance exams" },
  { icon: <Map className="w-4 h-4" />, label: "College recommendations by budget" },
  { icon: <BookOpen className="w-4 h-4" />, label: "Free learning resources" },
  { icon: <Code className="w-4 h-4" />, label: "Paid courses worth investing in" },
  { icon: <Map className="w-4 h-4" />, label: "1-month, 6-month, 1-year, 3-year roadmap" },
  { icon: <Code className="w-4 h-4" />, label: "Beginner projects to build now" },
  { icon: <TrendingUp className="w-4 h-4" />, label: "Skill trees per career" },
  { icon: <TrendingUp className="w-4 h-4" />, label: "Industry demand outlook" },
  { icon: <Zap className="w-4 h-4" />, label: "Side hustle ideas matching your skills" },
  { icon: <Target className="w-4 h-4" />, label: "Portfolio recommendations" },
  { icon: <Bot className="w-4 h-4" />, label: "Networking and internship advice" },
  { icon: <BrainCircuit className="w-4 h-4" />, label: "AI chat for follow-up questions" },
  { icon: <ArrowRight className="w-4 h-4" />, label: "Specific actions to take this week" },
];

const STEPS = [
  {
    number: "01",
    title: "Answer honestly",
    desc: "Tell us your age, country, interests, school level, grades, goals, and what kind of life you want. The more specific, the better your results.",
  },
  {
    number: "02",
    title: "AI builds your profile",
    desc: "Our AI analyzes your answers against real labor market data, global education systems, and emerging technology trends.",
  },
  {
    number: "03",
    title: "Get your full roadmap",
    desc: "Receive a premium dashboard with career matches, salary data, a personalized roadmap, resources, and specific next steps.",
  },
];

const WHY_POINTS = [
  {
    title: "Generic advice doesn't work",
    desc: "Most career advice assumes everyone is the same. Your country, budget, grades, and personality completely change what's realistic for you.",
  },
  {
    title: "The job market is changing fast",
    desc: "AI is automating entire job categories. You need to know which careers are growing, which are shrinking, and which are safe to build toward.",
  },
  {
    title: "Information overload is real",
    desc: "There's too much advice online and most of it contradicts itself. You need one clear, personalized signal — not another list of \"hot careers.\"",
  },
];

export default function Home() {
  return (
    <div className="w-full flex flex-col items-center text-foreground">
      {/* Navbar */}
      <header className="w-full sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg tracking-tight">CareerCompass AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {[
              { href: "/compare", label: "Compare Careers" },
              { href: "/skill-gap", label: "Skill Gap" },
              { href: "/ai-future", label: "AI Future" },
              { href: "/chat", label: "AI Chat" },
              { href: "/reports", label: "Reports" },
            ].map(link => (
              <Link key={link.href} href={link.href}>
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid={`nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}>
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>
          <Link href="/quiz">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2" data-testid="nav-cta">
              Start Analysis <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="w-full">
        {/* Hero */}
        <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/10 rounded-full blur-[140px]" />
            <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px]" />
          </div>

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          <div className="relative z-10 flex flex-col items-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
            >
              <BrainCircuit className="w-4 h-4" />
              AI-powered career analysis — honest, personalized, free
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.05] mb-6"
            >
              Stop guessing{" "}
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-400 to-secondary">
                  your future.
                </span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-4"
            >
              Answer questions about who you are and what you want. Get a brutally honest, deeply personalized career roadmap built by AI — including salaries, schools, scholarships, and a week-by-week plan.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-sm text-muted-foreground/60 mb-10"
            >
              No sign-up required. No fake testimonials. No generic advice.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.22 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/quiz">
                <Button
                  size="lg"
                  className="h-13 px-8 text-base font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-[0_0_40px_hsl(var(--primary)/0.35)] hover:shadow-[0_0_55px_hsl(var(--primary)/0.5)] transition-all duration-300 gap-2"
                  data-testid="hero-cta"
                >
                  Analyze My Career <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/compare">
                <Button size="lg" variant="outline" className="h-13 px-8 text-base rounded-xl gap-2" data-testid="hero-compare">
                  Compare Careers <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* How it works */}
        <section className="w-full py-24 px-6 border-t border-border/50">
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <div className="text-center mb-14">
                <div className="text-xs text-primary font-semibold uppercase tracking-widest mb-3">How it works</div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">From blank page to clear direction</h2>
              </div>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STEPS.map((step, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="glass-card rounded-2xl p-6 h-full">
                    <div className="text-4xl font-bold text-primary/20 font-mono mb-4">{step.number}</div>
                    <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* What you get */}
        <section className="w-full py-24 px-6 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent">
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <div className="text-center mb-14">
                <div className="text-xs text-primary font-semibold uppercase tracking-widest mb-3">What you get</div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">19 things your report includes</h2>
                <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Everything generated specifically for your profile by AI. Nothing recycled or generic.</p>
              </div>
            </FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {OUTPUTS.map((item, i) => (
                <FadeIn key={i} delay={Math.floor(i / 3) * 0.06}>
                  <div className="flex items-center gap-3 p-4 glass-card rounded-xl group hover:border-primary/30 border border-transparent transition-all">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                      {item.icon}
                    </div>
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Why AI career guidance matters */}
        <section className="w-full py-24 px-6 border-t border-border/50">
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <div className="text-center mb-14">
                <div className="text-xs text-primary font-semibold uppercase tracking-widest mb-3">Why this matters</div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Why AI career guidance matters now</h2>
              </div>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {WHY_POINTS.map((point, i) => (
                <FadeIn key={i} delay={i * 0.08}>
                  <div className="glass-card rounded-2xl p-6 h-full border-t-2 border-t-primary/40">
                    <h3 className="font-bold text-lg mb-3">{point.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{point.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Features strip */}
        <section className="w-full py-16 px-6 bg-gradient-to-r from-transparent via-primary/5 to-transparent">
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: <Bot />, label: "AI Chat Assistant", desc: "Ask follow-up questions anytime" },
                  { icon: <BarChart3 />, label: "Career Comparison", desc: "Compare 2–4 careers side by side" },
                  { icon: <Shield />, label: "AI Future Check", desc: "Will AI replace your job?" },
                  { icon: <Target />, label: "Skill Gap Analysis", desc: "Know exactly what to learn" },
                ].map((f, i) => (
                  <div key={i} className="text-center">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-3">
                      {f.icon}
                    </div>
                    <div className="font-semibold text-sm mb-1">{f.label}</div>
                    <div className="text-xs text-muted-foreground">{f.desc}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Future-proof CTA */}
        <section className="w-full py-24 px-6 border-t border-border/50">
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn>
              <div className="glass-card rounded-3xl p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/5 pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary mx-auto mb-6">
                    <Compass className="w-7 h-7" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                    Future-proof your career
                  </h2>
                  <p className="text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
                    The world doesn't need another list of "top careers for 2025." It needs you to know exactly what fits who you actually are. That's what this does.
                  </p>
                  <Link href="/quiz">
                    <Button
                      size="lg"
                      className="h-13 px-10 text-base font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-[0_0_40px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_60px_hsl(var(--primary)/0.6)] transition-all duration-300 gap-2"
                      data-testid="footer-cta"
                    >
                      Start Your Analysis <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground/50 mt-4">Free. No account needed. Takes about 5 minutes.</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border/50 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">CareerCompass AI</span>
          </div>
          <div className="flex items-center gap-6">
            {[
              { href: "/quiz", label: "Start Analysis" },
              { href: "/compare", label: "Compare" },
              { href: "/chat", label: "AI Chat" },
              { href: "/reports", label: "Reports" },
            ].map(link => (
              <Link key={link.href} href={link.href}>
                <span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{link.label}</span>
              </Link>
            ))}
          </div>
          <div className="text-xs text-muted-foreground/40">AI-generated guidance. Do your own research too.</div>
        </div>
      </footer>
    </div>
  );
}
