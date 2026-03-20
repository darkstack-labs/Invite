import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";

export default function useActivityLogs(enabled = true) {
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!enabled) {
      setActivityLogs([]);
      return;
    }

    const q = query(
      collection(db, "activityLogs"),
      orderBy("timestamp", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setActivityLogs(data);
      },
      (error) => {
        console.error("Activity snapshot error:", error);
      }
    );

    return () => unsub();
  }, [enabled]);

  return activityLogs;
}
