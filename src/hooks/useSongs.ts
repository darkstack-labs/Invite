import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function useSongs() {

  const [songs, setSongs] = useState<any[]>([]);

  useEffect(() => {

    const unsub = onSnapshot(
      collection(db, "songs"),
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

  }, []);

  return songs;
}
