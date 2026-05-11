import { Router } from "express";
import { callGroqJson } from "../lib/groq.js";
import {
  AnalyzeCareerBody,
  CompareCareersBody,
  AnalyzeSkillGapBody,
  AnalyzeAiFutureBody,
} from "@workspace/api-zod";

const router = Router();

// POST /api/career/analyze
router.post("/analyze", async (req, res) => {
  const parsed = AnalyzeCareerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const profile = parsed.data;

  const systemPrompt = `You are an expert career counselor and labor market analyst with deep knowledge of global job markets, education systems, scholarships, and emerging technologies. You provide brutally honest, highly personalized, data-driven career guidance.

RULES:
- Never give generic advice. Every recommendation must be specific to the user's profile.
- Use realistic salary data for the user's country and region (not global averages unless relevant).
- Be honest about AI automation risks — do not sugarcoat.
- Recommend real scholarships and entrance exams that actually exist.
- Only recommend real universities and programs.
- Roadmaps must be achievable and specific — not vague platitudes.
- Do not use fake motivational language. Be direct and practical.
- Always return valid JSON matching the exact schema requested.`;

  const prompt = `Analyze the following user profile and return a comprehensive career guidance report as JSON.

USER PROFILE:
- Age: ${profile.age}
- Country: ${profile.country}
- School Level: ${profile.schoolLevel}
- Grades: ${profile.grades ?? "not specified"}
- Budget for Education: ${profile.budget ?? "not specified"}
- Can Afford College: ${profile.canAffordCollege ?? "unknown"}
- Interests: ${profile.interests?.join(", ") || "not specified"}
- Personality: ${profile.personality ?? "not specified"}
- Career Goals: ${profile.careerGoals ?? "not specified"}
- Work Type Preference: ${profile.workType ?? "not specified"} (creative/technical/business)
- Work Mode Preference: ${profile.workMode ?? "not specified"} (freelance/job/business)
- Preferred Countries to Study/Work: ${profile.preferredCountries?.join(", ") || "not specified"}
- Hobbies: ${profile.hobbies?.join(", ") || "not specified"}
- Strengths: ${profile.strengths?.join(", ") || "not specified"}
- Weaknesses: ${profile.weaknesses?.join(", ") || "not specified"}
- Dream Lifestyle: ${profile.dreamLifestyle ?? "not specified"}
- Wants Remote Work: ${profile.wantsRemote ?? "unknown"}

Return a JSON object with EXACTLY this structure (all fields required):
{
  "personalizedSummary": "A 2-3 sentence brutally honest, specific summary of this person's situation and best path forward. Reference their specific details.",
  "careers": [
    {
      "title": "Career title",
      "fitScore": 87,
      "why": "Specific 2-3 sentence explanation referencing their exact interests, strengths, and goals",
      "salaryRange": {
        "min": 45000,
        "max": 120000,
        "currency": "USD",
        "country": "${profile.country}"
      },
      "aiRisk": "low|medium|high",
      "aiRiskPercent": 25,
      "demandOutlook": "booming|growing|stable|declining",
      "topDegrees": ["Degree 1", "Degree 2"],
      "alternativePaths": ["Self-taught via X", "Bootcamp Y", "Certification Z"]
    }
  ],
  "roadmap": {
    "oneMonth": ["Specific actionable step 1", "Step 2", "Step 3"],
    "sixMonths": ["Milestone 1", "Milestone 2", "Milestone 3"],
    "oneYear": ["Goal 1", "Goal 2", "Goal 3"],
    "threeYears": ["Long-term goal 1", "Long-term goal 2"]
  },
  "weeklyActions": [
    "Specific action to take this week",
    "Another concrete step",
    "Third actionable item"
  ],
  "freeResources": [
    {
      "name": "Resource name",
      "type": "course|youtube|community|tool|book",
      "url": "https://...",
      "cost": "free",
      "description": "Why this is useful for them specifically"
    }
  ],
  "paidResources": [
    {
      "name": "Resource name",
      "type": "course|book|tool",
      "url": "https://...",
      "cost": "paid",
      "description": "Why worth paying for"
    }
  ],
  "colleges": [
    {
      "name": "University name",
      "country": "Country",
      "program": "Specific program",
      "tuitionRange": "$X,000 - $Y,000/year",
      "scholarshipAvailable": true,
      "entryRequirements": "GPA X.X, SAT/ACT score range or equivalent"
    }
  ],
  "scholarships": [
    {
      "name": "Scholarship name",
      "provider": "Organization",
      "amount": "$X,000/year",
      "eligibility": "Who qualifies",
      "deadline": "Month Year or Rolling",
      "url": "https://..."
    }
  ],
  "skillTrees": [
    {
      "career": "Career title matching one of the careers above",
      "foundational": ["Skill 1", "Skill 2", "Skill 3"],
      "intermediate": ["Skill 4", "Skill 5", "Skill 6"],
      "advanced": ["Skill 7", "Skill 8"]
    }
  ],
  "beginnerProjects": [
    "Specific project idea for their top career",
    "Another beginner project",
    "Third project"
  ],
  "sideHustleIdeas": [
    "Realistic side hustle matching their skills and interests",
    "Another side hustle idea",
    "Third option"
  ],
  "portfolioTips": [
    "Specific portfolio advice for their field",
    "What to include",
    "How to present work"
  ],
  "networkingAdvice": [
    "Specific networking advice for their field and country",
    "Where to find communities",
    "How to approach people"
  ],
  "internshipAdvice": [
    "Specific internship hunting advice for their level and country",
    "Where to look",
    "How to stand out"
  ]
}

Provide 3-5 career matches, ordered by fit score descending. Make everything specific and realistic. No vague advice.`;

  try {
    const analysis = await callGroqJson<Record<string, unknown>>(prompt, systemPrompt);
    res.json(analysis);
  } catch (err) {
    console.error({ err }, "Career analysis failed");
    res.status(500).json({ error: "Failed to generate career analysis. Please try again." });
  }
});

// POST /api/career/compare
router.post("/compare", async (req, res) => {
  const parsed = CompareCareersBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { careers, userCountry, userAge, userBudget } = parsed.data;

  const systemPrompt = `You are an expert career analyst. Compare careers with brutal honesty using real market data. Always return valid JSON.`;

  const prompt = `Compare these careers for a ${userAge ?? "young"} person in ${userCountry}${userBudget ? ` with ${userBudget} budget` : ""}: ${careers.join(", ")}.

Return JSON:
{
  "careers": [
    {
      "title": "Career title",
      "salaryRange": "$X - $Y (in ${userCountry})",
      "aiRisk": "low|medium|high (with % estimate)",
      "growthRate": "X% per year / booming / declining",
      "timeToFirstJob": "X months / X years",
      "difficulty": "easy|moderate|hard|very hard to break into",
      "pros": ["Pro 1", "Pro 2", "Pro 3"],
      "cons": ["Con 1", "Con 2", "Con 3"]
    }
  ],
  "summary": "2-3 sentence honest recommendation on which career to choose and why, based on the user's context"
}`;

  try {
    const comparison = await callGroqJson<Record<string, unknown>>(prompt, systemPrompt);
    res.json(comparison);
  } catch (err) {
    console.error({ err }, "Career comparison failed");
    res.status(500).json({ error: "Failed to generate career comparison." });
  }
});

// POST /api/career/skill-gap
router.post("/skill-gap", async (req, res) => {
  const parsed = AnalyzeSkillGapBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { targetCareer, currentSkills, userCountry } = parsed.data;

  const systemPrompt = `You are a career skills expert. Identify skill gaps with specific, actionable learning recommendations. Always return valid JSON.`;

  const prompt = `Analyze skill gap for someone wanting to become a "${targetCareer}" in ${userCountry ?? "their country"}.
Current skills: ${currentSkills.join(", ") || "none listed"}.

Return JSON:
{
  "targetCareer": "${targetCareer}",
  "missingSkills": [
    {
      "skill": "Skill name",
      "priority": "critical|important|nice-to-have",
      "resources": ["Free resource URL or name", "Paid course option"]
    }
  ],
  "learningPath": [
    "Step 1: What to learn first and why",
    "Step 2: Next milestone",
    "Step 3: When you're ready for this"
  ],
  "estimatedTimeMonths": 8
}`;

  try {
    const result = await callGroqJson<Record<string, unknown>>(prompt, systemPrompt);
    res.json(result);
  } catch (err) {
    console.error({ err }, "Skill gap analysis failed");
    res.status(500).json({ error: "Failed to analyze skill gap." });
  }
});

// POST /api/career/ai-future
router.post("/ai-future", async (req, res) => {
  const parsed = AnalyzeAiFutureBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { currentOrPlannedJob, userProfile } = parsed.data;

  const systemPrompt = `You are an AI and labor market expert. Provide honest, research-based assessments of AI automation risks and alternatives. Always return valid JSON.`;

  const prompt = `Assess AI automation risk for: "${currentOrPlannedJob}"
User context: ${userProfile.age} years old, in ${userProfile.country}, interests: ${userProfile.interests?.join(", ") || "not specified"}.

Return JSON:
{
  "automationRisk": 65,
  "alternativeCareers": [
    {
      "title": "AI-resistant alternative career",
      "fitScore": 80,
      "why": "Why this fits and is AI-resistant",
      "salaryRange": { "min": 60000, "max": 130000, "currency": "USD", "country": "${userProfile.country}" },
      "aiRisk": "low",
      "aiRiskPercent": 15,
      "demandOutlook": "growing",
      "topDegrees": ["Relevant degree"],
      "alternativePaths": ["Non-degree path"]
    }
  ],
  "futureProofSkills": [
    "Skill that AI cannot replace",
    "Creative/social/physical skill",
    "Technical skill that works with AI"
  ],
  "summary": "Honest 2-3 sentence assessment of the automation risk and what to do about it"
}`;

  try {
    const result = await callGroqJson<Record<string, unknown>>(prompt, systemPrompt);
    res.json(result);
  } catch (err) {
    console.error({ err }, "AI future analysis failed");
    res.status(500).json({ error: "Failed to analyze AI future." });
  }
});

export default router;
