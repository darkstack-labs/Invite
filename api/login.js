import { adminAuth, adminDb, readJsonBody, sendJson } from "./admin.js";
import { getLocalGuestByEntryId } from "./localGuestProfiles.js";

const GUESTS_COLLECTION = "guests";
const ENTRY_ID_FIELDS = ["entryId", "entryCode"];

const legacyGuestGenderEntries = [
  ["Pahal", "Female"],
  ["Aditi", "Female"],
  ["Sarvagya", "Male"],
  ["Anay", "Male"],
  ["Shivasheesh", "Male"],
  ["Simar", "Male"],
  ["Vikram", "Male"],
  ["Roshan Kumar", "Male"],
  ["Ankita", "Female"],
  ["Tanvi", "Female"],
  ["Arya", "Male"],
  ["Spandan", "Male"],
  ["Deepanshi", "Female"],
  ["Shlok Kumar", "Male"],
  ["Arushi", "Female"],
  ["Ishan", "Male"],
  ["Huzaifa", "Male"],
  ["Aryan Majumdar", "Male"],
  ["Sarvesh", "Male"],
  ["Ananya", "Female"],
  ["Roshan", "Male"],
  ["Sanjiban", "Male"],
  ["Puja", "Female"],
  ["Lodh", "Male"],
  ["Hanshika", "Female"],
  ["Yushi", "Female"],
  ["Pari", "Female"],
  ["Shray", "Male"],
  ["Krisha", "Female"],
  ["Anshika Suman", "Female"],
  ["Vats", "Male"],
  ["Navya", "Female"],
  ["Ashika", "Female"],
  ["Swarit", "Male"],
  ["Hazique", "Male"],
  ["Rishabh", "Male"],
  ["Pratham", "Male"],
  ["Prateek", "Male"],
  ["Kamali", "Female"],
  ["Asad", "Male"],
  ["Raj Nandani", "Female"],
  ["Rishik", "Male"],
  ["Vishwaraj", "Male"],
  ["Abhishek", "Male"],
  ["Kawal", "Male"],
  ["Atul", "Male"],
  ["Ayansh", "Male"],
  ["Shlok Mishra", "Male"],
  ["Rohan", "Male"],
  ["Anshuman", "Male"],
  ["Darsh", "Male"],
  ["Ayushman", "Male"],
  ["Jasmine", "Female"],
  ["Atul Agarwal", "Male"],
  ["Ayushi Das", "Female"],
  ["Anushka", "Female"],
  ["Anusha", "Female"],
  ["Alankrita", "Female"],
  ["Alankrita", "Female"],
  ["Alankrita", "Female"],
];

const legacyGuestGenders = new Map(
  legacyGuestGenderEntries.map(([name, gender]) => [
    name.trim().toLowerCase(),
    gender,
  ])
);

const sanitizeEntryId = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  const digitsOnly = value.replace(/\D/g, "");
  return /^(\d{4}|\d{6})$/.test(digitsOnly) ? digitsOnly : "";
};

const formatGuestName = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

const resolveGuestGender = (name, rawGender) => {
  if (rawGender === "Male" || rawGender === "Female") {
    return rawGender;
  }

  return legacyGuestGenders.get(name.trim().toLowerCase()) || "Unknown";
};

const mapGuestRecord = (documentId, data = {}) => {
  const entryId = sanitizeEntryId(data.entryId || data.entryCode || documentId);
  const name = formatGuestName(data.name);

  if (!entryId || !name) {
    return null;
  }

  return {
    guestDocId: documentId,
    name,
    entryId,
    gender: resolveGuestGender(name, data.gender),
    badge: Boolean(data.badge),
    rulesAccepted: Boolean(data.rulesAccepted),
  };
};

const fetchGuestProfileByEntryId = async (rawEntryId) => {
  const entryId = sanitizeEntryId(rawEntryId);

  if (!entryId) {
    return null;
  }

  try {
    const directSnapshot = await adminDb.collection(GUESTS_COLLECTION).doc(entryId).get();
    const directMatch = mapGuestRecord(
      directSnapshot.id,
      directSnapshot.data() || undefined
    );

    if (directMatch) {
      return directMatch;
    }

    for (const fieldName of ENTRY_ID_FIELDS) {
      const querySnapshot = await adminDb
        .collection(GUESTS_COLLECTION)
        .where(fieldName, "==", entryId)
        .limit(1)
        .get();

      const guestDocument = querySnapshot.docs[0];

      if (guestDocument) {
        const guestProfile = mapGuestRecord(
          guestDocument.id,
          guestDocument.data()
        );

        if (guestProfile) {
          return guestProfile;
        }
      }
    }
  } catch (error) {
    console.warn("Invite login is falling back to the bundled guest directory", error);
  }

  return getLocalGuestByEntryId(entryId);
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJson(res, 405, {
      message: "Method not allowed.",
    });
    return;
  }

  try {
    const body = readJsonBody(req);
    const entryId = sanitizeEntryId(body.entryId);

    if (!entryId) {
      sendJson(res, 400, {
        message: "Entry ID must be 4 or 6 digits.",
      });
      return;
    }

    const guestProfile = await fetchGuestProfileByEntryId(entryId);

    if (!guestProfile) {
      sendJson(res, 404, {
        message: "Invalid Entry ID.",
      });
      return;
    }

    const token = await adminAuth.createCustomToken(`guest:${entryId}`, {
      role: "guest",
      entryId: guestProfile.entryId,
      guestName: guestProfile.name,
      guestGender: guestProfile.gender,
    });

    sendJson(res, 200, {
      token,
      user: guestProfile,
    });
  } catch (error) {
    console.error("Invite login failed", error);
    sendJson(res, 500, {
      message: "We could not verify your invite right now. Please try again.",
    });
  }
}
