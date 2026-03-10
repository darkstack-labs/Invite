import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

interface UserProfile {
  name: string;
  entryId: string;
  gender: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (entryId: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const profiles: Record<string, UserProfile> = {
  "060610": { name: "Pahal", entryId: "060610", gender: "Female" },
  "090726": { name: "Aditi", entryId: "090726", gender: "Female" },
  "220422": { name: "Sarvagya", entryId: "220422", gender: "Male" },
  "111109": { name: "Anay", entryId: "111109", gender: "Male" },
  "300525": { name: "Shivasheesh", entryId: "300525", gender: "Male" }
};

export const guests: Record<string, string> = Object.fromEntries(
  Object.values(profiles).map((p) => [p.name, p.entryId])
);

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedId = localStorage.getItem("batchPartyUser");

      if (savedId) {
        const cleanId = savedId.trim();
        const profile = profiles[cleanId];

        if (profile) {
          setUser(profile);
        } else {
          localStorage.removeItem("batchPartyUser");
        }
      }
    } catch (error) {
      console.error("Auth load error", error);
      localStorage.removeItem("batchPartyUser");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (entryId: string): boolean => {
    try {
      const cleanId = entryId.trim();
      const profile = profiles[cleanId];

      if (!profile) return false;

      setUser(profile);
      localStorage.setItem("batchPartyUser", cleanId);
      return true;
    } catch (error) {
      console.error("Login error", error);
      toast.error("Login failed");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("batchPartyUser");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
