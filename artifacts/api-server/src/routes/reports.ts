import { Router } from "express";
import { db, reportsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { SaveReportBody, GetReportParams, DeleteReportParams } from "@workspace/api-zod";

const router = Router();

// GET /api/reports
router.get("/", async (req, res) => {
  try {
    const reports = await db
      .select({
        id: reportsTable.id,
        name: reportsTable.name,
        createdAt: reportsTable.createdAt,
        analysis: reportsTable.analysis,
      })
      .from(reportsTable)
      .orderBy(desc(reportsTable.createdAt));

    const summaries = reports.map((r) => {
      const analysis = r.analysis as Record<string, unknown>;
      const careers = analysis?.careers as Array<{ title?: string }> | undefined;
      const topCareer = careers?.[0]?.title ?? "Unknown";
      return {
        id: r.id,
        name: r.name,
        createdAt: r.createdAt.toISOString(),
        topCareer,
      };
    });

    res.json(summaries);
  } catch (err) {
    req.log.error({ err }, "Failed to list reports");
    res.status(500).json({ error: "Failed to retrieve reports." });
  }
});

// POST /api/reports
router.post("/", async (req, res) => {
  const parsed = SaveReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  try {
    const [report] = await db
      .insert(reportsTable)
      .values({
        name: parsed.data.name,
        profile: parsed.data.profile as Record<string, unknown>,
        analysis: parsed.data.analysis as Record<string, unknown>,
      })
      .returning();

    res.status(201).json({
      id: report.id,
      name: report.name,
      createdAt: report.createdAt.toISOString(),
      profile: report.profile,
      analysis: report.analysis,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to save report");
    res.status(500).json({ error: "Failed to save report." });
  }
});

// GET /api/reports/:id
router.get("/:id", async (req, res) => {
  const parsed = GetReportParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid report ID" });
    return;
  }

  try {
    const [report] = await db
      .select()
      .from(reportsTable)
      .where(eq(reportsTable.id, parsed.data.id))
      .limit(1);

    if (!report) {
      res.status(404).json({ error: "Report not found" });
      return;
    }

    res.json({
      id: report.id,
      name: report.name,
      createdAt: report.createdAt.toISOString(),
      profile: report.profile,
      analysis: report.analysis,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get report");
    res.status(500).json({ error: "Failed to retrieve report." });
  }
});

// DELETE /api/reports/:id
router.delete("/:id", async (req, res) => {
  const parsed = DeleteReportParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid report ID" });
    return;
  }

  try {
    const result = await db
      .delete(reportsTable)
      .where(eq(reportsTable.id, parsed.data.id))
      .returning({ id: reportsTable.id });

    if (result.length === 0) {
      res.status(404).json({ error: "Report not found" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete report");
    res.status(500).json({ error: "Failed to delete report." });
  }
});

export default router;
