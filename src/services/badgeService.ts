import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export const saveBadge = async (data: {
  name: string;
  badgeText: string;
  color: string;
}) => {
  await addDoc(collection(db, "badges"), data);
};