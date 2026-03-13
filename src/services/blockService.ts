import {
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  collection
} from "firebase/firestore";
import { db } from "@/firebase";

export const isEntryBlocked = async (entryId: string) => {
  const snap = await getDoc(doc(db, "blockedEntries", entryId));
  return snap.exists();
};

export const isDeviceBlocked = async (deviceId: string) => {
  const snap = await getDoc(doc(db, "blockedDevices", deviceId));
  return snap.exists();
};

export const blockEntry = async (entryId: string, name?: string) => {
  await setDoc(doc(db, "blockedEntries", entryId), {
    entryId,
    name: name ?? "",
    source: "admin-dashboard",
    timestamp: serverTimestamp()
  });
};

export const unblockEntry = async (entryId: string) => {
  await deleteDoc(doc(db, "blockedEntries", entryId));
};

export const blockDevice = async (deviceId: string) => {
  await setDoc(doc(db, "blockedDevices", deviceId), {
    deviceId,
    source: "admin-dashboard",
    timestamp: serverTimestamp()
  });
};

export const unblockDevice = async (deviceId: string) => {
  await deleteDoc(doc(db, "blockedDevices", deviceId));
};

export const subscribeBlockedEntries = (onChange: (ids: Set<string>) => void) => {
  return onSnapshot(collection(db, "blockedEntries"), (snap) => {
    onChange(new Set(snap.docs.map((d) => d.id)));
  });
};

export const subscribeBlockedDevices = (onChange: (ids: Set<string>) => void) => {
  return onSnapshot(collection(db, "blockedDevices"), (snap) => {
    onChange(new Set(snap.docs.map((d) => d.id)));
  });
};
