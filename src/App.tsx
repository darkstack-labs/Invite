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
import { clearGuestWarning, subscribeGuestWarningByEntryId, type GuestWarningRecord } from "@/services/warningService";

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
import Games from "./pages/Games";
import Profile from "./pages/Profile";
import Missing from "./pages/Missing";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import { ensureAnonymousAuth } from "@/firebase";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const GuestWarningOverlay = () => {
  const { user } = useAuth();
  const [warning, setWarning] = useState<GuestWarningRecord | null>(null);
  const [isAcknowledging, setIsAcknowledging] = useState(false);

  useEffect(() => {
    if (!user?.entryId) {
      setWarning(null);
      return;
    }

    const unsub = subscribeGuestWarningByEntryId(user.entryId, (nextWarning) => {
      setWarning(nextWarning);
    });

    return () => {
      unsub();
    };
  }, [user?.entryId]);

  const activeWarning = warning?.isActive ? warning : null;

  const handleAcknowledge = async () => {
    if (!user?.entryId || !activeWarning) return;
    setIsAcknowledging(true);
    try {
      await clearGuestWarning({ entryId: user.entryId, acknowledgedByEntryId: user.entryId });
    } finally {
      setIsAcknowledging(false);
    }
  };

  if (!activeWarning) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl border border-red-500/80 rounded-2xl bg-gradient-to-b from-red-950 to-black shadow-2xl p-5 md:p-7">
        <p className="text-red-300 text-xs md:text-sm uppercase tracking-[0.2em] font-semibold">
          Account Compliance Notice
        </p>
        <h2 className="mt-2 text-red-100 text-xl md:text-2xl font-bold">
          Final Warning
        </h2>
        <p className="mt-4 text-red-100/95 text-sm md:text-base leading-relaxed font-medium bg-red-900/40 border border-red-400/40 rounded-xl p-4">
          {activeWarning.message}
        </p>
        <button
          type="button"
          onClick={() => void handleAcknowledge()}
          disabled={isAcknowledging}
          className="mt-5 w-full rounded-xl px-4 py-3 font-semibold text-black bg-red-300 hover:bg-red-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isAcknowledging ? "Acknowledging..." : "I Understand And Acknowledge"}
        </button>
      </div>
    </div>
  );
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
      <GuestWarningOverlay />

      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />

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

const App = () => {
  useEffect(() => {
    ensureAnonymousAuth().catch((error) => {
      console.error("Anonymous Firebase auth failed:", error);
    });
  }, []);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SoundProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AppContent />
            </TooltipProvider>
          </SoundProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
