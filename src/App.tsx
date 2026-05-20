import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import RoutesSchedules from "@/pages/RoutesSchedules";
import Auth from "@/pages/Auth";
import AdminDashboard from "@/pages/AdminDashboard";
import DriverDashboard from "@/pages/DriverDashboard";
import PassengerDashboard from "@/pages/PassengerDashboard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "@/pages/NotFound";
import { Navigate } from "react-router-dom";
import AdminOverview from "@/pages/admin/AdminOverview";
import AdminRoutes from "./pages/admin/AdminRoutes";
import AdminFleet from "@/pages/admin/AdminFleet";
import AdminDrivers from "@/pages/admin/AdminDrivers";
import AdminTelemetry from "@/pages/admin/AdminTelemetry";

import { ChatWidget } from "@/components/ChatWidget";
import { DemoProvider } from "@/lib/DemoContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ErrorBoundary>
        <Toaster />
        <Sonner />
        <DemoProvider>
          <BrowserRouter>
            <ChatWidget />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/routes" element={<RoutesSchedules />} />
              <Route path="/login" element={<Auth />} />
              <Route 
                path="/control" 
                element={
                  <ProtectedRoute allowedRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              >
                <Route index element={<Navigate to="/control/overview" replace />} />
                <Route path="overview" element={<AdminOverview />} />
                <Route path="routes" element={<AdminRoutes />} />
                <Route path="fleet" element={<AdminFleet />} />
                <Route path="drivers" element={<AdminDrivers />} />
                <Route path="telemetry" element={<AdminTelemetry />} />
              </Route>
              <Route 
                path="/driver" 
                element={
                  <ProtectedRoute allowedRole="driver">
                    <DriverDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/passenger" element={<PassengerDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DemoProvider>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
