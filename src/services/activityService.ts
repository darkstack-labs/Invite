import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

type ActivityType =
  | "login_success"
  | "login_failed"
  | "logout"
  | "rsvp_submitted"
  | "song_submitted"
  | "suggestion_submitted";

interface ActivityPayload {
  type: ActivityType;
  entryId?: string;
  name?: string;
  details?: string;
}

const DEVICE_KEY = "wb_device_id";

const generateDeviceId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `device-${Math.random().toString(36).slice(2, 11)}`;
};

export const getDeviceId = () => {
  try {
    const existing = localStorage.getItem(DEVICE_KEY);
    if (existing) return existing;

    const created = generateDeviceId();
    localStorage.setItem(DEVICE_KEY, created);
    return created;
  } catch {
    return "device-unavailable";
  }
};

export const logActivity = async (payload: ActivityPayload) => {
  try {
    await addDoc(collection(db, "activityLogs"), {
      type: payload.type,
      entryId: payload.entryId ?? "",
      name: payload.name ?? "",
      details: payload.details ?? "",
      deviceId: getDeviceId(),
      path: window.location.pathname,
      userAgent: navigator.userAgent.slice(0, 180),
      clientTime: new Date().toISOString(),
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};
