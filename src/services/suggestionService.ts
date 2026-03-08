import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const submitSuggestion = async (data: {
  name: string;
  message: string;
}) => {
  await addDoc(collection(db, "suggestions"), {
    ...data,
    createdAt: serverTimestamp()
  });
};