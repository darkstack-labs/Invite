import {
  doc,
  getDoc,
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
export const getSelfNominationSubmission = async (
  entryId: string
): Promise<SelfNominationSubmission | null> => {
  const submissionRef = doc(db, SELF_SUBMISSIONS_COLLECTION, entryId);
  const snapshot = await getDoc(submissionRef);

  return snapshot.exists()
    ? (snapshot.data() as SelfNominationSubmission)
    : null;
};

export const submitSelfNominationSubmission = async (
  submission: SelfNominationSubmission
) => {
  const idToken = await auth.currentUser?.getIdToken();

  if (!idToken) {
    throw new Error("AUTH_REQUIRED");
  }

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

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(payload?.message || "SELF_NOMINATION_FAILED");
  }
};

export const getVoteSubmission = async (
  collectionName: VoteCollectionName,
  entryId: string
): Promise<VoteSubmission | null> => {
  const voteRef = doc(db, collectionName, entryId);
  const snapshot = await getDoc(voteRef);

  return snapshot.exists() ? (snapshot.data() as VoteSubmission) : null;
};

export const submitVoteSubmission = async (
  collectionName: VoteCollectionName,
  submission: VoteSubmission
) => {
  const idToken = await auth.currentUser?.getIdToken();

  if (!idToken) {
    throw new Error("AUTH_REQUIRED");
  }

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

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(payload?.message || "VOTE_SUBMISSION_FAILED");
  }
};
