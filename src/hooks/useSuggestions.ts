import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";

import { db } from "../firebase";
import type { Suggestion } from "../types/admin";

export default function useSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "suggestions"), (snap) => {
      const data = snap.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...(docSnapshot.data() as Omit<Suggestion, "id">),
      }));

      setSuggestions(data);
    });

    return () => unsub();
  }, []);

  return suggestions;
}
