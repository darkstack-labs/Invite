import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { formatGuestName, sanitizeEntryId, sanitizeFreeText } from "@/invite/utils";

interface SongRequest {
  name: string;
  entryId: string;
  songName: string;
  artist: string;
}

export const submitSongRequest = async (data: SongRequest) => {
  const entryId = sanitizeEntryId(data.entryId);
  const name = formatGuestName(data.name);
  const songName = sanitizeFreeText(data.songName, 120);
  const artist = sanitizeFreeText(data.artist, 120);

  if (!entryId || !name || !songName || !artist) {
    throw new Error("INVALID_SONG_REQUEST");
  }

  await addDoc(collection(db, "songRequests"), {
    name,
    entryId,
    songName,
    artist,
    timestamp: serverTimestamp(),
  });
};
