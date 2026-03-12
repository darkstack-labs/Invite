import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/firebase";

import { resolveLegacyGuestGender } from "../legacyGuestMetadata";
import type { UserProfile } from "../types";
import {
  coerceGuestGender,
  formatGuestName,
  normalizeNameKey,
  sanitizeEntryId,
} from "../utils";

const GUESTS_COLLECTION = "guests";
const ENTRY_ID_FIELDS = ["entryId", "entryCode"] as const;
const NORMALIZED_NAME_FIELDS = ["normalizedName", "nameKey"] as const;

let guestDirectoryPromise: Promise<UserProfile[]> | null = null;

type FirestoreGuestRecord = {
  name?: string;
  entryId?: string;
  entryCode?: string;
  gender?: string;
  badge?: boolean;
  rulesAccepted?: boolean;
};

const mapGuestRecord = (
  documentId: string,
  data: FirestoreGuestRecord | undefined
): UserProfile | null => {
  const rawEntryId = data?.entryId ?? data?.entryCode ?? documentId;
  const entryId = sanitizeEntryId(rawEntryId);
  const name = formatGuestName(data?.name);

  if (!entryId || !name) {
    return null;
  }

  const gender = coerceGuestGender(data?.gender);

  return {
    guestDocId: documentId,
    name,
    entryId,
    gender: gender === "Unknown" ? resolveLegacyGuestGender(name) : gender,
    badge: Boolean(data?.badge),
    rulesAccepted: Boolean(data?.rulesAccepted),
  };
};

const dedupeGuests = (guests: UserProfile[]) => {
  const uniqueGuests = new Map<string, UserProfile>();

  for (const guest of guests) {
    if (!uniqueGuests.has(guest.entryId)) {
      uniqueGuests.set(guest.entryId, guest);
    }
  }

  return Array.from(uniqueGuests.values()).sort((left, right) =>
    left.name.localeCompare(right.name, "en", { sensitivity: "base" })
  );
};

export const fetchInviteByEntryId = async (
  rawEntryId: string
): Promise<UserProfile | null> => {
  const entryId = sanitizeEntryId(rawEntryId);

  if (!entryId) {
    return null;
  }

  const directSnapshot = await getDoc(doc(db, GUESTS_COLLECTION, entryId));
  const directGuest = mapGuestRecord(
    directSnapshot.id,
    directSnapshot.data() as FirestoreGuestRecord | undefined
  );

  if (directGuest) {
    return directGuest;
  }

  for (const fieldName of ENTRY_ID_FIELDS) {
    const guestQuery = query(
      collection(db, GUESTS_COLLECTION),
      where(fieldName, "==", entryId),
      limit(1)
    );
    const snapshot = await getDocs(guestQuery);
    const guestDoc = snapshot.docs[0];

    if (guestDoc) {
      const guest = mapGuestRecord(
        guestDoc.id,
        guestDoc.data() as FirestoreGuestRecord
      );

      if (guest) {
        return guest;
      }
    }
  }

  return null;
};

export const lookupInviteByName = async (
  rawName: string
): Promise<UserProfile | null> => {
  const formattedName = formatGuestName(rawName);

  if (!formattedName) {
    return null;
  }

  const exactNameQuery = query(
    collection(db, GUESTS_COLLECTION),
    where("name", "==", formattedName),
    limit(1)
  );
  const exactNameSnapshot = await getDocs(exactNameQuery);
  const exactNameMatch = exactNameSnapshot.docs[0];

  if (exactNameMatch) {
    return mapGuestRecord(
      exactNameMatch.id,
      exactNameMatch.data() as FirestoreGuestRecord
    );
  }

  const normalizedName = normalizeNameKey(formattedName);

  for (const fieldName of NORMALIZED_NAME_FIELDS) {
    const normalizedQuery = query(
      collection(db, GUESTS_COLLECTION),
      where(fieldName, "==", normalizedName),
      limit(1)
    );
    const normalizedSnapshot = await getDocs(normalizedQuery);
    const normalizedMatch = normalizedSnapshot.docs[0];

    if (normalizedMatch) {
      return mapGuestRecord(
        normalizedMatch.id,
        normalizedMatch.data() as FirestoreGuestRecord
      );
    }
  }

  return null;
};

export const listInviteGuests = async (forceRefresh = false) => {
  if (!forceRefresh && guestDirectoryPromise) {
    return guestDirectoryPromise;
  }

  guestDirectoryPromise = getDocs(collection(db, GUESTS_COLLECTION)).then(
    (snapshot) =>
      dedupeGuests(
        snapshot.docs
          .map((docSnapshot) =>
            mapGuestRecord(
              docSnapshot.id,
              docSnapshot.data() as FirestoreGuestRecord
            )
          )
          .filter((guest): guest is UserProfile => Boolean(guest))
      )
  );

  try {
    return await guestDirectoryPromise;
  } catch (error) {
    guestDirectoryPromise = null;
    throw error;
  }
};
