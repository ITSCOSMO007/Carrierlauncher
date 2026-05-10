import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useCompareCareers } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Compass, Plus, X, ArrowRight, TrendingUp, AlertTriangle, Clock, Zap } from "lucide-react";

interface CareerCard {
  title: string;
  salaryRange: string;
  aiRisk: string;
  growthRate: string;
  timeToFirstJob: string;
  difficulty: string;
  pros: string[];
  cons: string[];
}

const RISK_STYLES: Record<string, string> = {
  low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  high: "bg-red-500/10 text-red-400 border-red-500/20",
};

const DIFF_STYLES: Record<string, string> = {
  easy: "text-emerald-400",
  moderate: "text-yellow-400",
  hard: "text-orange-400",
  "very hard": "text-red-400",
};

export default function Compare() {
  const [careers, setCareers] = useState<string[]>(["", ""]);
  const [country, setCountry] = useState("");
  const [result, setResult] = useState<{ careers: CareerCard[]; summary: string } | null>(null);
  const compareMutation = useCompareCareers();

  const addCareer = () => careers.length < 4 && setCareers(p => [...p, ""]);
  const removeCareer = (i: number) => setCareers(p => p.filter((_, idx) => idx !== i));
  const updateCareer = (i: number, val: string) =>
    setCareers(p => p.map((c, idx) => (idx === i ? val : c)));

  const handleCompare = () => {
    const filtered = careers.filter(c => c.trim());
    if (filtered.length < 2) return;
    compareMutation.mutate(
      { data: { careers: filtered, userCountry: country || "USA" } },
      { onSuccess: (data) => setResult(data as typeof result) }
    );
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/"><button className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-home"><Compass className="w-5 h-5" /></button></Link>
          <div>
            <h1 className="text-2xl font-bold">Career Comparison</h1>
            <p className="text-sm text-muted-foreground">Side-by-side analysis of career paths</p>
          </div>
        </div>

        {/* Input */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Careers to compare (2–4)</Label>
              <div className="space-y-2">
                {careers.map((c, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder={`Career ${i + 1}, e.g. Software Engineer`}
                      value={c}
                      onChange={e => updateCareer(i, e.target.value)}
                      className="bg-background/50"
                      data-testid={`input-career-${i}`}
                    />
                    {careers.length > 2 && (
                      <Button variant="ghost" size="icon" onClick={() => removeCareer(i)} className="flex-shrink-0 text-muted-foreground hover:text-destructive">
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {careers.length < 4 && (
                <Button variant="ghost" size="sm" onClick={addCareer} className="mt-2 gap-2 text-muted-foreground" data-testid="button-add-career">
                  <Plus className="w-4 h-4" /> Add another career
                </Button>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Your country (for salary data)</Label>
              <Input
                placeholder="e.g. USA, India, UK..."
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="bg-background/50"
                data-testid="input-country"
              />
            </div>
            <Button
              onClick={handleCompare}
              disabled={careers.filter(c => c.trim()).length < 2 || compareMutation.isPending}
              className="bg-primary hover:bg-primary/90 gap-2"
              data-testid="button-compare"
            >
              {compareMutation.isPending ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Comparing...</>
              ) : (
                <>Compare Careers <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Summary */}
              <div className="glass-card rounded-2xl p-5 border-l-4 border-l-primary">
                <h3 className="font-bold mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> AI Verdict</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
              </div>

              {/* Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.careers?.map((career, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="glass-card rounded-2xl p-5 space-y-4"
                    data-testid={`compare-card-${i}`}
                  >
                    <h3 className="font-bold text-lg">{career.title}</h3>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-background/40 rounded-xl p-3">
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Salary</div>
                        <div className="font-semibold text-xs">{career.salaryRange}</div>
                      </div>
                      <div className="bg-background/40 rounded-xl p-3">
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> First Job</div>
                        <div className="font-semibold text-xs">{career.timeToFirstJob}</div>
                      </div>
                      <div className="bg-background/40 rounded-xl p-3">
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Growth</div>
                        <div className="font-semibold text-xs">{career.growthRate}</div>
                      </div>
                      <div className="bg-background/40 rounded-xl p-3">
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> AI Risk</div>
                        <Badge variant="outline" className={`text-xs capitalize ${RISK_STYLES[career.aiRisk] ?? ""}`}>{career.aiRisk}</Badge>
                      </div>
                    </div>

                    {career.difficulty && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Difficulty to break in: </span>
                        <span className={`font-semibold capitalize ${DIFF_STYLES[career.difficulty.toLowerCase()] ?? ""}`}>{career.difficulty}</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-medium text-emerald-400 mb-1.5">Pros</div>
                        <ul className="space-y-1">
                          {career.pros?.map((p, j) => (
                            <li key={j} className="text-xs text-muted-foreground flex gap-1.5">
                              <span className="text-emerald-400 flex-shrink-0">+</span>{p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-red-400 mb-1.5">Cons</div>
                        <ul className="space-y-1">
                          {career.cons?.map((c, j) => (
                            <li key={j} className="text-xs text-muted-foreground flex gap-1.5">
                              <span className="text-red-400 flex-shrink-0">−</span>{c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
