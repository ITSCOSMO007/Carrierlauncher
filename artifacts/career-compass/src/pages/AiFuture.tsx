import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalyzeAiFuture } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Compass, ArrowRight, AlertTriangle, Shield, TrendingUp, Star } from "lucide-react";

interface AiFutureResult {
  automationRisk: number;
  alternativeCareers: Array<{
    title: string;
    fitScore: number;
    why: string;
    salaryRange: { min: number; max: number; currency: string; country: string };
    aiRisk: string;
    aiRiskPercent: number;
    demandOutlook: string;
    topDegrees: string[];
    alternativePaths: string[];
  }>;
  futureProofSkills: string[];
  summary: string;
}

function RiskGauge({ percent }: { percent: number }) {
  const color = percent < 30 ? "#34d399" : percent < 60 ? "#fbbf24" : "#f87171";
  const label = percent < 30 ? "Low Risk" : percent < 60 ? "Moderate Risk" : "High Risk";
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (percent / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 120 120" className="w-40 h-40 -rotate-90">
          <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold" style={{ color }}>{percent}%</span>
          <span className="text-xs text-muted-foreground mt-0.5">automation risk</span>
        </div>
      </div>
      <div className="font-semibold text-lg" style={{ color }}>{label}</div>
    </div>
  );
}

const DEMAND_LABELS: Record<string, string> = {
  booming: "Booming",
  growing: "Growing",
  stable: "Stable",
  declining: "Declining",
};

export default function AiFuture() {
  const [job, setJob] = useState("");
  const [country, setCountry] = useState("");
  const [age, setAge] = useState("");
  const [interests, setInterests] = useState("");
  const [result, setResult] = useState<AiFutureResult | null>(null);
  const mutation = useAnalyzeAiFuture();

  const handleAnalyze = () => {
    if (!job.trim()) return;
    mutation.mutate(
      {
        data: {
          currentOrPlannedJob: job,
          userProfile: {
            age: parseInt(age || "20", 10),
            country: country || "USA",
            schoolLevel: "high",
            interests: interests ? interests.split(",").map(s => s.trim()) : [],
          },
        },
      },
      { onSuccess: data => setResult(data as AiFutureResult) }
    );
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/"><button className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-home"><Compass className="w-5 h-5" /></button></Link>
          <div>
            <h1 className="text-2xl font-bold">AI Future Analyzer</h1>
            <p className="text-sm text-muted-foreground">Will AI replace your job? What should you do instead?</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 mb-8 space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Job or career you're considering</Label>
            <Input
              placeholder="e.g. Software Developer, Graphic Designer, Accountant..."
              value={job}
              onChange={e => setJob(e.target.value)}
              className="bg-background/50"
              data-testid="input-job"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Country</Label>
              <Input placeholder="e.g. USA" value={country} onChange={e => setCountry(e.target.value)} className="bg-background/50" data-testid="input-country" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Your age</Label>
              <Input type="number" placeholder="e.g. 18" value={age} onChange={e => setAge(e.target.value)} className="bg-background/50" data-testid="input-age" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Your interests (comma-sep)</Label>
              <Input placeholder="e.g. Design, Tech..." value={interests} onChange={e => setInterests(e.target.value)} className="bg-background/50" data-testid="input-interests" />
            </div>
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={!job.trim() || mutation.isPending}
            className="bg-primary hover:bg-primary/90 gap-2"
            data-testid="button-analyze"
          >
            {mutation.isPending ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
            ) : (
              <>Check AI Risk <ArrowRight className="w-4 h-4" /></>
            )}
          </Button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Risk Gauge */}
              <div className="glass-card rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
                <RiskGauge percent={result.automationRisk} />
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" /> Assessment for "{job}"
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{result.summary}</p>
                </div>
              </div>

              {/* Future-proof Skills */}
              {result.futureProofSkills?.length > 0 && (
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" /> Future-proof Skills to Develop
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.futureProofSkills.map((skill, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Alternative Careers */}
              {result.alternativeCareers?.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" /> AI-Resistant Alternatives
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.alternativeCareers.map((career, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="glass-card rounded-2xl p-5 space-y-3"
                        data-testid={`alt-career-${i}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold">{career.title}</h4>
                          <div className="flex gap-1 shrink-0">
                            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                              <Star className="w-2.5 h-2.5 mr-1" />{career.fitScore}%
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{career.why}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-background/40 rounded-lg p-2">
                            <div className="text-muted-foreground mb-0.5">Salary</div>
                            <div className="font-semibold">{career.salaryRange?.currency} {(career.salaryRange?.min ?? 0).toLocaleString()}–{(career.salaryRange?.max ?? 0).toLocaleString()}</div>
                          </div>
                          <div className="bg-background/40 rounded-lg p-2">
                            <div className="text-muted-foreground mb-0.5">AI Risk</div>
                            <div className={`font-semibold capitalize ${career.aiRisk === "low" ? "text-emerald-400" : career.aiRisk === "medium" ? "text-yellow-400" : "text-red-400"}`}>
                              {career.aiRisk} ({career.aiRiskPercent}%)
                            </div>
                          </div>
                        </div>
                        {career.alternativePaths?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {career.alternativePaths.slice(0, 2).map((p, j) => (
                              <span key={j} className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">{p}</span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
