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
import AdminFleet from "@/pages/admin/AdminFleet";
import AdminTelemetry from "@/pages/admin/AdminTelemetry";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/routes" element={<RoutesSchedules />} />
          <Route path="/login" element={<Auth />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          >
            <Route index element={<Navigate to="/admin/overview" replace />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="fleet" element={<AdminFleet />} />
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
          <Route 
            path="/passenger" 
            element={
              <ProtectedRoute allowedRole="passenger">
                <PassengerDashboard />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
