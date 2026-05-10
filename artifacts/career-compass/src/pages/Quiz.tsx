import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Compass, Check } from "lucide-react";

const INTEREST_TAGS = [
  "Programming","Web Development","Mobile Apps","AI/Machine Learning","Data Science","Cybersecurity","Game Development","Robotics","Electronics","Networking",
  "Graphic Design","UI/UX Design","Animation","Video Editing","Photography","Music Production","Writing","Journalism","Teaching","Psychology",
  "Business","Marketing","Finance","Accounting","Entrepreneurship","Law","Medicine","Nursing","Pharmacy","Dentistry",
  "Architecture","Civil Engineering","Mechanical Engineering","Electrical Engineering","Chemical Engineering","Aerospace","Biology","Chemistry","Physics","Environmental Science",
  "Cooking/Culinary","Fashion","Sports","Fitness","Agriculture","Automotive","Real Estate","Event Planning","Social Work","Research",
];

const PERSONALITY_OPTIONS = [
  { value: "introvert-analytical", label: "Introvert & Analytical", desc: "Prefer working alone, data-driven thinking" },
  { value: "introvert-creative", label: "Introvert & Creative", desc: "Prefer working alone, artistic expression" },
  { value: "extrovert-leader", label: "Extrovert & Leader", desc: "Energized by people, like being in charge" },
  { value: "extrovert-collaborator", label: "Extrovert & Collaborator", desc: "Energized by people, prefer teamwork" },
  { value: "ambivert-versatile", label: "Ambivert & Versatile", desc: "Balance of both, adaptable to situations" },
];

const SCHOOL_LEVELS = ["middle", "high", "college", "graduate", "working"];
const WORK_TYPES = ["technical", "creative", "business", "mixed"];
const WORK_MODES = ["job", "freelance", "business", "undecided"];
const GRADE_OPTIONS = ["excellent", "good", "average", "poor"];
const BUDGET_OPTIONS = [
  { value: "low", label: "Low — under $10k/year" },
  { value: "medium", label: "Medium — $10k–$40k/year" },
  { value: "high", label: "High — $40k+/year" },
];

interface ProfileState {
  age: string;
  country: string;
  schoolLevel: string;
  grades: string;
  budget: string;
  canAffordCollege: boolean | null;
  interests: string[];
  customInterests: string;
  personality: string;
  careerGoals: string;
  workType: string;
  workMode: string;
  preferredCountries: string;
  hobbies: string;
  strengths: string;
  weaknesses: string;
  dreamLifestyle: string;
  wantsRemote: boolean | null;
}

const STEPS = ["About You", "Education", "Interests", "Work Style", "Goals & Lifestyle"];

export default function Quiz() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<ProfileState>({
    age: "", country: "", schoolLevel: "", grades: "", budget: "",
    canAffordCollege: null, interests: [], customInterests: "",
    personality: "", careerGoals: "", workType: "", workMode: "",
    preferredCountries: "", hobbies: "", strengths: "", weaknesses: "",
    dreamLifestyle: "", wantsRemote: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const toggleInterest = (tag: string) => {
    setProfile(p => ({
      ...p,
      interests: p.interests.includes(tag)
        ? p.interests.filter(i => i !== tag)
        : [...p.interests, tag],
    }));
  };

  const update = (key: keyof ProfileState, val: unknown) =>
    setProfile(p => ({ ...p, [key]: val }));

  const canNext = () => {
    if (step === 0) return profile.age && profile.country;
    if (step === 1) return profile.schoolLevel;
    if (step === 2) return profile.interests.length > 0 || profile.customInterests.trim();
    if (step === 3) return profile.workType && profile.workMode;
    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const payload = {
        age: parseInt(profile.age, 10),
        country: profile.country,
        schoolLevel: profile.schoolLevel,
        grades: profile.grades || undefined,
        budget: profile.budget || undefined,
        canAffordCollege: profile.canAffordCollege ?? undefined,
        interests: [
          ...profile.interests,
          ...profile.customInterests.split(",").map(s => s.trim()).filter(Boolean),
        ],
        personality: profile.personality || undefined,
        careerGoals: profile.careerGoals || undefined,
        workType: profile.workType || undefined,
        workMode: profile.workMode || undefined,
        preferredCountries: profile.preferredCountries
          ? profile.preferredCountries.split(",").map(s => s.trim()).filter(Boolean)
          : undefined,
        hobbies: profile.hobbies
          ? profile.hobbies.split(",").map(s => s.trim()).filter(Boolean)
          : undefined,
        strengths: profile.strengths
          ? profile.strengths.split(",").map(s => s.trim()).filter(Boolean)
          : undefined,
        weaknesses: profile.weaknesses
          ? profile.weaknesses.split(",").map(s => s.trim()).filter(Boolean)
          : undefined,
        dreamLifestyle: profile.dreamLifestyle || undefined,
        wantsRemote: profile.wantsRemote ?? undefined,
      };

      const res = await fetch("/api/career/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Analysis failed" }));
        throw new Error(err.error || "Analysis failed");
      }

      const analysis = await res.json();
      sessionStorage.setItem("careerAnalysis", JSON.stringify(analysis));
      sessionStorage.setItem("userProfile", JSON.stringify(payload));
      setLocation("/results");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-2xl mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-primary" />
          <span className="font-bold tracking-tight">CareerCompass AI</span>
        </div>
        <span className="text-sm text-muted-foreground">{step + 1} of {STEPS.length}</span>
      </div>

      {/* Progress */}
      <div className="w-full max-w-2xl mb-2">
        <Progress value={progress} className="h-1" />
      </div>
      <div className="w-full max-w-2xl mb-8 flex gap-2">
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={`text-xs font-medium transition-colors flex-1 text-center ${i === step ? "text-primary" : i < step ? "text-muted-foreground line-through" : "text-muted-foreground/40"}`}
          >
            {s}
          </span>
        ))}
      </div>

      {/* Step Card */}
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="glass-card rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold mb-1">{STEPS[step]}</h2>
            <p className="text-muted-foreground text-sm mb-8">
              {step === 0 && "Basic info so we can personalize your results."}
              {step === 1 && "Your education context shapes your roadmap."}
              {step === 2 && "Select everything that genuinely interests you."}
              {step === 3 && "How do you want to work?"}
              {step === 4 && "The more specific, the better your results."}
            </p>

            {/* Step 0: About You */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Age</Label>
                  <Input
                    type="number"
                    min={13}
                    max={35}
                    placeholder="e.g. 17"
                    value={profile.age}
                    onChange={e => update("age", e.target.value)}
                    className="bg-background/50"
                    data-testid="input-age"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Country</Label>
                  <Input
                    placeholder="e.g. India, USA, Nigeria, UK..."
                    value={profile.country}
                    onChange={e => update("country", e.target.value)}
                    className="bg-background/50"
                    data-testid="input-country"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Personality Type</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {PERSONALITY_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => update("personality", opt.value)}
                        className={`text-left px-4 py-3 rounded-xl border transition-all ${profile.personality === opt.value ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background/30 text-muted-foreground hover:border-primary/50"}`}
                        data-testid={`personality-${opt.value}`}
                      >
                        <div className="font-medium text-sm">{opt.label}</div>
                        <div className="text-xs opacity-70 mt-0.5">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Education */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Current School Level</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SCHOOL_LEVELS.map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => update("schoolLevel", lvl)}
                        className={`px-4 py-2 rounded-xl border capitalize text-sm font-medium transition-all ${profile.schoolLevel === lvl ? "border-primary bg-primary/10 text-primary" : "border-border bg-background/30 text-muted-foreground hover:border-primary/50"}`}
                        data-testid={`school-${lvl}`}
                      >
                        {lvl === "working" ? "Already Working" : `${lvl} School`}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Grade Performance</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {GRADE_OPTIONS.map(g => (
                      <button
                        key={g}
                        onClick={() => update("grades", g)}
                        className={`px-4 py-2 rounded-xl border capitalize text-sm font-medium transition-all ${profile.grades === g ? "border-primary bg-primary/10 text-primary" : "border-border bg-background/30 text-muted-foreground hover:border-primary/50"}`}
                        data-testid={`grades-${g}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Education Budget</Label>
                  <div className="space-y-2">
                    {BUDGET_OPTIONS.map(b => (
                      <button
                        key={b.value}
                        onClick={() => update("budget", b.value)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${profile.budget === b.value ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background/30 text-muted-foreground hover:border-primary/50"}`}
                        data-testid={`budget-${b.value}`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-3 block">Can you afford college?</Label>
                  <div className="flex gap-3">
                    {[{ v: true, l: "Yes" }, { v: false, l: "No" }].map(o => (
                      <button
                        key={String(o.v)}
                        onClick={() => update("canAffordCollege", o.v)}
                        className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${profile.canAffordCollege === o.v ? "border-primary bg-primary/10 text-primary" : "border-border bg-background/30 text-muted-foreground hover:border-primary/50"}`}
                        data-testid={`college-${o.l.toLowerCase()}`}
                      >
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Interests */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Select your interests <span className="text-muted-foreground">({profile.interests.length} selected)</span></Label>
                  <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-1">
                    {INTEREST_TAGS.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleInterest(tag)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all flex items-center gap-1 ${profile.interests.includes(tag) ? "border-primary bg-primary/15 text-primary" : "border-border bg-background/30 text-muted-foreground hover:border-primary/50"}`}
                        data-testid={`interest-${tag.replace(/\//g, "-")}`}
                      >
                        {profile.interests.includes(tag) && <Check className="w-3 h-3" />}
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Other interests not listed above</Label>
                  <Input
                    placeholder="e.g. Astronomy, Blockchain, Beekeeping..."
                    value={profile.customInterests}
                    onChange={e => update("customInterests", e.target.value)}
                    className="bg-background/50"
                    data-testid="input-custom-interests"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Hobbies (comma-separated)</Label>
                  <Input
                    placeholder="e.g. Drawing, gaming, hiking, reading..."
                    value={profile.hobbies}
                    onChange={e => update("hobbies", e.target.value)}
                    className="bg-background/50"
                    data-testid="input-hobbies"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Work Style */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Type of work you prefer</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {WORK_TYPES.map(t => (
                      <button
                        key={t}
                        onClick={() => update("workType", t)}
                        className={`px-4 py-3 rounded-xl border capitalize text-sm font-medium transition-all ${profile.workType === t ? "border-primary bg-primary/10 text-primary" : "border-border bg-background/30 text-muted-foreground hover:border-primary/50"}`}
                        data-testid={`worktype-${t}`}
                      >
                        {t === "mixed" ? "Mixed / Hybrid" : t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-3 block">How do you want to earn?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {WORK_MODES.map(m => (
                      <button
                        key={m}
                        onClick={() => update("workMode", m)}
                        className={`px-4 py-3 rounded-xl border capitalize text-sm font-medium transition-all ${profile.workMode === m ? "border-primary bg-primary/10 text-primary" : "border-border bg-background/30 text-muted-foreground hover:border-primary/50"}`}
                        data-testid={`workmode-${m}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-3 block">Remote work preference</Label>
                  <div className="flex gap-3">
                    {[{ v: true, l: "Remote / hybrid" }, { v: false, l: "In-person is fine" }].map(o => (
                      <button
                        key={String(o.v)}
                        onClick={() => update("wantsRemote", o.v)}
                        className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${profile.wantsRemote === o.v ? "border-primary bg-primary/10 text-primary" : "border-border bg-background/30 text-muted-foreground hover:border-primary/50"}`}
                        data-testid={`remote-${o.v}`}
                      >
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Goals & Lifestyle */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Career goals — what do you want to achieve?</Label>
                  <Textarea
                    placeholder="e.g. I want to build products that help people, work at a startup, eventually start my own company..."
                    value={profile.careerGoals}
                    onChange={e => update("careerGoals", e.target.value)}
                    className="bg-background/50 resize-none"
                    rows={3}
                    data-testid="input-career-goals"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Dream lifestyle</Label>
                  <Textarea
                    placeholder="e.g. Working from anywhere, earning $100k+, having flexible hours, living in Europe..."
                    value={profile.dreamLifestyle}
                    onChange={e => update("dreamLifestyle", e.target.value)}
                    className="bg-background/50 resize-none"
                    rows={3}
                    data-testid="input-dream-lifestyle"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Your strengths (comma-separated)</Label>
                  <Input
                    placeholder="e.g. Problem solving, communication, learning fast..."
                    value={profile.strengths}
                    onChange={e => update("strengths", e.target.value)}
                    className="bg-background/50"
                    data-testid="input-strengths"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Your weaknesses (comma-separated)</Label>
                  <Input
                    placeholder="e.g. Procrastination, public speaking, math..."
                    value={profile.weaknesses}
                    onChange={e => update("weaknesses", e.target.value)}
                    className="bg-background/50"
                    data-testid="input-weaknesses"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Countries you'd consider working/studying in</Label>
                  <Input
                    placeholder="e.g. USA, Germany, Canada, or just my own country..."
                    value={profile.preferredCountries}
                    onChange={e => update("preferredCountries", e.target.value)}
                    className="bg-background/50"
                    data-testid="input-preferred-countries"
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 gap-4">
          <Button
            variant="outline"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="gap-2"
            data-testid="button-prev"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="gap-2 bg-primary hover:bg-primary/90"
              data-testid="button-next"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="gap-2 bg-primary hover:bg-primary/90 min-w-40"
              data-testid="button-analyze"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>Analyze My Career <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          )}
        </div>

        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-xl glass-card text-center"
          >
            <div className="text-sm text-muted-foreground mb-1">AI is analyzing your profile...</div>
            <div className="text-xs text-muted-foreground/70">This takes 10–20 seconds. We're building your full roadmap.</div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
