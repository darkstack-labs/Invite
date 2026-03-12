import { FieldValue } from "firebase-admin/firestore";

import { adminDb, readJsonBody, sendJson, verifyGuestRequest } from "./admin.js";

const SELF_NOMINATION_CATEGORIES = [
  "mostPopularMale",
  "mostPopularFemale",
  "bestMaleDuo",
  "bestFemaleDuo",
  "bestDancer",
];

const VOTE_CONFIG = {
  "CYS VOTES": {
    title: "A Couple You Ship",
    selectionCount: 2,
  },
  "MPM VOTES": {
    title: "Most Popular Male",
    selectionCount: 1,
  },
  "MPF VOTES": {
    title: "Most Popular Female",
    selectionCount: 1,
  },
  "BMD VOTES": {
    title: "Best Male Duo",
    selectionCount: 2,
  },
  "BFD VOTES": {
    title: "Best Female Duo",
    selectionCount: 2,
  },
  "SWDBITP VOTES": {
    title: "Someone Who Doesn't Belong In This Party",
    selectionCount: 1,
  },
};

const sanitizeSelection = (value) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, 80) : "";

const validateSelections = (collectionName, selections) => {
  const config = VOTE_CONFIG[collectionName];

  if (!config) {
    return "Invalid vote collection.";
  }

  if (
    !Array.isArray(selections) ||
    selections.length !== config.selectionCount ||
    selections.some((value) => !sanitizeSelection(value))
  ) {
    return "Please complete your selections before submitting.";
  }

  if (
    (collectionName === "BMD VOTES" || collectionName === "BFD VOTES") &&
    sanitizeSelection(selections[0]) === sanitizeSelection(selections[1])
  ) {
    return "Duo votes require two different names.";
  }

  return "";
};

const isCategoryAllowedForGender = (category, guestGender) => {
  if (guestGender === "Male") {
    return category !== "mostPopularFemale" && category !== "bestFemaleDuo";
  }

  if (guestGender === "Female") {
    return category !== "mostPopularMale" && category !== "bestMaleDuo";
  }

  return true;
};

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

    if (body.kind === "selfNomination") {
      const categories = Array.isArray(body.categories)
        ? body.categories.filter((category) =>
            SELF_NOMINATION_CATEGORIES.includes(category)
          )
        : [];

      if (!categories.length) {
        sendJson(res, 400, {
          message: "Pick at least one category before submitting.",
        });
        return;
      }

      if (
        categories.some(
          (category) =>
            !isCategoryAllowedForGender(category, guestContext.guestGender)
        )
      ) {
        sendJson(res, 403, {
          message: "Those categories are not available for your guest profile.",
        });
        return;
      }

      const submissionRef = adminDb
        .collection("SELF NOMINATION SUBMISSIONS")
        .doc(guestContext.entryId);
      const existingSubmission = await submissionRef.get();

      if (existingSubmission.exists) {
        sendJson(res, 409, {
          message: "Self nominations have already been submitted.",
        });
        return;
      }

      const batch = adminDb.batch();
      const eventRef = adminDb
        .collection("GAMES EVENT CATEGORIES")
        .doc("THE WORST BATCH");
      const eventUpdates = Object.fromEntries(
        categories.map((category) => [
          category,
          FieldValue.arrayUnion(guestContext.guestName),
        ])
      );

      batch.set(submissionRef, {
        name: guestContext.guestName,
        entryId: guestContext.entryId,
        gender: guestContext.guestGender,
        categories,
        createdAt: FieldValue.serverTimestamp(),
      });

      batch.set(
        eventRef,
        {
          eventName: "THE WORST BATCH",
          updatedAt: FieldValue.serverTimestamp(),
          ...eventUpdates,
        },
        { merge: true }
      );

      await batch.commit();

      sendJson(res, 200, {
        ok: true,
      });
      return;
    }

    if (body.kind === "vote") {
      const collectionName =
        typeof body.collectionName === "string" ? body.collectionName : "";
      const validationMessage = validateSelections(
        collectionName,
        body.selections
      );

      if (validationMessage) {
        sendJson(res, 400, {
          message: validationMessage,
        });
        return;
      }

      const voteConfig = VOTE_CONFIG[collectionName];
      const selections = body.selections.map((value) => sanitizeSelection(value));
      const voteRef = adminDb
        .collection(collectionName)
        .doc(guestContext.entryId);
      const existingVote = await voteRef.get();

      if (existingVote.exists) {
        sendJson(res, 409, {
          message: "This vote has already been submitted.",
        });
        return;
      }

      await voteRef.set({
        voteTitle: voteConfig.title,
        submittedByName: guestContext.guestName,
        submittedByEntryId: guestContext.entryId,
        selections,
        createdAt: FieldValue.serverTimestamp(),
      });

      sendJson(res, 200, {
        ok: true,
      });
      return;
    }

    sendJson(res, 400, {
      message: "Invalid games action.",
    });
  } catch (error) {
    console.error("Games submission failed", error);
    sendJson(res, 500, {
      message: "We could not save your games submission right now.",
    });
  }
}
