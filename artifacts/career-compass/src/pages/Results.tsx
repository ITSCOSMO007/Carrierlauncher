import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSaveReport, getListReportsQueryKey } from "@workspace/api-client-react";
import {
  Compass, ArrowLeft, Download, Save, TrendingUp, AlertTriangle,
  BookOpen, Zap, GraduationCap, Star, Clock, ChevronRight, Bot
} from "lucide-react";

interface CareerMatch {
  title: string;
  fitScore: number;
  why: string;
  salaryRange: { min: number; max: number; currency: string; country: string };
  aiRisk: string;
  aiRiskPercent: number;
  demandOutlook: string;
  topDegrees: string[];
  alternativePaths: string[];
}

interface CareerAnalysis {
  personalizedSummary: string;
  careers: CareerMatch[];
  roadmap: { oneMonth: string[]; sixMonths: string[]; oneYear: string[]; threeYears: string[] };
  weeklyActions: string[];
  freeResources: Array<{ name: string; type: string; url: string; cost: string; description: string }>;
  paidResources: Array<{ name: string; type: string; url: string; cost: string; description: string }>;
  colleges: Array<{ name: string; country: string; program: string; tuitionRange: string; scholarshipAvailable: boolean; entryRequirements: string }>;
  scholarships: Array<{ name: string; provider: string; amount: string; eligibility: string; deadline: string; url: string }>;
  skillTrees: Array<{ career: string; foundational: string[]; intermediate: string[]; advanced: string[] }>;
  beginnerProjects: string[];
  sideHustleIdeas: string[];
  portfolioTips: string[];
  networkingAdvice: string[];
  internshipAdvice: string[];
}

const DEMAND_COLORS: Record<string, string> = {
  booming: "text-emerald-400",
  growing: "text-green-400",
  stable: "text-yellow-400",
  declining: "text-red-400",
};

const RISK_COLORS: Record<string, string> = {
  low: "text-emerald-400",
  medium: "text-yellow-400",
  high: "text-red-400",
};

function AiRiskMeter({ percent, level }: { percent: number; level: string }) {
  const color = level === "low" ? "#34d399" : level === "medium" ? "#fbbf24" : "#f87171";
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
          <circle
            cx="18" cy="18" r="15" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${percent * 0.942} 94.2`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{percent}%</span>
      </div>
      <div>
        <div className={`text-sm font-semibold capitalize ${RISK_COLORS[level]}`}>{level} Risk</div>
        <div className="text-xs text-muted-foreground">AI automation risk</div>
      </div>
    </div>
  );
}

function FitScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    : score >= 60 ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    : "bg-red-500/20 text-red-400 border-red-500/30";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-bold ${color}`}>
      <Star className="w-3 h-3" /> {score}% fit
    </span>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-2xl p-6"
    >
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span className="text-primary">{icon}</span> {title}
      </h3>
      {children}
    </motion.div>
  );
}

export default function Results() {
  const [, setLocation] = useLocation();
  const [analysis, setAnalysis] = useState<CareerAnalysis | null>(null);
  const [userProfile, setUserProfile] = useState<Record<string, unknown> | null>(null);
  const [selectedCareer, setSelectedCareer] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const queryClient = useQueryClient();
  const saveReport = useSaveReport();

  useEffect(() => {
    const raw = sessionStorage.getItem("careerAnalysis");
    const profile = sessionStorage.getItem("userProfile");
    if (!raw) { setLocation("/quiz"); return; }
    try {
      setAnalysis(JSON.parse(raw));
      if (profile) setUserProfile(JSON.parse(profile));
    } catch {
      setLocation("/quiz");
    }
  }, [setLocation]);

  if (!analysis) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  const career = analysis.careers?.[selectedCareer];
  const salaryData = analysis.careers?.map(c => ({
    name: c.title.length > 18 ? c.title.slice(0, 16) + "…" : c.title,
    min: c.salaryRange?.min ?? 0,
    max: c.salaryRange?.max ?? 0,
  })) ?? [];

  const handleSave = async () => {
    if (!userProfile) return;
    try {
      await saveReport.mutateAsync({
        data: {
          name: `Analysis — ${new Date().toLocaleDateString()}`,
          profile: (userProfile as unknown) as Parameters<typeof saveReport.mutateAsync>[0]["data"]["profile"],
          analysis: (analysis as unknown) as Parameters<typeof saveReport.mutateAsync>[0]["data"]["analysis"],
        },
      });
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
    } catch {
      setSaveError("Failed to save report.");
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors" data-testid="link-home">
                <Compass className="w-5 h-5" />
                <span className="font-bold hidden sm:block">CareerCompass AI</span>
              </button>
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Your Results</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 text-xs" data-testid="button-export">
              <Download className="w-3 h-3" /> Export PDF
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saved || saveReport.isPending}
              className="gap-2 text-xs bg-primary hover:bg-primary/90"
              data-testid="button-save"
            >
              <Save className="w-3 h-3" />
              {saved ? "Saved" : saveReport.isPending ? "Saving..." : "Save Report"}
            </Button>
            <Link href="/chat">
              <Button size="sm" variant="outline" className="gap-2 text-xs" data-testid="link-chat">
                <Bot className="w-3 h-3" /> Ask AI
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* Summary Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 border-l-4 border-l-primary"
        >
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-lg mb-1">Your AI Career Summary</h2>
              <p className="text-muted-foreground leading-relaxed">{analysis.personalizedSummary}</p>
            </div>
          </div>
        </motion.div>

        {saveError && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-sm text-destructive">{saveError}</div>
        )}

        {/* Career Cards */}
        <div>
          <h2 className="text-xl font-bold mb-4">Your Top Career Matches</h2>
          <div className="flex gap-3 mb-6 flex-wrap">
            {analysis.careers?.map((c, i) => (
              <button
                key={i}
                onClick={() => setSelectedCareer(i)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${selectedCareer === i ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                data-testid={`career-tab-${i}`}
              >
                {c.title}
              </button>
            ))}
          </div>

          {career && (
            <motion.div
              key={selectedCareer}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6 space-y-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{career.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    <FitScoreBadge score={career.fitScore} />
                    <Badge variant="outline" className={`capitalize ${DEMAND_COLORS[career.demandOutlook]}`}>
                      <TrendingUp className="w-3 h-3 mr-1" /> {career.demandOutlook}
                    </Badge>
                  </div>
                </div>
                <AiRiskMeter percent={career.aiRiskPercent} level={career.aiRisk} />
              </div>

              <p className="text-muted-foreground leading-relaxed">{career.why}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-background/40 rounded-xl p-4">
                  <div className="text-xs text-muted-foreground mb-1 font-medium">Salary Range ({career.salaryRange?.country})</div>
                  <div className="text-xl font-bold">
                    {career.salaryRange?.currency} {(career.salaryRange?.min ?? 0).toLocaleString()} – {(career.salaryRange?.max ?? 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">per year</div>
                </div>
                <div className="bg-background/40 rounded-xl p-4">
                  <div className="text-xs text-muted-foreground mb-2 font-medium">Top Degrees</div>
                  <ul className="space-y-1">
                    {career.topDegrees?.map((d, i) => (
                      <li key={i} className="text-sm flex items-center gap-2">
                        <GraduationCap className="w-3 h-3 text-primary flex-shrink-0" /> {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {career.alternativePaths?.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Alternative Paths (No Degree)</div>
                  <div className="flex flex-wrap gap-2">
                    {career.alternativePaths.map((p, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Salary Chart */}
        {salaryData.length > 0 && (
          <Section title="Salary Comparison" icon={<TrendingUp className="w-5 h-5" />}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                    formatter={(v: number) => [`$${v.toLocaleString()}`, ""]}
                  />
                  <Bar dataKey="min" name="Min Salary" fill="hsl(var(--primary) / 0.5)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="max" name="Max Salary" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        )}

        {/* Roadmap */}
        <Section title="Your Personalized Roadmap" icon={<Clock className="w-5 h-5" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "1 Month", items: analysis.roadmap?.oneMonth, color: "border-t-primary" },
              { label: "6 Months", items: analysis.roadmap?.sixMonths, color: "border-t-secondary" },
              { label: "1 Year", items: analysis.roadmap?.oneYear, color: "border-t-violet-500" },
              { label: "3 Years", items: analysis.roadmap?.threeYears, color: "border-t-pink-500" },
            ].map(({ label, items, color }) => (
              <div key={label} className={`bg-background/40 rounded-xl p-4 border-t-2 ${color}`}>
                <div className="font-bold text-sm mb-3">{label}</div>
                <ul className="space-y-2">
                  {items?.map((item, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-2">
                      <span className="text-primary flex-shrink-0 mt-0.5">›</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* Weekly Actions */}
        <Section title="What To Do This Week" icon={<Zap className="w-5 h-5" />}>
          <div className="space-y-3">
            {analysis.weeklyActions?.map((action, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-background/40 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <span className="text-sm">{action}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Skill Trees */}
        {analysis.skillTrees?.length > 0 && (
          <Section title="Skill Trees" icon={<Star className="w-5 h-5" />}>
            {analysis.skillTrees.map((tree, i) => (
              <div key={i} className="mb-6 last:mb-0">
                <div className="font-semibold text-sm mb-3 text-primary">{tree.career}</div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Foundational", skills: tree.foundational, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                    { label: "Intermediate", skills: tree.intermediate, color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
                    { label: "Advanced", skills: tree.advanced, color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
                  ].map(({ label, skills, color }) => (
                    <div key={label} className="bg-background/40 rounded-xl p-3">
                      <div className="text-xs font-medium mb-2 text-muted-foreground">{label}</div>
                      <div className="space-y-1">
                        {skills?.map((s, j) => (
                          <span key={j} className={`block text-xs px-2 py-1 rounded-md border ${color}`}>{s}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Section>
        )}

        {/* Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Section title="Free Learning Resources" icon={<BookOpen className="w-5 h-5" />}>
            <div className="space-y-3">
              {analysis.freeResources?.map((r, i) => (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-background/40 rounded-xl hover:border-primary/40 border border-transparent transition-all group"
                  data-testid={`resource-free-${i}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">{r.name}</span>
                    <Badge variant="outline" className="text-xs shrink-0">{r.type}</Badge>
                  </div>
                  {r.description && <p className="text-xs text-muted-foreground mt-1">{r.description}</p>}
                </a>
              ))}
            </div>
          </Section>

          <Section title="Paid Learning Resources" icon={<BookOpen className="w-5 h-5" />}>
            <div className="space-y-3">
              {analysis.paidResources?.map((r, i) => (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-background/40 rounded-xl hover:border-primary/40 border border-transparent transition-all group"
                  data-testid={`resource-paid-${i}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">{r.name}</span>
                    <Badge variant="outline" className="text-xs shrink-0 text-yellow-400 border-yellow-400/30">{r.type}</Badge>
                  </div>
                  {r.description && <p className="text-xs text-muted-foreground mt-1">{r.description}</p>}
                </a>
              ))}
            </div>
          </Section>
        </div>

        {/* Colleges */}
        {analysis.colleges?.length > 0 && (
          <Section title="Recommended Universities" icon={<GraduationCap className="w-5 h-5" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {analysis.colleges.map((c, i) => (
                <div key={i} className="bg-background/40 rounded-xl p-4" data-testid={`college-${i}`}>
                  <div className="font-semibold text-sm">{c.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{c.country} — {c.program}</div>
                  <div className="text-xs mt-2 flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-background border border-border">{c.tuitionRange}</span>
                    {c.scholarshipAvailable && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Scholarships available</span>
                    )}
                  </div>
                  {c.entryRequirements && (
                    <div className="text-xs text-muted-foreground mt-2">{c.entryRequirements}</div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Scholarships */}
        {analysis.scholarships?.length > 0 && (
          <Section title="Scholarships & Financial Aid" icon={<Star className="w-5 h-5" />}>
            <div className="space-y-3">
              {analysis.scholarships.map((s, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-background/40 rounded-xl" data-testid={`scholarship-${i}`}>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.provider}</div>
                    <div className="text-xs mt-1">{s.eligibility}</div>
                    {s.deadline && <div className="text-xs text-muted-foreground mt-0.5">Deadline: {s.deadline}</div>}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-emerald-400 text-sm">{s.amount}</div>
                    {s.url && (
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 block">Apply →</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Side hustles, portfolio, networking, internships */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: "Side Hustle Ideas", icon: <Zap className="w-5 h-5" />, items: analysis.sideHustleIdeas },
            { title: "Portfolio Recommendations", icon: <Star className="w-5 h-5" />, items: analysis.portfolioTips },
            { title: "Networking Advice", icon: <TrendingUp className="w-5 h-5" />, items: analysis.networkingAdvice },
            { title: "Internship Advice", icon: <BookOpen className="w-5 h-5" />, items: analysis.internshipAdvice },
          ].map(({ title, icon, items }) => (
            <Section key={title} title={title} icon={icon}>
              <ul className="space-y-2">
                {items?.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-primary flex-shrink-0">›</span> {item}
                  </li>
                ))}
              </ul>
            </Section>
          ))}
        </div>

        {/* Beginner Projects */}
        {analysis.beginnerProjects?.length > 0 && (
          <Section title="Beginner Projects to Build Now" icon={<Zap className="w-5 h-5" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {analysis.beginnerProjects.map((p, i) => (
                <div key={i} className="p-3 bg-background/40 rounded-xl border border-border text-sm">{p}</div>
              ))}
            </div>
          </Section>
        )}

        {/* Bottom CTAs */}
        <div className="flex flex-wrap gap-3 justify-center pt-4">
          <Link href="/compare"><Button variant="outline" className="gap-2">Compare Careers</Button></Link>
          <Link href="/skill-gap"><Button variant="outline" className="gap-2">Analyze Skill Gap</Button></Link>
          <Link href="/ai-future"><Button variant="outline" className="gap-2"><AlertTriangle className="w-4 h-4" /> AI Future Check</Button></Link>
          <Link href="/chat"><Button className="gap-2 bg-primary hover:bg-primary/90"><Bot className="w-4 h-4" /> Ask AI Anything</Button></Link>
        </div>
      </div>
    </div>
  );
}
