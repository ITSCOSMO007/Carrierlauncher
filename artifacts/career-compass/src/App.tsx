import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Quiz from "@/pages/Quiz";
import Results from "@/pages/Results";
import Chat from "@/pages/Chat";
import Compare from "@/pages/Compare";
import SkillGap from "@/pages/SkillGap";
import AiFuture from "@/pages/AiFuture";
import Reports from "@/pages/Reports";
import { AppLayout } from "@/components/layout/AppLayout";

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/quiz" component={Quiz} />
        <Route path="/results" component={Results} />
        <Route path="/chat" component={Chat} />
        <Route path="/compare" component={Compare} />
        <Route path="/skill-gap" component={SkillGap} />
        <Route path="/ai-future" component={AiFuture} />
        <Route path="/reports" component={Reports} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;