import { FieldValue } from "firebase-admin/firestore";

import {
  adminDb,
  isApiError,
  readJsonBody,
  sendJson,
  verifyGuestRequest,
} from "./admin.js";

const sanitizeFreeText = (value, maxLength = 250) =>
  typeof value === "string"
    ? value.trim().replace(/\s+/g, " ").slice(0, maxLength)
    : "";

const isMealPreferenceValid = (value) => value === "veg" || value === "nonveg";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJson(res, 405, {
      message: "Method not allowed.",
    });
    return;
  }

  const guestContext = await verifyGuestRequest(req, res);

  if (!guestContext) {
    return;
  }

  try {
    const body = readJsonBody(req);
    const attendance = body.attendance;
    const dietary = sanitizeFreeText(body.dietary, 250);

    if (attendance !== "yes" && attendance !== "no") {
      sendJson(res, 400, {
        message: "Attendance must be 'yes' or 'no'.",
      });
      return;
    }

    if (attendance === "yes" && !isMealPreferenceValid(body.mealPreference)) {
      sendJson(res, 400, {
        message: "Meal preference is required for attendees.",
      });
      return;
    }

    const mealPreference =
      attendance === "yes" ? body.mealPreference : null;

    await adminDb.collection("rsvps").doc(guestContext.entryId).set({
      name: guestContext.guestName,
      entryId: guestContext.entryId,
      attendance,
      mealPreference,
      dietary,
      timestamp: FieldValue.serverTimestamp(),
    });

    sendJson(res, 200, {
      ok: true,
    });
  } catch (error) {
    if (isApiError(error)) {
      sendJson(res, error.statusCode, {
        message: error.message,
      });
      return;
    }

    console.error("RSVP submission failed", error);
    sendJson(res, 500, {
      message: "We could not save your RSVP right now.",
    });
  }
}
