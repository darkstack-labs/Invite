export type GuestGender = "Male" | "Female" | "Unknown";

export interface UserProfile {
  name: string;
  entryId: string;
  gender: GuestGender;
  guestDocId?: string;
  badge?: boolean;
  rulesAccepted?: boolean;
}

export interface StoredInviteSession {
  user: UserProfile;
  validatedAt: string;
}

export type InviteAuthFailureReason =
  | "invalid-entry-id"
  | "not-found"
  | "network-error";

export type InviteAuthResult =
  | {
      ok: true;
      user: UserProfile;
    }
  | {
      ok: false;
      reason: InviteAuthFailureReason;
      message: string;
    };
