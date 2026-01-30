import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import BadgeSelector from "@/pages/badge-selector";
import NotFound from "@/pages/not-found";
import DataSources from "@/pages/data-sources";  

function Router() {
  return (
    <Switch>
      <Route path="/" component={BadgeSelector} />
      <Route path="/badge" component={BadgeSelector} />
      <Route path="/badges" component={BadgeSelector} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/data-sources" component={DataSources} />  {/* ADD THIS LINE */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
