import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const submitRSVP = async (data: {
  name: string;
  attending: boolean;
  guests: number;
}) => {
  await addDoc(collection(db, "rsvps"), {
    ...data,
    createdAt: serverTimestamp()
  });
};