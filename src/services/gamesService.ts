import {
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "@/firebase";

export const GAMES_EVENT_NAME = "THE WORST BATCH";

export const SELF_NOMINATION_CATEGORIES = [
  "mostPopularMale",
  "mostPopularFemale",
  "bestMaleDuo",
  "bestFemaleDuo",
  "bestDancer",
] as const;

export type SelfNominationCategory = (typeof SELF_NOMINATION_CATEGORIES)[number];

export interface SelfNominationSubmission {
  name: string;
  entryId: string;
  gender: string;
  categories: SelfNominationCategory[];
}

export const VOTE_COLLECTIONS = {
  cys: "CYS VOTES",
  mpm: "MPM VOTES",
  mpf: "MPF VOTES",
  bmd: "BMD VOTES",
  bfd: "BFD VOTES",
  swdbitp: "SWDBITP VOTES",
} as const;

export type VoteCollectionKey = keyof typeof VOTE_COLLECTIONS;
export type VoteCollectionName =
  (typeof VOTE_COLLECTIONS)[VoteCollectionKey];

export interface VoteSubmission {
  voteTitle: string;
  submittedByName: string;
  submittedByEntryId: string;
  selections: string[];
}

const SELF_SUBMISSIONS_COLLECTION = "SELF NOMINATION SUBMISSIONS";

const isFallbackEligibleStatus = (status: number) =>
  status >= 500 || status === 401 || status === 403;

const parseApiErrorMessage = async (response: Response) => {
  const payload = (await response.json().catch(() => null)) as
    | { message?: string }
    | null;

  return payload?.message || "";
};

const submitSelfNominationViaClient = async (
  submission: SelfNominationSubmission
) => {
  const submissionRef = doc(db, SELF_SUBMISSIONS_COLLECTION, submission.entryId);
  const existingSubmission = await getDoc(submissionRef);

  if (existingSubmission.exists()) {
    throw new Error("Your self nominations are already locked in.");
  }

  await setDoc(submissionRef, {
    ...submission,
    createdAt: serverTimestamp(),
  });

  await setDoc(
    doc(db, "GAMES EVENT CATEGORIES", GAMES_EVENT_NAME),
    {
      eventName: GAMES_EVENT_NAME,
      updatedAt: serverTimestamp(),
      ...Object.fromEntries(
        submission.categories.map((category) => [category, arrayUnion(submission.name)])
      ),
    },
    { merge: true }
  );
};

const submitVoteViaClient = async (
  collectionName: VoteCollectionName,
  submission: VoteSubmission
) => {
  const voteRef = doc(db, collectionName, submission.submittedByEntryId);
  const existingSubmission = await getDoc(voteRef);

  if (existingSubmission.exists()) {
    throw new Error("This vote has already been submitted.");
  }

  await setDoc(voteRef, {
    ...submission,
    createdAt: serverTimestamp(),
  });
};

export const getSelfNominationSubmission = async (
  entryId: string
): Promise<SelfNominationSubmission | null> => {
  try {
    const submissionRef = doc(db, SELF_SUBMISSIONS_COLLECTION, entryId);
    const snapshot = await getDoc(submissionRef);

    return snapshot.exists()
      ? (snapshot.data() as SelfNominationSubmission)
      : null;
  } catch (error) {
    console.warn("Unable to load self nomination submission", error);
    return null;
  }
};

export const submitSelfNominationSubmission = async (
  submission: SelfNominationSubmission
) => {
  const idToken = await auth.currentUser?.getIdToken();

  if (!idToken) {
    return submitSelfNominationViaClient(submission);
  }

  try {
    const response = await fetch("/api/games", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        kind: "selfNomination",
        categories: submission.categories,
      }),
    });

    if (response.ok) {
      return;
    }

    const message = await parseApiErrorMessage(response);

    if (isFallbackEligibleStatus(response.status)) {
      return submitSelfNominationViaClient(submission);
    }

    throw new Error(message || "SELF_NOMINATION_FAILED");
  } catch (error) {
    if (error instanceof Error && error.message !== "SELF_NOMINATION_FAILED") {
      const loweredMessage = error.message.toLowerCase();

      if (
        loweredMessage.includes("failed to fetch") ||
        loweredMessage.includes("network") ||
        loweredMessage.includes("auth_required")
      ) {
        return submitSelfNominationViaClient(submission);
      }
    }

    throw error;
  }
};

export const getVoteSubmission = async (
  collectionName: VoteCollectionName,
  entryId: string
): Promise<VoteSubmission | null> => {
  try {
    const voteRef = doc(db, collectionName, entryId);
    const snapshot = await getDoc(voteRef);

    return snapshot.exists() ? (snapshot.data() as VoteSubmission) : null;
  } catch (error) {
    console.warn(`Unable to load vote submission for ${collectionName}`, error);
    return null;
  }
};

export const submitVoteSubmission = async (
  collectionName: VoteCollectionName,
  submission: VoteSubmission
) => {
  const idToken = await auth.currentUser?.getIdToken();

  if (!idToken) {
    return submitVoteViaClient(collectionName, submission);
  }

  try {
    const response = await fetch("/api/games", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        kind: "vote",
        collectionName,
        voteTitle: submission.voteTitle,
        selections: submission.selections,
      }),
    });

    if (response.ok) {
      return;
    }

    const message = await parseApiErrorMessage(response);

    if (isFallbackEligibleStatus(response.status)) {
      return submitVoteViaClient(collectionName, submission);
    }

    throw new Error(message || "VOTE_SUBMISSION_FAILED");
  } catch (error) {
    if (error instanceof Error && error.message !== "VOTE_SUBMISSION_FAILED") {
      const loweredMessage = error.message.toLowerCase();

      if (
        loweredMessage.includes("failed to fetch") ||
        loweredMessage.includes("network") ||
        loweredMessage.includes("auth_required")
      ) {
        return submitVoteViaClient(collectionName, submission);
      }
    }

    throw error;
  }
};
