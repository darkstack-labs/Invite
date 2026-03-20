import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

export default function useSongs(enabled = true) {

  const [songs, setSongs] = useState<any[]>([]);

  useEffect(() => {
    if (!enabled) {
      setSongs([]);
      return;
    }

    const q = query(
      collection(db, "songs"),
      orderBy("timestamp", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {

        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setSongs(data);
      },
      (error) => {
        console.error("Songs snapshot error:", error);
      }
    );

    return () => unsub();

  }, [enabled]);

  return songs;
}
