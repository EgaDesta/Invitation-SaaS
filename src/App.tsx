import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateInvitation from "./pages/CreateInvitation";
import MyInvitations from "./pages/MyInvitations";
import GuestManager from "./pages/GuestManager";
import Subscription from "./pages/Subscription";
import InvitationView from "./pages/InvitationView";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminTemplates from "./pages/AdminTemplates";
import AdminTransactions from "./pages/AdminTransactions";
import Demo from "./pages/Demo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<ErrorBoundary><Landing /></ErrorBoundary>} />
              <Route path="/auth" element={<ErrorBoundary><Auth /></ErrorBoundary>} />
              <Route path="/demo" element={<ErrorBoundary><Demo /></ErrorBoundary>} />
              <Route path="/dashboard" element={<ErrorBoundary><ProtectedRoute><Dashboard /></ProtectedRoute></ErrorBoundary>} />
              <Route path="/dashboard/create" element={<ErrorBoundary><ProtectedRoute><CreateInvitation /></ProtectedRoute></ErrorBoundary>} />
              <Route path="/dashboard/invitations" element={<ErrorBoundary><ProtectedRoute><MyInvitations /></ProtectedRoute></ErrorBoundary>} />
              <Route path="/dashboard/invitations/:id/guests" element={<ErrorBoundary><ProtectedRoute><GuestManager /></ProtectedRoute></ErrorBoundary>} />
              <Route path="/dashboard/subscription" element={<ErrorBoundary><ProtectedRoute><Subscription /></ProtectedRoute></ErrorBoundary>} />
              <Route path="/invite/:slug" element={<ErrorBoundary><InvitationView /></ErrorBoundary>} />
              <Route path="/admin" element={<ErrorBoundary><ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute></ErrorBoundary>} />
              <Route path="/admin/users" element={<ErrorBoundary><ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute></ErrorBoundary>} />
              <Route path="/admin/templates" element={<ErrorBoundary><ProtectedRoute adminOnly><AdminTemplates /></ProtectedRoute></ErrorBoundary>} />
              <Route path="/admin/transactions" element={<ErrorBoundary><ProtectedRoute adminOnly><AdminTransactions /></ProtectedRoute></ErrorBoundary>} />
              <Route path="*" element={<ErrorBoundary><NotFound /></ErrorBoundary>} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;