import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const submitSong = async (data: {
  name: string;
  songTitle: string;
  artist: string;
}) => {
  await addDoc(collection(db, "songs"), {
    ...data,
    createdAt: serverTimestamp()
  });
};