import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SoundProvider } from "@/components/SoundManager";
import SplashScreen from "@/components/SplashScreen";
import CursorTrail from "@/components/CursorTrail";
import InviteErrorBoundary from "@/invite/components/InviteErrorBoundary";
import InviteEntryRoute from "@/invite/routes/InviteEntryRoute";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Home from "./pages/Home";
import About from "./pages/About";
import Sneak from "./pages/Sneak";
import RulesAndFAQ from "./pages/RulesAndFAQ";
import Regulations from "./pages/Regulations";
import EventDetails from "./pages/EventDetails";
import DressCode from "./pages/DressCode";
import Menu from "./pages/Menu";
import RSVP from "./pages/RSVP";
import Profile from "./pages/Profile";
import Missing from "./pages/Missing";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import Games from "./pages/Games";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background bg-hero-pattern bg-cover bg-center bg-fixed px-4">
        <div className="fixed inset-0 bg-black/70" />
        <div className="relative z-10 mx-auto flex min-h-screen max-w-md items-center justify-center">
          <div className="card-shimmer w-full rounded-2xl p-8 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-gold/60">
              Invite Session
            </p>
            <h1 className="mt-3 font-display text-3xl text-gradient-gold">
              Restoring Access
            </h1>
            <p className="mt-4 text-sm text-champagne/75">
              Please wait while we restore your invite session.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");
    if (hasSeenSplash || location.pathname !== "/") {
      setShowSplash(false);
    }
  }, [location.pathname]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem("hasSeenSplash", "true");
  };

  return (
    <>
      <CursorTrail />

      <SplashScreen
        isVisible={showSplash && location.pathname === "/"}
        onComplete={handleSplashComplete}
      />

      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/invite/:entryId" element={<InviteEntryRoute />} />

        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
        <Route path="/sneak" element={<ProtectedRoute><Sneak /></ProtectedRoute>} />
        <Route path="/rules" element={<ProtectedRoute><RulesAndFAQ /></ProtectedRoute>} />
        <Route path="/faq" element={<ProtectedRoute><RulesAndFAQ /></ProtectedRoute>} />
        <Route path="/regulations" element={<ProtectedRoute><Regulations /></ProtectedRoute>} />
        <Route path="/party-details" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
        <Route path="/event-details" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
        <Route path="/dress-code" element={<ProtectedRoute><DressCode /></ProtectedRoute>} />
        <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
        <Route path="/rsvp" element={<ProtectedRoute><RSVP /></ProtectedRoute>} />
        <Route path="/games" element={<ProtectedRoute><Games /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/missing" element={<Missing />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SoundProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <InviteErrorBoundary>
              <AppContent />
            </InviteErrorBoundary>
          </TooltipProvider>
        </SoundProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
