import { doc, getDoc } from "firebase/firestore";

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

const parseApiErrorMessage = async (response: Response) => {
  const payload = (await response.json().catch(() => null)) as
    | { message?: string }
    | null;

  return payload?.message || "";
};

const getGuestIdToken = async () => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("Your invite session expired. Please log in again.");
  }

  return currentUser.getIdToken();
};

const postGamesAction = async (payload: Record<string, unknown>) => {
  const idToken = await getGuestIdToken();
  const response = await fetch("/api/games", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    return;
  }

  const message = await parseApiErrorMessage(response);
  throw new Error(message || "We could not save your games submission.");
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
  await postGamesAction({
    kind: "selfNomination",
    categories: submission.categories,
  });
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
  await postGamesAction({
    kind: "vote",
    collectionName,
    voteTitle: submission.voteTitle,
    selections: submission.selections,
  });
};
