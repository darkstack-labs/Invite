import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

interface SongRequest {
  name: string;
  entryId: string;
  songName: string;
  artist: string;
}

export const submitSongRequest = async (data: SongRequest) => {
  await addDoc(collection(db, "songs"), {
    ...data,
    timestamp: serverTimestamp(),
  });
};