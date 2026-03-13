import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function useRSVPs() {

  const [rsvps, setRsvps] = useState<any[]>([]);

  useEffect(() => {

    const unsub = onSnapshot(
      collection(db, "rsvps"),
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

  }, []);

  return rsvps;
}
