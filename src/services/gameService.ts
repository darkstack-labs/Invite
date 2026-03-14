import {
  doc,
  type FirestoreError,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
  type FieldValue,
} from "firebase/firestore";
import { db } from "@/firebase";

export const GAMES_EVENT_NAME = "The Worst Batch Signing Off 2026";

export type NominationCategory =
  | "most_popular_male"
  | "most_popular_female"
  | "best_male_duo"
  | "best_female_duo"
  | "best_dancer";

type BaseSubmission = {
  eventName: string;
  entryId: string;
  name: string;
};

export type VoteKey = "cys" | "mpm" | "mpf" | "bmd" | "bfd" | "swdbitp";

export type VoteSubmissionStatus = Record<VoteKey, number>;

const MAX_VOTE_SUBMISSIONS_PER_CATEGORY = 3;
const TX_MAX_ATTEMPTS = 2;

const voteCollectionByKey: Record<VoteKey, string> = {
  cys: "cys_votes",
  mpm: "mpm_votes",
  mpf: "mpf_votes",
  bmd: "bmd_votes",
  bfd: "bfd_votes",
  swdbitp: "swdbitp_votes",
};

const withTimestamp = <T extends Record<string, unknown>>(payload: T) => ({
  ...payload,
  timestamp: serverTimestamp() as FieldValue,
});

const isResourceExhausted = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  (error as FirestoreError).code === "resource-exhausted";

export const submitSelfNominations = async (
  payload: BaseSubmission & { gender: string; selectedCategories: NominationCategory[] }
) => {
  await setDoc(
    doc(db, "games_self_nominations", payload.entryId),
    withTimestamp(payload)
  );
};

export const hasSubmittedSelfNominations = async (entryId: string) => {
  const snap = await getDoc(doc(db, "games_self_nominations", entryId));
  return snap.exists();
};

export const submitCysVote = async (
  payload: BaseSubmission & {
    maleName: string;
    maleEntryId: string;
    femaleName: string;
    femaleEntryId: string;
  }
) => {
  await submitVoteWithLimit("cys", payload);
};

export const submitMpmVote = async (
  payload: BaseSubmission & { nomineeName: string; nomineeEntryId: string }
) => {
  await submitVoteWithLimit("mpm", payload);
};

export const submitMpfVote = async (
  payload: BaseSubmission & { nomineeName: string; nomineeEntryId: string }
) => {
  await submitVoteWithLimit("mpf", payload);
};

export const submitBmdVote = async (
  payload: BaseSubmission & {
    male1Name: string;
    male1EntryId: string;
    male2Name: string;
    male2EntryId: string;
  }
) => {
  await submitVoteWithLimit("bmd", payload);
};

export const submitBfdVote = async (
  payload: BaseSubmission & {
    female1Name: string;
    female1EntryId: string;
    female2Name: string;
    female2EntryId: string;
  }
) => {
  await submitVoteWithLimit("bfd", payload);
};

export const submitSwdbitpVote = async (
  payload: BaseSubmission & { nomineeName: string; nomineeEntryId: string }
) => {
  await submitVoteWithLimit("swdbitp", payload);
};

export const getVoteSubmissionStatus = async (entryId: string) => {
  const counterSnap = await getDoc(doc(db, "games_vote_counters", entryId));
  if (!counterSnap.exists()) {
    return {
      cys: 0,
      mpm: 0,
      mpf: 0,
      bmd: 0,
      bfd: 0,
      swdbitp: 0,
    };
  }

  const data = counterSnap.data() as Partial<VoteSubmissionStatus>;

  return {
    cys: Math.min(Number(data.cys ?? 0), MAX_VOTE_SUBMISSIONS_PER_CATEGORY),
    mpm: Math.min(Number(data.mpm ?? 0), MAX_VOTE_SUBMISSIONS_PER_CATEGORY),
    mpf: Math.min(Number(data.mpf ?? 0), MAX_VOTE_SUBMISSIONS_PER_CATEGORY),
    bmd: Math.min(Number(data.bmd ?? 0), MAX_VOTE_SUBMISSIONS_PER_CATEGORY),
    bfd: Math.min(Number(data.bfd ?? 0), MAX_VOTE_SUBMISSIONS_PER_CATEGORY),
    swdbitp: Math.min(Number(data.swdbitp ?? 0), MAX_VOTE_SUBMISSIONS_PER_CATEGORY),
  };
};

const submitVoteWithLimit = async <T extends BaseSubmission & Record<string, unknown>>(
  voteKey: VoteKey,
  payload: T
) => {
  const counterRef = doc(db, "games_vote_counters", payload.entryId);
  const voteRef = doc(db, voteCollectionByKey[voteKey], payload.entryId);

  try {
    await runTransaction(
      db,
      async (tx) => {
        const counterSnap = await tx.get(counterRef);
        const counterData = (counterSnap.exists()
          ? (counterSnap.data() as Partial<VoteSubmissionStatus>)
          : {}) as Partial<VoteSubmissionStatus>;

        const currentCount = Number(counterData[voteKey] ?? 0);
        if (currentCount >= MAX_VOTE_SUBMISSIONS_PER_CATEGORY) {
          throw new Error("Vote change limit reached. You cannot change this vote anymore.");
        }

        const nextCount = currentCount + 1;
        tx.set(counterRef, {
          [voteKey]: nextCount,
          updatedAt: serverTimestamp(),
        }, { merge: true });

        tx.set(voteRef, withTimestamp({
          ...payload,
          submissionCount: nextCount,
          changesUsed: Math.max(nextCount - 1, 0),
        }));
      },
      { maxAttempts: TX_MAX_ATTEMPTS }
    );
  } catch (error) {
    if (isResourceExhausted(error)) {
      throw new Error("Too many requests right now. Please wait 15-30 seconds and try again.");
    }

    throw error;
  }
};
