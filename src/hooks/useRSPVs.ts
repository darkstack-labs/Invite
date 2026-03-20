import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

export default function useRSVPs(enabled = true) {

  const [rsvps, setRsvps] = useState<any[]>([]);

  useEffect(() => {
    if (!enabled) {
      setRsvps([]);
      return;
    }

    const q = query(
      collection(db, "rsvps"),
      orderBy("timestamp", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {

        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setRsvps(data);
      },
      (error) => {
        console.error("RSVP snapshot error:", error);
      }
    );

    return () => unsub();

  }, [enabled]);

  return rsvps;
}
