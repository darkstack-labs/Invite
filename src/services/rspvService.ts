import { doc, getDoc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { formatGuestName, sanitizeEntryId, sanitizeFreeText } from "@/invite/utils";

interface RSVPData {
  name: string;
  entryId: string;
  attendance: "yes" | "no";
  mealPreference?: "veg" | "nonveg" | null;
  dietary?: string;
}

export const submitRSVP = async (data: RSVPData) => {
  const entryId = sanitizeEntryId(data.entryId);
  const name = formatGuestName(data.name);
  const dietary = sanitizeFreeText(data.dietary, 200);
  const mealPreference =
    data.attendance === "yes" ? data.mealPreference ?? null : null;

  if (!entryId) {
    throw new Error("INVALID_ENTRY_ID");
  }

  if (!name) {
    throw new Error("INVALID_GUEST_NAME");
  }

  if (data.attendance !== "yes" && data.attendance !== "no") {
    throw new Error("INVALID_ATTENDANCE");
  }

  if (data.attendance === "yes" && !mealPreference) {
    throw new Error("MISSING_MEAL_PREFERENCE");
  }

  const ref = doc(db, "rsvps", entryId);

  await runTransaction(db, async (transaction) => {
    const existingSubmission = await transaction.get(ref);

    if (existingSubmission.exists()) {
      throw new Error("RSVP_ALREADY_SUBMITTED");
    }

    transaction.set(ref, {
      name,
      entryId,
      attendance: data.attendance,
      mealPreference,
      dietary,
      timestamp: serverTimestamp(),
    });
  });
};

export const checkRSVP = async (entryId: string) => {
  const cleanEntryId = sanitizeEntryId(entryId);

  if (!cleanEntryId) {
    return false;
  }

  const ref = doc(db, "rsvps", cleanEntryId);
  const snap = await getDoc(ref);
  return snap.exists();
};
