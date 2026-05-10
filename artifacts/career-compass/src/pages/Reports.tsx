import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useListReports, useGetReport, useDeleteReport, getListReportsQueryKey, getGetReportQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Compass, FileText, Trash2, ChevronRight, ArrowLeft, Calendar, Target, ExternalLink } from "lucide-react";

export default function Reports() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useListReports();
  const { data: report, isLoading: reportLoading } = useGetReport(
    selectedId!,
    { query: { enabled: !!selectedId, queryKey: getGetReportQueryKey(selectedId!) } }
  );
  const deleteReport = useDeleteReport();

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this report?")) return;
    await deleteReport.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
    if (selectedId === id) setSelectedId(null);
  };

  const handleViewFull = () => {
    if (!report) return;
    sessionStorage.setItem("careerAnalysis", JSON.stringify((report as { analysis: unknown }).analysis));
    sessionStorage.setItem("userProfile", JSON.stringify((report as { profile: unknown }).profile));
    setLocation("/results");
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/"><button className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-home"><Compass className="w-5 h-5" /></button></Link>
          <div>
            <h1 className="text-2xl font-bold">Saved Reports</h1>
            <p className="text-sm text-muted-foreground">Your career analysis history</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* List */}
          <div className="md:col-span-1 space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))
            ) : !reports?.length ? (
              <div className="glass-card rounded-2xl p-8 text-center">
                <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No saved reports yet.</p>
                <Link href="/quiz">
                  <Button size="sm" className="mt-4 bg-primary hover:bg-primary/90" data-testid="link-start-quiz">
                    Start Analysis
                  </Button>
                </Link>
              </div>
            ) : (
              reports.map(r => (
                <motion.button
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`w-full text-left p-4 rounded-xl border transition-all group ${selectedId === r.id ? "border-primary bg-primary/10" : "border-border glass-card hover:border-primary/40"}`}
                  data-testid={`report-${r.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{r.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Target className="w-3 h-3" /> {r.topCareer}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={e => handleDelete(r.id, e)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                        data-testid={`delete-report-${r.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </div>

          {/* Detail */}
          <div className="md:col-span-2">
            <AnimatePresence mode="wait">
              {!selectedId ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center h-full"
                >
                  <FileText className="w-12 h-12 text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground text-sm">Select a report to view details</p>
                </motion.div>
              ) : reportLoading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-6 space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
                </motion.div>
              ) : report ? (
                <motion.div
                  key={selectedId}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card rounded-2xl p-6 space-y-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-xl">{(report as { name: string }).name}</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {new Date((report as { createdAt: string }).createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    </div>
                    <Button size="sm" onClick={handleViewFull} className="gap-2 bg-primary hover:bg-primary/90" data-testid="button-view-full">
                      <ExternalLink className="w-3.5 h-3.5" /> Full Report
                    </Button>
                  </div>

                  {(() => {
                    const analysis = (report as { analysis: { personalizedSummary?: string; careers?: Array<{ title: string; fitScore: number; aiRiskPercent: number; aiRisk: string; salaryRange: { min: number; max: number; currency: string } }> } }).analysis;
                    return (
                      <>
                        {analysis?.personalizedSummary && (
                          <div className="p-4 rounded-xl bg-background/40 border-l-2 border-l-primary">
                            <p className="text-sm text-muted-foreground leading-relaxed">{analysis.personalizedSummary}</p>
                          </div>
                        )}
                        {analysis?.careers?.length && (
                          <div>
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Top Career Matches</div>
                            <div className="space-y-2">
                              {analysis.careers.map((c, i) => (
                                <div key={i} className="flex items-center justify-between gap-3 p-3 bg-background/40 rounded-xl">
                                  <div>
                                    <div className="font-medium text-sm">{c.title}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                      {c.salaryRange?.currency} {(c.salaryRange?.min ?? 0).toLocaleString()}–{(c.salaryRange?.max ?? 0).toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <div className="text-sm font-bold text-primary">{c.fitScore}%</div>
                                    <div className={`text-xs capitalize ${c.aiRisk === "low" ? "text-emerald-400" : c.aiRisk === "medium" ? "text-yellow-400" : "text-red-400"}`}>
                                      AI: {c.aiRisk}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
