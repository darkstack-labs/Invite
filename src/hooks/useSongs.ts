import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";

import { db } from "../firebase";
import type { SongRequest } from "../types/admin";

export default function useSongs() {
  const [songs, setSongs] = useState<SongRequest[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "songRequests"), (snap) => {
      const data = snap.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...(docSnapshot.data() as Omit<SongRequest, "id">),
      }));

      setSongs(data);
    });

    return () => unsub();
  }, []);

  return songs;
}
