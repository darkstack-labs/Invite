import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

export default function useSuggestions() {

  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {

    const q = query(
      collection(db, "suggestions"),
      orderBy("timestamp", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {

        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setSuggestions(data);
      },
      (error) => {
        console.error("Suggestions snapshot error:", error);
      }
    );

    return () => unsub();

  }, []);

  return suggestions;
}
