import type { StoredInviteSession, UserProfile } from "./types";
import { sanitizeEntryId } from "./utils";

const INVITE_SESSION_KEY = "batchPartyInviteSession";
const LEGACY_ENTRY_ID_KEY = "batchPartyUser";

const isBrowser = () => typeof window !== "undefined";

export const loadStoredInviteSession = (): StoredInviteSession | null => {
  if (!isBrowser()) {
    return null;
  }

  try {
    const rawSession = window.localStorage.getItem(INVITE_SESSION_KEY);

    if (!rawSession) {
      return null;
    }

    const parsed = JSON.parse(rawSession) as StoredInviteSession | null;

    if (!parsed?.user?.entryId) {
      return null;
    }

    const entryId = sanitizeEntryId(parsed.user.entryId);

    if (!entryId) {
      return null;
    }

    return {
      ...parsed,
      user: {
        ...parsed.user,
        entryId,
      },
    };
  } catch (error) {
    console.error("Failed to read the stored invite session", error);
    return null;
  }
};

export const loadStoredInviteEntryId = (): string => {
  const storedSession = loadStoredInviteSession();

  if (storedSession?.user.entryId) {
    return storedSession.user.entryId;
  }

  if (!isBrowser()) {
    return "";
  }

  try {
    return sanitizeEntryId(window.localStorage.getItem(LEGACY_ENTRY_ID_KEY));
  } catch (error) {
    console.error("Failed to read the legacy invite session", error);
    return "";
  }
};

export const saveStoredInviteSession = (user: UserProfile) => {
  if (!isBrowser()) {
    return;
  }

  const session: StoredInviteSession = {
    user,
    validatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(INVITE_SESSION_KEY, JSON.stringify(session));
  window.localStorage.setItem(LEGACY_ENTRY_ID_KEY, user.entryId);
};

export const clearStoredInviteSession = () => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(INVITE_SESSION_KEY);
  window.localStorage.removeItem(LEGACY_ENTRY_ID_KEY);
};
