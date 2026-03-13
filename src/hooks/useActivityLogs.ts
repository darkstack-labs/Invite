import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";

export default function useActivityLogs() {
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "activityLogs"),
      orderBy("timestamp", "desc"),
      limit(300)
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
  }, []);

  return activityLogs;
}
