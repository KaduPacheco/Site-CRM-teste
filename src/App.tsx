import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import { TooltipProvider } from "./components/ui/Tooltip";
import { Toaster } from "./components/ui/Toaster";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";

// Rotas CRM (Isoladas)
import CrmLayout from "./components/layout/CrmLayout";
import DashboardPage from "./pages/crm/DashboardPage";
import LoginPage from "./pages/crm/LoginPage";
import LeadsPage from "./pages/crm/LeadsPage";
import LeadDetailPage from "./pages/crm/LeadDetailPage";

import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing Page Pública (Sem peso de Auth) */}
            <Route path="/" element={<HomePage />} />
            
            {/* Contexto de CRM (Isolado) */}
            <Route path="/crm">
              <Route element={<AuthProvider children={<Outlet />} />}>
                <Route path="login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<CrmLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="leads" element={<LeadsPage />} />
                    <Route path="leads/:id" element={<LeadDetailPage />} />
                  </Route>
                </Route>
              </Route>
            </Route>

            {/* Rota não encontrada global */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;