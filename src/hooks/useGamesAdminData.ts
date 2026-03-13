import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";

export interface SelfNominationRecord {
  id: string;
  eventName?: string;
  entryId?: string;
  name?: string;
  gender?: string;
  selectedCategories?: string[];
  timestamp?: { toDate?: () => Date };
}

export interface CysVoteRecord {
  id: string;
  eventName?: string;
  entryId?: string;
  name?: string;
  maleName?: string;
  maleEntryId?: string;
  femaleName?: string;
  femaleEntryId?: string;
  timestamp?: { toDate?: () => Date };
}

export interface SingleVoteRecord {
  id: string;
  eventName?: string;
  entryId?: string;
  name?: string;
  nomineeName?: string;
  nomineeEntryId?: string;
  timestamp?: { toDate?: () => Date };
}

export interface DuoVoteRecord {
  id: string;
  eventName?: string;
  entryId?: string;
  name?: string;
  male1Name?: string;
  male1EntryId?: string;
  male2Name?: string;
  male2EntryId?: string;
  female1Name?: string;
  female1EntryId?: string;
  female2Name?: string;
  female2EntryId?: string;
  timestamp?: { toDate?: () => Date };
}

interface GamesAdminData {
  selfNominations: SelfNominationRecord[];
  cysVotes: CysVoteRecord[];
  mpmVotes: SingleVoteRecord[];
  mpfVotes: SingleVoteRecord[];
  bmdVotes: DuoVoteRecord[];
  bfdVotes: DuoVoteRecord[];
  swdbitpVotes: SingleVoteRecord[];
}

const MAX_ROWS = 500;

const withTimestampQuery = (name: string) =>
  query(collection(db, name), orderBy("timestamp", "desc"), limit(MAX_ROWS));

export default function useGamesAdminData(): GamesAdminData {
  const [selfNominations, setSelfNominations] = useState<SelfNominationRecord[]>([]);
  const [cysVotes, setCysVotes] = useState<CysVoteRecord[]>([]);
  const [mpmVotes, setMpmVotes] = useState<SingleVoteRecord[]>([]);
  const [mpfVotes, setMpfVotes] = useState<SingleVoteRecord[]>([]);
  const [bmdVotes, setBmdVotes] = useState<DuoVoteRecord[]>([]);
  const [bfdVotes, setBfdVotes] = useState<DuoVoteRecord[]>([]);
  const [swdbitpVotes, setSwdbitpVotes] = useState<SingleVoteRecord[]>([]);

  useEffect(() => {
    const configs: Array<{
      collectionName: string;
      setter: (value: any[]) => void;
      errorLabel: string;
    }> = [
      { collectionName: "games_self_nominations", setter: setSelfNominations, errorLabel: "Self nominations" },
      { collectionName: "cys_votes", setter: setCysVotes, errorLabel: "CYS votes" },
      { collectionName: "mpm_votes", setter: setMpmVotes, errorLabel: "MPM votes" },
      { collectionName: "mpf_votes", setter: setMpfVotes, errorLabel: "MPF votes" },
      { collectionName: "bmd_votes", setter: setBmdVotes, errorLabel: "BMD votes" },
      { collectionName: "bfd_votes", setter: setBfdVotes, errorLabel: "BFD votes" },
      { collectionName: "swdbitp_votes", setter: setSwdbitpVotes, errorLabel: "SWDBITP votes" },
    ];

    const unsubs = configs.map(({ collectionName, setter, errorLabel }) =>
      onSnapshot(
        withTimestampQuery(collectionName),
        (snap) => {
          setter(
            snap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          );
        },
        (error) => {
          console.error(`${errorLabel} snapshot error:`, error);
          setter([]);
        }
      )
    );

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  return {
    selfNominations,
    cysVotes,
    mpmVotes,
    mpfVotes,
    bmdVotes,
    bfdVotes,
    swdbitpVotes,
  };
}
