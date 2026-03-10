import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

interface SuggestionData {
  name: string;
  entryId: string;
  suggestion: string;
}

export const submitSuggestion = async (data: SuggestionData) => {
  await addDoc(collection(db, "suggestions"), {
    ...data,
    timestamp: serverTimestamp(),
  });
};