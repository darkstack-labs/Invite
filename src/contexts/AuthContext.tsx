import React, { createContext, useContext, useState, useEffect } from "react";

interface UserProfile {
  name: string;
  entryId: string;
  gender: string;
  nickname: string;
  comment: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (entryId: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const profiles: Record<string, UserProfile> = {
  "060610": { name: "Pahal", entryId: "060610", gender: "Female", nickname: "Queen Bee", comment: "Glow up and take the spotlight!" },
  "090726": { name: "Aditi", entryId: "090726", gender: "Female", nickname: "The Artist", comment: "Your vibe sets the stage on fire!" },
  "220422": { name: "Sarvagya", entryId: "220422", gender: "Male", nickname: "The Coder", comment: "Time to make unforgettable memories!" },
  "111109": { name: "Anay", entryId: "111109", gender: "Male", nickname: "Dhol Champ", comment: "You're the showstopper this batch needs!" },
  "300525": { name: "Shivasheesh", entryId: "300525", gender: "Male", nickname: "Smooth Talker", comment: "Bringing class and chaos — that's you!" },
  "2006": { name: "Simar", entryId: "2006", gender: "Male", nickname: "The Legend", comment: "Every party needs your energy!" },
  "2016": { name: "Vikram", entryId: "2016", gender: "Male", nickname: "The Maverick", comment: "Ready to own the night!" },
  "2026": { name: "Roshan", entryId: "2026", gender: "Male", nickname: "The Star", comment: "Shine bright tonight!" },
  "2036": { name: "Ankita", entryId: "2036", gender: "Female", nickname: "The Spark", comment: "Your energy lights up the room!" },
  "2046": { name: "Tanvi", entryId: "2046", gender: "Female", nickname: "The Vibe", comment: "You bring the good times!" },
  "2056": { name: "Arya", entryId: "2056", gender: "Male", nickname: "The Bold", comment: "Fearless and fabulous!" },
  "2066": { name: "Spandhan", entryId: "2066", gender: "Male", nickname: "The Dynamo", comment: "Unstoppable energy!" },
  "2076": { name: "Deepanshi", entryId: "2076", gender: "Female", nickname: "The Glow", comment: "Radiance personified!" },
  "2086": { name: "Shlok Kumar", entryId: "2086", gender: "Male", nickname: "The Thinker", comment: "Big brain energy tonight!" },
  "2096": { name: "Arushi", entryId: "2096", gender: "Female", nickname: "The Charmer", comment: "Elegance in every step!" },
  "2106": { name: "Ishan", entryId: "2106", gender: "Male", nickname: "The Cool One", comment: "Ice cold, party hot!" },
  "2116": { name: "Huzaifa", entryId: "2116", gender: "Male", nickname: "The Smooth", comment: "Style that speaks volumes!" },
  "2126": { name: "Aryan Majumdar", entryId: "2126", gender: "Male", nickname: "The Classic", comment: "Old school cool!" },
  "2136": { name: "Sarvesh", entryId: "2136", gender: "Male", nickname: "The Rock", comment: "Solid vibes only!" },
  "2146": { name: "Ananya", entryId: "2146", gender: "Female", nickname: "The Diva", comment: "Born to steal the show!" },
  "2156": { name: "Roshan Kumar", entryId: "2156", gender: "Male", nickname: "The Scholar", comment: "Even scholars party hard!" },
  "2166": { name: "Sanjiban", entryId: "2166", gender: "Male", nickname: "The Chill", comment: "Relaxed but ready to roll!" },
  "2176": { name: "Puja", entryId: "2176", gender: "Female", nickname: "The Grace", comment: "Pure elegance tonight!" },
  "2186": { name: "Lodh", entryId: "2186", gender: "Male", nickname: "The OG", comment: "Original gangster energy!" },
  "2196": { name: "Hanshika", entryId: "2196", gender: "Female", nickname: "The Smile", comment: "Your smile is contagious!" },
  "2206": { name: "Yushi", entryId: "2206", gender: "Female", nickname: "The Dreamer", comment: "Dream big, party bigger!" },
  "2216": { name: "Pari", entryId: "2216", gender: "Female", nickname: "The Angel", comment: "Heaven-sent vibes!" },
  "2226": { name: "Shray", entryId: "2226", gender: "Male", nickname: "The Hustler", comment: "Work hard, party harder!" },
  "2236": { name: "Krisha", entryId: "2236", gender: "Female", nickname: "The Firecracker", comment: "Explosive energy incoming!" },
  "2246": { name: "Anshika Suman", entryId: "2246", gender: "Female", nickname: "The Sunshine", comment: "Brightening every moment!" },
  "2256": { name: "Vats", entryId: "2256", gender: "Male", nickname: "The Witty", comment: "Sharp mind, sharper moves!" },
  "2266": { name: "Navya", entryId: "2266", gender: "Female", nickname: "The Trendsetter", comment: "Setting the vibe tonight!" },
  "2276": { name: "Ashika", entryId: "2276", gender: "Female", nickname: "The Glow Up", comment: "Tonight is your runway!" },
  "2286": { name: "Swarit", entryId: "2286", gender: "Male", nickname: "The Dynamo", comment: "Unstoppable energy!" },
  "2296": { name: "Hazique", entryId: "2296", gender: "Male", nickname: "The Phantom", comment: "Silent but legendary!" },
  "2306": { name: "Rishabh", entryId: "2306", gender: "Male", nickname: "The King", comment: "Royalty in the house!" },
  "2316": { name: "Pratham", entryId: "2316", gender: "Male", nickname: "The First", comment: "Always ahead of the game!" },
  "2326": { name: "Prateek", entryId: "2326", gender: "Male", nickname: "The Strategist", comment: "Calculated moves, epic night!" },
  "2336": { name: "Kamali", entryId: "2336", gender: "Female", nickname: "The Queen", comment: "Crown on, world off!" },
  "2346": { name: "Asad", entryId: "2346", gender: "Male", nickname: "The Lion", comment: "Fierce and unforgettable!" },
  "2356": { name: "Raj Nandani", entryId: "2356", gender: "Female", nickname: "The Royal", comment: "Regal vibes all night!" },
  "2366": { name: "Rishik", entryId: "2366", gender: "Male", nickname: "The Sage", comment: "Wisdom meets the dance floor!" },
  "2376": { name: "Amar", entryId: "2376", gender: "Male", nickname: "The Immortal", comment: "Legends never fade!" },
  "2386": { name: "Vishwaraj", entryId: "2386", gender: "Male", nickname: "The Emperor", comment: "Rule the night!" },
  "2396": { name: "Abhishek", entryId: "2396", gender: "Male", nickname: "The Boss", comment: "Boss moves only!" },
  "2406": { name: "Kawal", entryId: "2406", gender: "Male", nickname: "The Guardian", comment: "Protector of good vibes!" },
  "2416": { name: "Prachi", entryId: "2416", gender: "Female", nickname: "The Elegant", comment: "Grace in every gesture!" },
  "2426": { name: "Shilpa", entryId: "2426", gender: "Female", nickname: "The Artist", comment: "Creating magic tonight!" },
  "2436": { name: "Atul", entryId: "2436", gender: "Male", nickname: "The Steady", comment: "Calm energy, wild moves!" },
  "2446": { name: "Ayansh", entryId: "2446", gender: "Male", nickname: "The Rising", comment: "On the rise, unstoppable!" },
  "2456": { name: "Siddhant", entryId: "2456", gender: "Male", nickname: "The Principle", comment: "Standing tall, partying hard!" },
  "2466": { name: "Niranjan", entryId: "2466", gender: "Male", nickname: "The Pure", comment: "Pure fun tonight!" },
  "2476": { name: "Shlok Mishra", entryId: "2476", gender: "Male", nickname: "The Poet", comment: "Words that move, moves that inspire!" },
  "2486": { name: "Vaibhav", entryId: "2486", gender: "Male", nickname: "The Grand", comment: "Go big or go home!" },
  "2496": { name: "Rohan", entryId: "2496", gender: "Male", nickname: "The Explorer", comment: "Adventure awaits tonight!" },
  "2506": { name: "Anshuman", entryId: "2506", gender: "Male", nickname: "The Radiant", comment: "Shining through the night!" },
  "2516": { name: "Darsh", entryId: "2516", gender: "Male", nickname: "The Vision", comment: "See it, be it!" },
  "2526": { name: "Ayushman", entryId: "2526", gender: "Male", nickname: "The Blessed", comment: "Blessed and ready!" },
  "2536": { name: "Ujjwal", entryId: "2536", gender: "Male", nickname: "The Bright", comment: "Brightest one in the room!" },
  "2546": { name: "Saksham", entryId: "2546", gender: "Male", nickname: "The Capable", comment: "Can do anything tonight!" },
  "2556": { name: "Jasmine", entryId: "2556", gender: "Female", nickname: "The Blossom", comment: "Blooming brilliance!" },
  "2566": { name: "Atul Agarwal", entryId: "2566", gender: "Male", nickname: "The Ace", comment: "Ace up the sleeve!" },
  "2576": { name: "Aniket", entryId: "2576", gender: "Male", nickname: "The Victor", comment: "Victory is yours tonight!" },
  "2586": { name: "Anvesha", entryId: "2586", gender: "Female", nickname: "The Seeker", comment: "Seeking the best night ever!" },
  "2596": { name: "Aditya", entryId: "2596", gender: "Male", nickname: "The Sun", comment: "Burning bright!" },
  "2606": { name: "Ayushi Das", entryId: "2606", gender: "Female", nickname: "The Spark", comment: "Sparking joy everywhere!" },
  "2616": { name: "Harshit Shrivastav", entryId: "2616", gender: "Male", nickname: "The Force", comment: "A force to reckon with!" },
  "2626": { name: "Bhavesh", entryId: "2626", gender: "Male", nickname: "The Heart", comment: "All heart, all party!" },
  "2636": { name: "Anushka", entryId: "2636", gender: "Female", nickname: "The Star", comment: "Starlight, star bright!" }
};

export const guests: Record<string, string> = Object.fromEntries(
  Object.values(profiles).map(p => [p.name, p.entryId])
);

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("batchPartyUser");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("batchPartyUser");
      }
    }

    setIsLoading(false);
  }, []);

  const login = (entryId: string): boolean => {
    const profile = profiles[entryId.trim()];
    if (!profile) return false;

    setUser(profile);
    localStorage.setItem("batchPartyUser", JSON.stringify(profile));
    return true;
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
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};