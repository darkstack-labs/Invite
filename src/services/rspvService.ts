import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

interface RSVPData {
  name: string;
  entryId: string;
  attendance: "yes" | "no";
  mealPreference: "veg" | "nonveg";
  dietary?: string;
}

export const submitRSVP = async (data: RSVPData) => {
  const ref = doc(db, "rsvps", data.entryId);

  await setDoc(ref, {
    ...data,
    timestamp: serverTimestamp(),
  });
};

export const checkRSVP = async (entryId: string) => {
  const ref = doc(db, "rsvps", entryId);
  const snap = await getDoc(ref);
  return snap.exists();
};