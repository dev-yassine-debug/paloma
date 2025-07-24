
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { navItems } from "./nav-items";
import AdminLayout from "./layouts/AdminLayout";
import AdminLogin from "./pages/AdminLogin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* Route de connexion admin - separate from protected routes */}
          <Route path="/admin-login" element={<AdminLogin />} />
          
          {/* Routes admin protégées */}
          <Route path="/admin/*" element={<AdminLayout />}>
            {navItems
              .filter(item => item.to.startsWith('/admin/'))
              .map(({ to, page }) => (
                <Route key={to} path={to.replace('/admin/', '')} element={page} />
              ))
            }
          </Route>
          
          {/* Routes publiques */}
          {navItems
            .filter(item => !item.to.startsWith('/admin'))
            .map(({ to, page }) => (
              <Route key={to} path={to} element={page} />
            ))
          }
          
          {/* Redirection par défaut */}
          <Route path="/" element={<Navigate to="/admin-login" />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
