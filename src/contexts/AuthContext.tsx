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
  "300525": { name: "Shivasheesh", entryId: "300525", gender: "Male" },
  "2006": { name: "Simar", entryId: "2006", gender: "Male" },
  "2016": { name: "Vikram", entryId: "2016", gender: "Male" },
  "2026": { name: "Roshan Kumar", entryId: "2026", gender: "Male" },
  "2036": { name: "Ankita", entryId: "2036", gender: "Female" },
  "2046": { name: "Tanvi", entryId: "2046", gender: "Female" },
  "2056": { name: "Arya", entryId: "2056", gender: "Male" },
  "2066": { name: "Spandan", entryId: "2066", gender: "Male" },
  "2076": { name: "Deepanshi", entryId: "2076", gender: "Female" },
  "2086": { name: "Shlok Kumar", entryId: "2086", gender: "Male" },
  "2096": { name: "Arushi", entryId: "2096", gender: "Female" },
  "2106": { name: "Ishan", entryId: "2106", gender: "Male" },
  "2116": { name: "Huzaifa", entryId: "2116", gender: "Male" },
  "2126": { name: "Aryan Majumdar", entryId: "2126", gender: "Male" },
  "2136": { name: "Sarvesh", entryId: "2136", gender: "Male" },
  "2146": { name: "Ananya", entryId: "2146", gender: "Female" },
  "2156": { name: "Roshan", entryId: "2156", gender: "Male" },
  "2166": { name: "Sanjiban", entryId: "2166", gender: "Male" },
  "2176": { name: "Puja", entryId: "2176", gender: "Female" },
  "2186": { name: "Lodh", entryId: "2186", gender: "Male" },
  "2196": { name: "Hanshika", entryId: "2196", gender: "Female" },
  "2206": { name: "Yushi", entryId: "2206", gender: "Female" },
  "2216": { name: "Pari", entryId: "2216", gender: "Female" },
  "2226": { name: "Shray", entryId: "2226", gender: "Male" },
  "2236": { name: "Krisha", entryId: "2236", gender: "Female" },
  "2246": { name: "Anshika Suman", entryId: "2246", gender: "Female" },
  "2256": { name: "Vats", entryId: "2256", gender: "Male" },
  "2266": { name: "Navya", entryId: "2266", gender: "Female" },
  "2276": { name: "Ashika", entryId: "2276", gender: "Female" },
  "2286": { name: "Swarit", entryId: "2286", gender: "Male" },
  "2296": { name: "Hazique", entryId: "2296", gender: "Male" },
  "2306": { name: "Rishabh", entryId: "2306", gender: "Male" },
  "2316": { name: "Pratham", entryId: "2316", gender: "Male" },
  "2326": { name: "Prateek", entryId: "2326", gender: "Male" },
  "2336": { name: "Kamali", entryId: "2336", gender: "Female" },
  "2346": { name: "Asad", entryId: "2346", gender: "Male" },
  "2356": { name: "Raj Nandani", entryId: "2356", gender: "Female" },
  "2366": { name: "Rishik", entryId: "2366", gender: "Male" },
  "2376": { name: "Vishwaraj", entryId: "2376", gender: "Male" },
  "2386": { name: "Abhishek", entryId: "2386", gender: "Male" },
  "2396": { name: "Kawal", entryId: "2396", gender: "Male" },
  "2406": { name: "Atul", entryId: "2406", gender: "Male" },
  "2416": { name: "Ayansh", entryId: "2416", gender: "Male" },
  "2426": { name: "Shlok Mishra", entryId: "2426", gender: "Male" },
  "2436": { name: "Rohan", entryId: "2436", gender: "Male" },
  "2446": { name: "Anshuman", entryId: "2446", gender: "Male" },
  "2456": { name: "Darsh", entryId: "2456", gender: "Male" },
  "2466": { name: "Ayushman", entryId: "2466", gender: "Male" },
  "2476": { name: "Jasmine", entryId: "2476", gender: "Female" },
  "2486": { name: "Atul Agarwal", entryId: "2486", gender: "Male" },
  "2496": { name: "Ayushi Das", entryId: "2496", gender: "Female" },
  "2506": { name: "Anushka", entryId: "2506", gender: "Female" },
  "2516": { name: "Anusha", entryId: "2516", gender: "Female" },
  "2526": { name: "Alankrita", entryId: "2526", gender: "Female" }
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
