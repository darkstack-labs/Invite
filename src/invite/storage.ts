import type { StoredInviteSession, UserProfile } from "./types";
import { coerceGuestGender, formatGuestName, sanitizeEntryId } from "./utils";

const INVITE_SESSION_KEY = "batchPartyInviteSession";
const LEGACY_ENTRY_ID_KEY = "batchPartyUser";

const isBrowser = () => typeof window !== "undefined";

const normalizeUserProfile = (
  rawUser: Partial<UserProfile> | null | undefined
): UserProfile | null => {
  const entryId = sanitizeEntryId(rawUser?.entryId);
  const name = formatGuestName(rawUser?.name);

  if (!entryId || !name) {
    return null;
  }

  return {
    guestDocId:
      typeof rawUser?.guestDocId === "string" ? rawUser.guestDocId : undefined,
    name,
    entryId,
    gender: coerceGuestGender(rawUser?.gender),
    badge: Boolean(rawUser?.badge),
    rulesAccepted: Boolean(rawUser?.rulesAccepted),
  };
};

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
    const normalizedUser = normalizeUserProfile(parsed?.user);

    if (!normalizedUser) {
      return null;
    }

    return {
      user: normalizedUser,
      validatedAt:
        typeof parsed?.validatedAt === "string"
          ? parsed.validatedAt
          : new Date(0).toISOString(),
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

  const normalizedUser = normalizeUserProfile(user);

  if (!normalizedUser) {
    return;
  }

  const session: StoredInviteSession = {
    user: normalizedUser,
    validatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(INVITE_SESSION_KEY, JSON.stringify(session));
  window.localStorage.setItem(LEGACY_ENTRY_ID_KEY, normalizedUser.entryId);
};

export const clearStoredInviteSession = () => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(INVITE_SESSION_KEY);
  window.localStorage.removeItem(LEGACY_ENTRY_ID_KEY);
};
