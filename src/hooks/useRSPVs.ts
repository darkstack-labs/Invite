import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";

import { db } from "../firebase";
import type { RSVP } from "../types/admin";

export default function useRSVPs() {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "rsvps"), (snap) => {
      const data = snap.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...(docSnapshot.data() as Omit<RSVP, "id">),
      }));

      setRsvps(data);
    });

    return () => unsub();
  }, []);

  return rsvps;
}
