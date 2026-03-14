import {
  collection,
  doc,
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type FieldValue,
} from "firebase/firestore";
import { db } from "@/firebase";
import { ensureAnonymousAuth } from "@/firebase";

export const DEFAULT_WARNING_MESSAGE =
  "FINAL WARNING: Your account has been flagged for serious misconduct. Any further violation will result in immediate permanent suspension without review, reversal, or second chance. This is your first and last notice.";

export type GuestWarningRecord = {
  entryId: string;
  name?: string;
  message: string;
  isActive: boolean;
  warningCount: number;
  lastSentAt?: FieldValue;
  acknowledgedAt?: FieldValue;
  acknowledgedByEntryId?: string;
  updatedAt?: FieldValue;
  sentBy?: string;
};

export const sendGuestWarning = async ({
  entryId,
  name,
  sentBy,
  message = DEFAULT_WARNING_MESSAGE,
}: {
  entryId: string;
  name?: string;
  sentBy?: string;
  message?: string;
}) => {
  await ensureAnonymousAuth();
  const warningRef = doc(db, "guestWarnings", entryId);
  await setDoc(
    warningRef,
    {
      entryId,
      name: name ?? "",
      message,
      isActive: true,
      warningCount: increment(1),
      sentBy: sentBy ?? "admin",
      lastSentAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const clearGuestWarning = async ({
  entryId,
  acknowledgedByEntryId,
}: {
  entryId: string;
  acknowledgedByEntryId?: string;
}) => {
  await ensureAnonymousAuth();
  await setDoc(
    doc(db, "guestWarnings", entryId),
    {
      isActive: false,
      acknowledgedByEntryId: acknowledgedByEntryId ?? "",
      acknowledgedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const subscribeGuestWarnings = (
  onChange: (warningMap: Map<string, GuestWarningRecord>) => void
) => {
  return onSnapshot(collection(db, "guestWarnings"), (snap) => {
    const next = new Map<string, GuestWarningRecord>();
    snap.docs.forEach((warningDoc) => {
      const data = warningDoc.data() as GuestWarningRecord;
      next.set(warningDoc.id, {
        ...data,
        entryId: data.entryId ?? warningDoc.id,
        warningCount: Number(data.warningCount ?? 0),
      });
    });
    onChange(next);
  });
};

export const subscribeGuestWarningByEntryId = (
  entryId: string,
  onChange: (warning: GuestWarningRecord | null) => void
) => {
  return onSnapshot(doc(db, "guestWarnings", entryId), (snap) => {
    if (!snap.exists()) {
      onChange(null);
      return;
    }
    const data = snap.data() as GuestWarningRecord;
    onChange({
      ...data,
      entryId,
      warningCount: Number(data.warningCount ?? 0),
    });
  });
};
