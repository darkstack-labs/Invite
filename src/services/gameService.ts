import {
  doc,
  getDoc,
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

const withTimestamp = <T extends Record<string, unknown>>(payload: T) => ({
  ...payload,
  timestamp: serverTimestamp() as FieldValue,
});

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
  await setDoc(doc(db, "cys_votes", payload.entryId), withTimestamp(payload));
};

export const submitMpmVote = async (
  payload: BaseSubmission & { nomineeName: string; nomineeEntryId: string }
) => {
  await setDoc(doc(db, "mpm_votes", payload.entryId), withTimestamp(payload));
};

export const submitMpfVote = async (
  payload: BaseSubmission & { nomineeName: string; nomineeEntryId: string }
) => {
  await setDoc(doc(db, "mpf_votes", payload.entryId), withTimestamp(payload));
};

export const submitBmdVote = async (
  payload: BaseSubmission & {
    male1Name: string;
    male1EntryId: string;
    male2Name: string;
    male2EntryId: string;
  }
) => {
  await setDoc(doc(db, "bmd_votes", payload.entryId), withTimestamp(payload));
};

export const submitBfdVote = async (
  payload: BaseSubmission & {
    female1Name: string;
    female1EntryId: string;
    female2Name: string;
    female2EntryId: string;
  }
) => {
  await setDoc(doc(db, "bfd_votes", payload.entryId), withTimestamp(payload));
};

export const submitSwdbitpVote = async (
  payload: BaseSubmission & { nomineeName: string; nomineeEntryId: string }
) => {
  await setDoc(
    doc(db, "swdbitp_votes", payload.entryId),
    withTimestamp(payload)
  );
};

const hasSubmitted = async (collectionName: string, entryId: string) => {
  const snap = await getDoc(doc(db, collectionName, entryId));
  return snap.exists();
};

export const getVoteSubmissionStatus = async (entryId: string) => {
  const [cys, mpm, mpf, bmd, bfd, swdbitp] = await Promise.all([
    hasSubmitted("cys_votes", entryId),
    hasSubmitted("mpm_votes", entryId),
    hasSubmitted("mpf_votes", entryId),
    hasSubmitted("bmd_votes", entryId),
    hasSubmitted("bfd_votes", entryId),
    hasSubmitted("swdbitp_votes", entryId),
  ]);

  return { cys, mpm, mpf, bmd, bfd, swdbitp };
};
