import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function useSuggestions() {

  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {

    const unsub = onSnapshot(
      collection(db, "suggestions"),
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
