import { adminDb, isApiError, readJsonBody, sendJson } from "./admin.js";
import { getLocalGuestByName } from "./localGuestProfiles.js";

const GUESTS_COLLECTION = "guests";
const NORMALIZED_NAME_FIELDS = ["normalizedName", "nameKey"];

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

const normalizeNameKey = (value) => formatGuestName(value).toLowerCase();

const sanitizeEntryId = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  const digitsOnly = value.replace(/\D/g, "");
  return /^(\d{4}|\d{6})$/.test(digitsOnly) ? digitsOnly : "";
};

const mapInviteRecord = (documentId, data = {}) => {
  const name = formatGuestName(data?.name);
  const entryId = sanitizeEntryId(data?.entryId || data?.entryCode || documentId);

  if (!name || !entryId) {
    return null;
  }

  return {
    found: true,
    name,
    entryId,
  };
};

const findInviteByName = async (rawName) => {
  const formattedName = formatGuestName(rawName);

  if (!formattedName) {
    return null;
  }

  try {
    const exactNameSnapshot = await adminDb
      .collection(GUESTS_COLLECTION)
      .where("name", "==", formattedName)
      .limit(1)
      .get();

    if (!exactNameSnapshot.empty) {
      const exactInvite = mapInviteRecord(
        exactNameSnapshot.docs[0].id,
        exactNameSnapshot.docs[0].data()
      );

      if (exactInvite) {
        return exactInvite;
      }
    }

    const normalizedName = normalizeNameKey(formattedName);

    for (const fieldName of NORMALIZED_NAME_FIELDS) {
      const normalizedSnapshot = await adminDb
        .collection(GUESTS_COLLECTION)
        .where(fieldName, "==", normalizedName)
        .limit(1)
        .get();

      if (!normalizedSnapshot.empty) {
        const normalizedInvite = mapInviteRecord(
          normalizedSnapshot.docs[0].id,
          normalizedSnapshot.docs[0].data()
        );

        if (normalizedInvite) {
          return normalizedInvite;
        }
      }
    }
  } catch (error) {
    console.warn(
      "Invite lookup is falling back to the bundled guest directory",
      error
    );
  }

  const localGuest = getLocalGuestByName(formattedName);

  return localGuest
    ? {
        found: true,
        name: localGuest.name,
        entryId: sanitizeEntryId(
          localGuest.entryId || localGuest.entryCode || ""
        ),
      }
    : null;
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
    const invite = await findInviteByName(body.name);

    sendJson(res, 200, invite || { found: false });
  } catch (error) {
    if (isApiError(error)) {
      sendJson(res, error.statusCode, {
        message: error.message,
      });
      return;
    }

    console.error("Invite lookup failed", error);
    sendJson(res, 500, {
      message: "We could not check the guest list right now. Please try again.",
    });
  }
}
