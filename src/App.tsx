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
import { ensureAnonymousAuth } from "@/firebase";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
