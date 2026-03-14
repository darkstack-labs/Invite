import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { logActivity } from "@/services/activityService";
import { getDeviceId } from "@/services/activityService";
import { ensureAnonymousAuth } from "@/firebase";
import { isDeviceBlocked, isEntryBlocked } from "@/services/blockService";

interface UserProfile {
  name: string;
  entryId: string;
  gender: string;
}

export interface GuestProfile extends UserProfile {}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (entryId: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export const guestProfiles: Record<string, GuestProfile> = {
  "060610": { name: "Pahal", entryId: "060610", gender: "Female" },
  "090726": { name: "Aditi", entryId: "090726", gender: "Female" },
  "220422": { name: "Sarvagya", entryId: "220422", gender: "Male" },
  "111109": { name: "Anay", entryId: "111109", gender: "Male" },
  "300525": { name: "Shivasheesh", entryId: "300525", gender: "Male" },
  "2006": { name: "Simar", entryId: "2006", gender: "Female" },
  "2016": { name: "Vikram", entryId: "2016", gender: "Male" },
  "2026": { name: "Roshan_kumar", entryId: "2026", gender: "Male" },
  "2036": { name: "Ankita", entryId: "2036", gender: "Female" },
  "2046": { name: "Tanvi", entryId: "2046", gender: "Female" },
  "2056": { name: "Arya", entryId: "2056", gender: "Male" },
  "2066": { name: "Spandan", entryId: "2066", gender: "Male" },
  "2076": { name: "Shlok_kumar", entryId: "2076", gender: "Male" },
  "2086": { name: "Arushi", entryId: "2086", gender: "Female" },
  "2096": { name: "Ishan", entryId: "2096", gender: "Male" },
  "2106": { name: "Huzaifa", entryId: "2106", gender: "Male" },
  "2116": { name: "Aryan_majumdar", entryId: "2116", gender: "Male" },
  "2126": { name: "Sarvesh", entryId: "2126", gender: "Male" },
  "2136": { name: "Ananya", entryId: "2136", gender: "Female" },
  "2146": { name: "Roshan", entryId: "2146", gender: "Male" },
  "2156": { name: "Sanjiban", entryId: "2156", gender: "Male" },
  "2166": { name: "Puja", entryId: "2166", gender: "Female" },
  "2176": { name: "Lodh", entryId: "2176", gender: "Female" },
  "2186": { name: "Hanshika", entryId: "2186", gender: "Female" },
  "2196": { name: "Yushi", entryId: "2196", gender: "Female" },
  "2206": { name: "Pari", entryId: "2206", gender: "Female" },
  "2216": { name: "Shray", entryId: "2216", gender: "Female" },
  "2226": { name: "Krisha", entryId: "2226", gender: "Female" },
  "2236": { name: "Anshika_suman", entryId: "2236", gender: "Female" },
  "2246": { name: "Vats", entryId: "2246", gender: "Male" },
  "2256": { name: "Navya", entryId: "2256", gender: "Female" },
  "2266": { name: "Ashika", entryId: "2266", gender: "Female" },
  "2276": { name: "Swarit", entryId: "2276", gender: "Male" },
  "2286": { name: "Hazique", entryId: "2286", gender: "Male" },
  "2296": { name: "Rishabh", entryId: "2296", gender: "Male" },
  "2306": { name: "Pratham", entryId: "2306", gender: "Male" },
  "2316": { name: "Prateek", entryId: "2316", gender: "Male" },
  "2326": { name: "Kamali", entryId: "2326", gender: "Female" },
  "2336": { name: "Asad", entryId: "2336", gender: "Male" },
  "2346": { name: "Raj_nandani", entryId: "2346", gender: "Female" },
  "2356": { name: "Rishik", entryId: "2356", gender: "Male" },
  "2366": { name: "Vishwaraj", entryId: "2366", gender: "Male" },
  "2376": { name: "Abhishek", entryId: "2376", gender: "Male" },
  "2386": { name: "Kawal", entryId: "2386", gender: "Female" },
  "2396": { name: "Atul", entryId: "2396", gender: "Male" },
  "2406": { name: "Ayansh", entryId: "2406", gender: "Male" },
  "2416": { name: "Shlok_mishra", entryId: "2416", gender: "Male" },
  "2426": { name: "Rohan", entryId: "2426", gender: "Male" },
  "2436": { name: "Anshuman", entryId: "2436", gender: "Male" },
  "2446": { name: "Darsh", entryId: "2446", gender: "Male" },
  "2456": { name: "Ayushman", entryId: "2456", gender: "Male" },
  "2466": { name: "Jasmine", entryId: "2466", gender: "Female" },
  "2476": { name: "Atul_agarwal", entryId: "2476", gender: "Male" },
  "2486": { name: "Ayushi_das", entryId: "2486", gender: "Female" },
  "2496": { name: "Anushka", entryId: "2496", gender: "Female" },
  "2506": { name: "Anusha", entryId: "2506", gender: "Female" },
  "2516": { name: "Alankrita", entryId: "2516", gender: "Female" },
  "2526": { name: "Anubhav", entryId: "2526", gender: "Male" },
  "2536": { name: "Dipanita", entryId: "2536", gender: "Female" },
  "2546": { name: "Vipul", entryId: "2546", gender: "Male" }
};

export const guests: Record<string, string> = Object.fromEntries(
  Object.values(guestProfiles).map((p) => [p.name, p.entryId])
);

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        await ensureAnonymousAuth();
        const deviceId = getDeviceId();
      const savedId = localStorage.getItem("batchPartyUser");

      if (savedId) {
        const cleanId = savedId.trim();
        const profile = guestProfiles[cleanId];
        const entryBlocked = await isEntryBlocked(cleanId);
        const deviceBlocked = await isDeviceBlocked(deviceId);

        if ((entryBlocked || deviceBlocked) && profile) {
          toast.error("This account/device is blocked");
          localStorage.removeItem("batchPartyUser");
        } else if (profile) {
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
    };

    void restoreSession();
  }, []);

  const login = async (entryId: string): Promise<boolean> => {
    try {
      await ensureAnonymousAuth();
      const cleanId = entryId.trim();
      const profile = guestProfiles[cleanId];
      const deviceId = getDeviceId();
      const entryBlocked = await isEntryBlocked(cleanId);
      const deviceBlocked = await isDeviceBlocked(deviceId);

      if (entryBlocked || deviceBlocked) {
        void logActivity({
          type: "login_failed",
          entryId: cleanId,
          details: entryBlocked ? "blocked-entry" : "blocked-device"
        });
        return false;
      }

      if (!profile) {
        void logActivity({
          type: "login_failed",
          entryId: cleanId,
          details: "invalid-entry-id"
        });
        return false;
      }

      setUser(profile);
      localStorage.setItem("batchPartyUser", cleanId);
      void logActivity({
        type: "login_success",
        entryId: profile.entryId,
        name: profile.name
      });
      return true;
    } catch (error) {
      console.error("Login error", error);
      toast.error("Login failed");
      return false;
    }
  };

  const logout = () => {
    if (user) {
      void logActivity({
        type: "logout",
        entryId: user.entryId,
        name: user.name
      });
    }
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
