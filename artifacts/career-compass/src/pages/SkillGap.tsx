import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalyzeSkillGap } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Compass, Plus, X, ArrowRight, AlertTriangle, CheckCircle, Clock } from "lucide-react";

const PRIORITY_STYLES: Record<string, { badge: string; dot: string }> = {
  critical: { badge: "bg-red-500/10 text-red-400 border-red-500/20", dot: "bg-red-400" },
  important: { badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", dot: "bg-yellow-400" },
  "nice-to-have": { badge: "bg-blue-500/10 text-blue-400 border-blue-500/20", dot: "bg-blue-400" },
};

interface SkillGapResult {
  targetCareer: string;
  missingSkills: Array<{ skill: string; priority: string; resources: string[] }>;
  learningPath: string[];
  estimatedTimeMonths: number;
}

export default function SkillGap() {
  const [targetCareer, setTargetCareer] = useState("");
  const [country, setCountry] = useState("");
  const [currentSkills, setCurrentSkills] = useState<string[]>([""]);
  const [result, setResult] = useState<SkillGapResult | null>(null);
  const mutation = useAnalyzeSkillGap();

  const updateSkill = (i: number, val: string) =>
    setCurrentSkills(p => p.map((s, idx) => (idx === i ? val : s)));
  const addSkill = () => setCurrentSkills(p => [...p, ""]);
  const removeSkill = (i: number) => setCurrentSkills(p => p.filter((_, idx) => idx !== i));

  const handleAnalyze = () => {
    if (!targetCareer.trim()) return;
    const skills = currentSkills.filter(s => s.trim());
    mutation.mutate(
      { data: { targetCareer, currentSkills: skills, userCountry: country || undefined } },
      { onSuccess: data => setResult(data as SkillGapResult) }
    );
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/"><button className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-home"><Compass className="w-5 h-5" /></button></Link>
          <div>
            <h1 className="text-2xl font-bold">Skill Gap Analyzer</h1>
            <p className="text-sm text-muted-foreground">Find exactly what you need to learn to get there</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 mb-8 space-y-5">
          <div>
            <Label className="text-sm font-medium mb-2 block">Target career</Label>
            <Input
              placeholder="e.g. Machine Learning Engineer, UX Designer, Financial Analyst..."
              value={targetCareer}
              onChange={e => setTargetCareer(e.target.value)}
              className="bg-background/50"
              data-testid="input-target-career"
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">Your country</Label>
            <Input
              placeholder="e.g. India, USA, UK..."
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="bg-background/50"
              data-testid="input-country"
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">Skills you already have</Label>
            <div className="space-y-2">
              {currentSkills.map((skill, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder={`Skill ${i + 1}, e.g. Python, Figma, Excel...`}
                    value={skill}
                    onChange={e => updateSkill(i, e.target.value)}
                    className="bg-background/50"
                    data-testid={`input-skill-${i}`}
                  />
                  {currentSkills.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeSkill(i)} className="text-muted-foreground hover:text-destructive flex-shrink-0">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={addSkill} className="gap-2 text-muted-foreground" data-testid="button-add-skill">
                <Plus className="w-4 h-4" /> Add skill
              </Button>
            </div>
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={!targetCareer.trim() || mutation.isPending}
            className="bg-primary hover:bg-primary/90 gap-2"
            data-testid="button-analyze"
          >
            {mutation.isPending ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
            ) : (
              <>Analyze Gap <ArrowRight className="w-4 h-4" /></>
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
              {/* Time estimate */}
              <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Estimated time to reach {result.targetCareer}</div>
                  <div className="text-2xl font-bold">{result.estimatedTimeMonths} months</div>
                  <div className="text-xs text-muted-foreground">with consistent effort</div>
                </div>
              </div>

              {/* Missing Skills */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-400" /> Missing Skills</h3>
                <div className="space-y-3">
                  {result.missingSkills?.map((skill, i) => {
                    const styles = PRIORITY_STYLES[skill.priority] ?? PRIORITY_STYLES["nice-to-have"];
                    return (
                      <div key={i} className="bg-background/40 rounded-xl p-4" data-testid={`skill-gap-${i}`}>
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${styles.dot}`} />
                            <span className="font-medium text-sm">{skill.skill}</span>
                          </div>
                          <Badge variant="outline" className={`text-xs capitalize ${styles.badge}`}>{skill.priority}</Badge>
                        </div>
                        {skill.resources?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {skill.resources.map((r, j) => (
                              <span key={j} className="text-xs px-2 py-0.5 rounded-full bg-background border border-border text-muted-foreground">{r}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Learning Path */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Your Learning Path</h3>
                <div className="space-y-3">
                  {result.learningPath?.map((step, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
