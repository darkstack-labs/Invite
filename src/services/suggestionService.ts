import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { formatGuestName, sanitizeEntryId, sanitizeFreeText } from "@/invite/utils";

interface SuggestionData {
  name: string;
  entryId: string;
  suggestion: string;
}

export const submitSuggestion = async (data: SuggestionData) => {
  const entryId = sanitizeEntryId(data.entryId);
  const name = formatGuestName(data.name);
  const suggestion = sanitizeFreeText(data.suggestion, 500);

  if (!entryId || !name || !suggestion) {
    throw new Error("INVALID_SUGGESTION");
  }

  await addDoc(collection(db, "suggestions"), {
    name,
    entryId,
    suggestion,
    timestamp: serverTimestamp(),
  });
};
