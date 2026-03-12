import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User as FirebaseUser } from "firebase/auth";
import {
  getIdTokenResult,
  onAuthStateChanged,
  signInWithCustomToken,
  signOut as firebaseSignOut,
} from "firebase/auth";

import {
  clearStoredInviteSession,
  loadStoredInviteEntryId,
  loadStoredInviteSession,
  saveStoredInviteSession,
} from "@/invite/storage";
import { fetchInviteByEntryId } from "@/invite/services/guestDirectory";
import type { InviteAuthResult, UserProfile } from "@/invite/types";
import {
  coerceGuestGender,
  formatGuestName,
  sanitizeEntryId,
} from "@/invite/utils";
import { auth } from "@/firebase";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (entryId: string) => Promise<InviteAuthResult>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const requestInviteToken = useCallback(async (entryId: string) => {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify({ entryId }),
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          token?: string;
          user?: UserProfile;
          message?: string;
        }
      | null;

    if (!response.ok || !payload?.token || !payload?.user) {
      throw new Error(payload?.message || "Invite verification failed");
    }

    return payload;
  }, []);

  const resolveUserFromFirebaseUser = useCallback(
    async (firebaseUser: FirebaseUser): Promise<UserProfile | null> => {
      const tokenResult = await getIdTokenResult(firebaseUser);
      const entryId = sanitizeEntryId(
        String(tokenResult.claims.entryId ?? "")
      );

      if (!entryId) {
        return null;
      }

      const claimName = formatGuestName(
        typeof tokenResult.claims.guestName === "string"
          ? tokenResult.claims.guestName
          : ""
      );
      const claimGender = coerceGuestGender(tokenResult.claims.guestGender);

      if (claimName && claimGender !== "Unknown") {
        return {
          name: claimName,
          entryId,
          gender: claimGender,
        };
      }

      return fetchInviteByEntryId(entryId);
    },
    []
  );

  const login = useCallback(
    async (rawEntryId: string): Promise<InviteAuthResult> => {
      const entryId = sanitizeEntryId(rawEntryId);

      if (!entryId) {
        return {
          ok: false,
          reason: "invalid-entry-id",
          message: "Entry ID must be 4 or 6 digits.",
        };
      }

      setIsLoading(true);

      try {
        const { token, user: authenticatedUser } = await requestInviteToken(
          entryId
        );

        await signInWithCustomToken(auth, token);
        setUser(authenticatedUser);
        saveStoredInviteSession(authenticatedUser);

        return {
          ok: true,
          user: authenticatedUser,
        };
      } catch (error) {
        console.error("Login failed", error);
        clearStoredInviteSession();
        setUser(null);

        return {
          ok: false,
          reason: "network-error",
          message:
            error instanceof Error &&
            error.message.toLowerCase().includes("invalid")
              ? "Invalid Entry ID."
              : "We could not verify your invite right now. Please try again.",
        };
      } finally {
        setIsLoading(false);
      }
    },
    [requestInviteToken]
  );

  useEffect(() => {
    let isActive = true;
    let hasAttemptedStoredRestore = false;

    const syncAuthState = async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          const restoredUser = await resolveUserFromFirebaseUser(firebaseUser);

          if (!isActive) {
            return;
          }

          if (restoredUser) {
            setUser(restoredUser);
            saveStoredInviteSession(restoredUser);
          } else {
            clearStoredInviteSession();
            setUser(null);
            await firebaseSignOut(auth);
          }

          return;
        }

        if (!hasAttemptedStoredRestore) {
          hasAttemptedStoredRestore = true;

          const storedSession = loadStoredInviteSession();
          const storedEntryId =
            storedSession?.user.entryId || loadStoredInviteEntryId();

          if (storedEntryId) {
            const restoredSession = await login(storedEntryId);

            if (!isActive) {
              return;
            }

            if (restoredSession.ok) {
              return;
            }
          }
        }

        clearStoredInviteSession();

        if (isActive) {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to sync the invite session", error);

        if (isActive) {
          clearStoredInviteSession();
          setUser(null);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      void syncAuthState(firebaseUser);
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [login, resolveUserFromFirebaseUser]);

  const logout = useCallback(() => {
    setUser(null);
    clearStoredInviteSession();
    void firebaseSignOut(auth);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      isLoading,
    }),
    [user, login, logout, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};

export type { UserProfile } from "@/invite/types";
