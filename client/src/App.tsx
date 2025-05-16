import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Timer from "@/pages/timer";
import Tasks from "@/pages/tasks";
import Stats from "@/pages/stats";
import Settings from "@/pages/settings";
import BottomNav from "@/components/bottom-nav";
import { ThemeProvider } from "next-themes";

function Router() {
  return (
    <Switch>
      {/* Main pages */}
      <Route path="/" component={Timer} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/stats" component={Stats} />
      <Route path="/settings" component={Settings} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <div className="flex flex-col min-h-screen max-w-lg mx-auto px-4 pb-20">
            <Router />
            <BottomNav />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
