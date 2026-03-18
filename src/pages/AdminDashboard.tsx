import { useState, useMemo, useEffect, type CSSProperties } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import AdminStats from "../components/admin/AdminStats";
import RSVPTable from "../components/admin/RSPVTable";
import SongsTable from "../components/admin/SongsTable";
import SuggestionsTable from "../components/admin/SuggestionsTable";

import useRSVPs from "../hooks/useRSPVs";
import useSongs from "../hooks/useSongs";
import useSuggestions from "../hooks/useSuggestions";
import useActivityLogs from "../hooks/useActivityLogs";
import useGamesAdminData from "../hooks/useGamesAdminData";
import { useIsMobile } from "@/hooks/useDeviceType";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  blockDevice,
  blockEntry,
  subscribeBlockedDevices,
  subscribeBlockedEntries,
  unblockDevice,
  unblockEntry
} from "@/services/blockService";
import {
  DEFAULT_WARNING_MESSAGE,
  clearGuestWarning,
  sendGuestWarning,
  subscribeGuestWarnings,
  type GuestWarningRecord
} from "@/services/warningService";
import { toast } from "sonner";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import { db, ensureAnonymousAuth } from "@/firebase";
import { guests, useAuth } from "@/contexts/AuthContext";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

interface RSVP {
  id?: string;
  name?: string;
  entryId?: string;
  attendance?: "yes" | "no";
  mealPreference?: "veg" | "nonveg";
}

const ADMIN_PASSWORD = "randiokimehfil";
const ADMIN_ACTOR = "admin";
const SUPER_ADMIN_ENTRY_ID = "220422";
type Section =
  | "overview"
  | "rsvps"
  | "songs"
  | "suggestions"
  | "activity"
  | "device_watch"
  | "games"
  | "games_monitor";

interface ActivityLog {
  id?: string;
  type?: string;
  name?: string;
  entryId?: string;
  deviceId?: string;
  details?: string;
  clientTime?: string;
  timestamp?: { toDate?: () => Date };
}

interface DeviceSummary {
  deviceId: string;
  accounts: string[];
  names: string[];
  accountPairs: Array<{ entryId: string; name: string }>;
  events: number;
}

const nominationCategoryLabels: Record<string, string> = {
  most_popular_male: "Most Popular Male",
  most_popular_female: "Most Popular Female",
  best_male_duo: "Best Male Duo",
  best_female_duo: "Best Female Duo",
  best_dancer: "Best Dancer"
};

const chartPalette = ["#ffd57a", "#f5b000", "#ff8c42", "#f87171", "#60a5fa", "#a78bfa", "#34d399"];

type DrillRow = {
  voterName: string;
  voterEntryId: string;
  selection: string;
  submittedAt: string;
};

type GameCategory = "self" | "cys" | "mpm" | "mpf" | "bmd" | "bfd" | "swdbitp";

type NormalizedGameRow = {
  id: string;
  category: GameCategory;
  categoryLabel: string;
  voterName: string;
  voterEntryId: string;
  selection: string;
  submittedAtText: string;
  submittedAtDate: Date | null;
};

type GovernanceState = {
  finalized: boolean;
  finalizedAt?: string;
  finalizedBy?: string;
  signature?: string;
  archiveMode: boolean;
};

type AuditLog = {
  id: string;
  action?: string;
  actor?: string;
  details?: string;
  timestamp?: { toDate?: () => Date };
};

type AdminRoleDoc = {
  id: string;
  entryId?: string;
  role?: "admin";
  addedBy?: string;
  timestamp?: { toDate?: () => Date };
};

export default function AdminDashboard(): JSX.Element {
  const { user } = useAuth();

  /* ---------------- STATE ---------------- */

  const [activeSection, setActiveSection] = useState<Section>("overview");

  /* ---------------- DATA HOOKS ---------------- */

  const rsvps = useRSVPs() ?? [];
  const songs = useSongs() ?? [];
  const suggestions = useSuggestions() ?? [];
  const activityLogs = useActivityLogs() ?? [];
  const {
    selfNominations,
    cysVotes,
    mpmVotes,
    mpfVotes,
    bmdVotes,
    bfdVotes,
    swdbitpVotes
  } = useGamesAdminData(activeSection === "games" || activeSection === "games_monitor");

  /* ---------------- STATE ---------------- */

  const [search, setSearch] = useState<string>("");

  const [authenticated, setAuthenticated] = useState<boolean>(
    localStorage.getItem("admin-auth") === "true"
  );
  const [adminSessionEntryId, setAdminSessionEntryId] = useState<string>(
    localStorage.getItem("admin-auth") === "true"
      ? localStorage.getItem("admin-entry-id")?.trim() ?? ""
      : ""
  );
  const [loginEntryId, setLoginEntryId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [blockedDeviceIds, setBlockedDeviceIds] = useState<Set<string>>(new Set());
  const [blockedEntryIds, setBlockedEntryIds] = useState<Set<string>>(new Set());
  const [guestWarnings, setGuestWarnings] = useState<Map<string, GuestWarningRecord>>(new Map());
  const [gamesView, setGamesView] = useState<"analytics" | "tables">("analytics");
  const [gamesCategoryFilter, setGamesCategoryFilter] = useState<"all" | GameCategory>("all");
  const [gamesSearch, setGamesSearch] = useState("");
  const [gamesStartDate, setGamesStartDate] = useState("");
  const [gamesEndDate, setGamesEndDate] = useState("");
  const [activityVisibleCount, setActivityVisibleCount] = useState<number>(120);
  const [downloadFormat, setDownloadFormat] = useState<"excel" | "pdf">("excel");
  const [drillDownloadFormat, setDrillDownloadFormat] = useState<"excel" | "pdf">("excel");
  const [drillSearch, setDrillSearch] = useState("");
  const [governanceSignature, setGovernanceSignature] = useState("");
  const [governanceState, setGovernanceState] = useState<GovernanceState>({
    finalized: false,
    archiveMode: false
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditVisibleCount, setAuditVisibleCount] = useState<number>(60);
  const [adminRoles, setAdminRoles] = useState<AdminRoleDoc[]>([]);
  const [newAdminEntryId, setNewAdminEntryId] = useState("");
  const [drilldown, setDrilldown] = useState<{ title: string; rows: DrillRow[] } | null>(null);
  const isMobile = useIsMobile();
  const entryNameMap = useMemo(() => {
    const pairs = Object.entries(guests).map(([name, entryId]) => [entryId, name]);
    return Object.fromEntries(pairs) as Record<string, string>;
  }, []);
  const contextEntryId = user?.entryId ?? localStorage.getItem("batchPartyUser")?.trim() ?? "";
  const currentEntryId = adminSessionEntryId || contextEntryId;
  const adminRoleMap = useMemo(
    () => Object.fromEntries(adminRoles.map((r) => [r.entryId ?? "", r.role ?? "admin"])) as Record<string, "admin">,
    [adminRoles]
  );
  const isSuperAdmin = currentEntryId === SUPER_ADMIN_ENTRY_ID;
  const isAdmin = isSuperAdmin || !!adminRoleMap[currentEntryId];
  const authBadge = isSuperAdmin ? "Super Admin" : isAdmin ? "Admin" : "Viewer";
  const overviewGridStyle = isMobile ? mobileOverviewGrid : overviewGrid;
  const panelStyle = isMobile ? mobilePanel : panel;
  const activityTableStyle = isMobile ? mobileActivityTable : activityTable;
  const controlsStyle = isMobile ? mobileControls : controls;
  const chipWrapStyle = isMobile ? mobileChipWrap : chipWrap;
  const searchInputStyle = isMobile ? mobileSearchInput : searchInput;

  const mobileOverviewGrid = { ...overviewGrid, gridTemplateColumns: "1fr", gap: 12 };
  const mobilePanel = { ...panel, padding: 12 };
  const mobileActivityTable = { ...activityTable, minWidth: 640 };
  const mobileControls = { ...controls, flexWrap: "wrap", width: "100%", gap: 8 };
  const mobileChipWrap = { ...chipWrap, flexDirection: "column", alignItems: "stretch", gap: 8 };
  const mobileSearchInput = { ...searchInput, maxWidth: "100%", padding: "9px 10px", fontSize: 13 };
  const mobileFilterGrid = { ...gamesFilterGrid, gridTemplateColumns: "1fr", gap: 10 };
  const mobileStack = { display: "grid", gap: 12 };
  const filterGridStyle = isMobile ? mobileFilterGrid : gamesFilterGrid;

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === "object" && error !== null) {
      const maybeCode = (error as { code?: string }).code;
      const maybeMessage = (error as { message?: string }).message;
      if (typeof maybeCode === "string" && maybeCode.length > 0) {
        return `${fallback} (${maybeCode})`;
      }
      if (typeof maybeMessage === "string" && maybeMessage.length > 0) {
        return `${fallback}: ${maybeMessage}`;
      }
    }
    return fallback;
  };

  /* ---------------- DERIVED DATA ---------------- */

  const filteredGuests = useMemo(() => {
    return rsvps.filter((g: RSVP) =>
      (g?.name ?? "").toLowerCase().includes(search.toLowerCase())
    );
  }, [rsvps, search]);

  const stats = useMemo(() => {
    return {
      total: rsvps.length,
      attending: rsvps.filter((r: RSVP) => r.attendance === "yes").length,
      veg: rsvps.filter((r: RSVP) => r.mealPreference === "veg").length,
      nonVeg: rsvps.filter((r: RSVP) => r.mealPreference === "nonveg").length,
    };
  }, [rsvps]);

  const recentRSVPs = useMemo(() => filteredGuests.slice(0, 6), [filteredGuests]);
  const recentSongs = useMemo(() => songs.slice(0, 6), [songs]);
  const recentSuggestions = useMemo(() => suggestions.slice(0, 4), [suggestions]);

  const suspiciousDevices = useMemo(() => {
    const deviceMap = new Map<string, { entryIds: Set<string>; names: Set<string>; accountPairs: Map<string, string>; events: number }>();

    activityLogs.forEach((log: ActivityLog) => {
      const deviceId = log.deviceId ?? "unknown-device";
      const found = deviceMap.get(deviceId) ?? {
        entryIds: new Set<string>(),
        names: new Set<string>(),
        accountPairs: new Map<string, string>(),
        events: 0
      };

      if (log.entryId) {
        const resolvedName = entryNameMap[log.entryId] ?? log.name ?? log.entryId;
        found.entryIds.add(log.entryId);
        found.names.add(resolvedName);
        found.accountPairs.set(log.entryId, resolvedName);
      }
      found.events += 1;
      deviceMap.set(deviceId, found);
    });

    return Array.from(deviceMap.entries())
      .map(([deviceId, data]) => ({
        deviceId,
        accounts: Array.from(data.entryIds),
        names: Array.from(data.names),
        accountPairs: Array.from(data.accountPairs.entries()).map(([entryId, name]) => ({ entryId, name })),
        events: data.events
      }) as DeviceSummary)
      .filter((d) => d.accounts.length > 1)
      .sort((a, b) => b.accounts.length - a.accounts.length || b.events - a.events);
  }, [activityLogs, entryNameMap]);

  const allDevices = useMemo(() => {
    const deviceMap = new Map<string, { entryIds: Set<string>; names: Set<string>; accountPairs: Map<string, string>; events: number }>();

    activityLogs.forEach((log: ActivityLog) => {
      const deviceId = log.deviceId ?? "unknown-device";
      const found = deviceMap.get(deviceId) ?? {
        entryIds: new Set<string>(),
        names: new Set<string>(),
        accountPairs: new Map<string, string>(),
        events: 0
      };

      if (log.entryId) {
        const resolvedName = entryNameMap[log.entryId] ?? log.name ?? log.entryId;
        found.entryIds.add(log.entryId);
        found.names.add(resolvedName);
        found.accountPairs.set(log.entryId, resolvedName);
      }
      found.events += 1;
      deviceMap.set(deviceId, found);
    });

    return Array.from(deviceMap.entries())
      .map(([deviceId, data]) => ({
        deviceId,
        accounts: Array.from(data.entryIds),
        names: Array.from(data.names),
        accountPairs: Array.from(data.accountPairs.entries()).map(([entryId, name]) => ({ entryId, name })),
        events: data.events
      }) as DeviceSummary)
      .sort((a, b) => b.events - a.events);
  }, [activityLogs, entryNameMap]);

  const suspiciousEvents = useMemo(() => {
    const suspiciousSet = new Set(suspiciousDevices.map((d) => d.deviceId));
    return activityLogs
      .filter((log: ActivityLog) => suspiciousSet.has(log.deviceId ?? "unknown-device"))
      .slice(0, 12);
  }, [activityLogs, suspiciousDevices]);

  const allGameRows = useMemo<NormalizedGameRow[]>(() => {
    const rows: NormalizedGameRow[] = [];

    selfNominations.forEach((record: any) => {
      const selected = Array.isArray(record?.selectedCategories) ? record.selectedCategories : [];
      selected.forEach((categoryKey: string, index: number) => {
        rows.push({
          id: `${record.id}-${categoryKey}-${index}`,
          category: "self",
          categoryLabel: "Self Nomination",
          voterName: record?.name ?? "Unknown",
          voterEntryId: record?.entryId ?? "-",
          selection: nominationCategoryLabels[categoryKey] ?? categoryKey,
          submittedAtText: formatGameTime(record),
          submittedAtDate: getRecordDate(record)
        });
      });
    });

    cysVotes.forEach((row: any) =>
      rows.push({
        id: row.id,
        category: "cys",
        categoryLabel: "A Couple You Ship",
        voterName: row?.name ?? "Unknown",
        voterEntryId: row?.entryId ?? "-",
        selection: `${canonicalGuestName(row?.maleName, row?.maleEntryId, entryNameMap)} + ${canonicalGuestName(row?.femaleName, row?.femaleEntryId, entryNameMap)}`,
        submittedAtText: formatGameTime(row),
        submittedAtDate: getRecordDate(row)
      })
    );

    mpmVotes.forEach((row: any) =>
      rows.push({
        id: row.id,
        category: "mpm",
        categoryLabel: "Most Popular Male",
        voterName: row?.name ?? "Unknown",
        voterEntryId: row?.entryId ?? "-",
        selection: canonicalGuestName(row?.nomineeName, row?.nomineeEntryId, entryNameMap),
        submittedAtText: formatGameTime(row),
        submittedAtDate: getRecordDate(row)
      })
    );

    mpfVotes.forEach((row: any) =>
      rows.push({
        id: row.id,
        category: "mpf",
        categoryLabel: "Most Popular Female",
        voterName: row?.name ?? "Unknown",
        voterEntryId: row?.entryId ?? "-",
        selection: canonicalGuestName(row?.nomineeName, row?.nomineeEntryId, entryNameMap),
        submittedAtText: formatGameTime(row),
        submittedAtDate: getRecordDate(row)
      })
    );

    bmdVotes.forEach((row: any) =>
      rows.push({
        id: row.id,
        category: "bmd",
        categoryLabel: "Best Male Duo",
        voterName: row?.name ?? "Unknown",
        voterEntryId: row?.entryId ?? "-",
        selection: normalizeDuoPair(
          row?.male1Name,
          row?.male1EntryId,
          row?.male2Name,
          row?.male2EntryId,
          entryNameMap
        ),
        submittedAtText: formatGameTime(row),
        submittedAtDate: getRecordDate(row)
      })
    );

    bfdVotes.forEach((row: any) =>
      rows.push({
        id: row.id,
        category: "bfd",
        categoryLabel: "Best Female Duo",
        voterName: row?.name ?? "Unknown",
        voterEntryId: row?.entryId ?? "-",
        selection: normalizeDuoPair(
          row?.female1Name,
          row?.female1EntryId,
          row?.female2Name,
          row?.female2EntryId,
          entryNameMap
        ),
        submittedAtText: formatGameTime(row),
        submittedAtDate: getRecordDate(row)
      })
    );

    swdbitpVotes.forEach((row: any) =>
      rows.push({
        id: row.id,
        category: "swdbitp",
        categoryLabel: "Someone Who Doesn't Belong",
        voterName: row?.name ?? "Unknown",
        voterEntryId: row?.entryId ?? "-",
        selection: canonicalGuestName(row?.nomineeName, row?.nomineeEntryId, entryNameMap),
        submittedAtText: formatGameTime(row),
        submittedAtDate: getRecordDate(row)
      })
    );

    return rows;
  }, [selfNominations, cysVotes, mpmVotes, mpfVotes, bmdVotes, bfdVotes, swdbitpVotes, entryNameMap]);

  const filteredGameRows = useMemo(() => {
    const searchQuery = gamesSearch.trim().toLowerCase();
    const start = gamesStartDate ? new Date(`${gamesStartDate}T00:00:00`) : null;
    const end = gamesEndDate ? new Date(`${gamesEndDate}T23:59:59`) : null;

    return allGameRows.filter((row) => {
      if (gamesCategoryFilter !== "all" && row.category !== gamesCategoryFilter) return false;
      if (searchQuery) {
        const haystack = `${row.voterName} ${row.voterEntryId} ${row.selection}`.toLowerCase();
        if (!haystack.includes(searchQuery)) return false;
      }
      if (start && (!row.submittedAtDate || row.submittedAtDate < start)) return false;
      if (end && (!row.submittedAtDate || row.submittedAtDate > end)) return false;
      return true;
    });
  }, [allGameRows, gamesCategoryFilter, gamesSearch, gamesStartDate, gamesEndDate]);

  const nominationGroups = useMemo(() => {
    const base: Record<string, string[]> = {
      most_popular_male: [],
      most_popular_female: [],
      best_male_duo: [],
      best_female_duo: [],
      best_dancer: []
    };

    filteredGameRows
      .filter((row) => row.category === "self")
      .forEach((row) => {
        const key = Object.entries(nominationCategoryLabels)
          .find(([, label]) => label === row.selection)?.[0];
        if (key && base[key]) base[key].push(row.voterName);
      });

    return base;
  }, [filteredGameRows]);

  const rowsByCategory = useMemo(() => {
    return {
      cys: filteredGameRows.filter((row) => row.category === "cys"),
      mpm: filteredGameRows.filter((row) => row.category === "mpm"),
      mpf: filteredGameRows.filter((row) => row.category === "mpf"),
      bmd: filteredGameRows.filter((row) => row.category === "bmd"),
      bfd: filteredGameRows.filter((row) => row.category === "bfd"),
      swdbitp: filteredGameRows.filter((row) => row.category === "swdbitp")
    };
  }, [filteredGameRows]);

  const gamesStats = useMemo(() => {
    const inviteeCount = Object.keys(guests).length;
    const uniqueVoters = new Set<string>();
    filteredGameRows.forEach((row) => uniqueVoters.add(row.voterEntryId));

    const makeSummary = (rows: NormalizedGameRow[]) => {
      const counts = new Map<string, number>();
      const votersBySelection = new Map<string, DrillRow[]>();
      rows.forEach((row) => {
        if (!row.selection || row.selection === "-") return;
        counts.set(row.selection, (counts.get(row.selection) ?? 0) + 1);
        const voters = votersBySelection.get(row.selection) ?? [];
        voters.push({
          voterName: row.voterName,
          voterEntryId: row.voterEntryId,
          selection: row.selection,
          submittedAt: row.submittedAtText
        });
        votersBySelection.set(row.selection, voters);
      });
      const ranking = Array.from(counts.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
      return { ranking, votersBySelection };
    };

    const selfNominationCounts = Object.entries(nominationGroups).map(([key, names]) => ({
      name: nominationCategoryLabels[key] ?? key,
      value: names.length
    }));

    return {
      inviteeCount,
      uniqueVoterCount: uniqueVoters.size,
      participationRate: inviteeCount > 0 ? Math.round((uniqueVoters.size / inviteeCount) * 100) : 0,
      selfNominationCounts,
      categories: {
        cys: makeSummary(rowsByCategory.cys),
        mpm: makeSummary(rowsByCategory.mpm),
        mpf: makeSummary(rowsByCategory.mpf),
        bmd: makeSummary(rowsByCategory.bmd),
        bfd: makeSummary(rowsByCategory.bfd),
        swdbitp: makeSummary(rowsByCategory.swdbitp)
      }
    };
  }, [filteredGameRows, nominationGroups, rowsByCategory]);

  const suspiciousVoteInsights = useMemo(() => {
    const suspiciousDominance = Object.entries(gamesStats.categories).flatMap(([key, summary]) => {
      const totalVotes = summary.ranking.reduce((sum, item) => sum + item.value, 0);
      if (totalVotes < 5 || summary.ranking.length === 0) return [];
      const top = summary.ranking[0];
      const share = Math.round((top.value / totalVotes) * 100);
      if (share < 45) return [];
      return [{
        id: `dom-${key}`,
        title: `${key.toUpperCase()} concentration`,
        detail: `${top.name} has ${top.value}/${totalVotes} votes (${share}%)`
      }];
    });

    const voterBuckets = new Map<string, NormalizedGameRow[]>();
    filteredGameRows.forEach((row) => {
      const list = voterBuckets.get(row.voterEntryId) ?? [];
      list.push(row);
      voterBuckets.set(row.voterEntryId, list);
    });

    const rapidVoters = Array.from(voterBuckets.values())
      .map((rows) => rows
        .filter((row) => row.submittedAtDate)
        .sort((a, b) => (a.submittedAtDate?.getTime() ?? 0) - (b.submittedAtDate?.getTime() ?? 0))
      )
      .filter((rows) => rows.length >= 4)
      .filter((rows) => {
        const first = rows[0].submittedAtDate?.getTime() ?? 0;
        const fourth = rows[3].submittedAtDate?.getTime() ?? 0;
        return fourth - first <= 2 * 60 * 1000;
      })
      .map((rows) => ({
        id: `rapid-${rows[0].voterEntryId}`,
        title: "Rapid multi-category voting",
        detail: `${rows[0].voterName} submitted 4+ votes within 2 minutes`
      }));

    return [...suspiciousDominance, ...rapidVoters].slice(0, 8);
  }, [filteredGameRows, gamesStats.categories]);

  const drilldownFilteredRows = useMemo(() => {
    if (!drilldown) return [];
    const q = drillSearch.trim().toLowerCase();
    if (!q) return drilldown.rows;
    return drilldown.rows.filter((row) =>
      `${row.voterName} ${row.voterEntryId} ${row.selection}`.toLowerCase().includes(q)
    );
  }, [drilldown, drillSearch]);

  const drillTopVoters = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    drilldownFilteredRows.forEach((row) => {
      const key = row.voterEntryId;
      const found = map.get(key) ?? { name: row.voterName, count: 0 };
      found.count += 1;
      map.set(key, found);
    });
    return Array.from(map.entries())
      .map(([entryId, value]) => ({ entryId, ...value }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [drilldownFilteredRows]);

  useEffect(() => {
    let unsubEntries = () => {};
    let unsubDevices = () => {};
    let unsubWarnings = () => {};
    let cancelled = false;

    ensureAnonymousAuth()
      .then(() => {
        if (cancelled) return;
        unsubEntries = subscribeBlockedEntries(setBlockedEntryIds);
        unsubDevices = subscribeBlockedDevices(setBlockedDeviceIds);
        unsubWarnings = subscribeGuestWarnings(setGuestWarnings);
      })
      .catch((error) => {
        console.error("Admin moderation subscriptions failed", error);
        toast.error(getErrorMessage(error, "Failed to sync admin controls"));
      });

    return () => {
      cancelled = true;
      unsubEntries();
      unsubDevices();
      unsubWarnings();
    };
  }, []);

  useEffect(() => {
    if (activeSection !== "games" && activeSection !== "games_monitor") return;

    let unsubControl = () => {};
    let unsubAudit = () => {};
    let cancelled = false;

    ensureAnonymousAuth()
      .then(() => {
        if (cancelled) return;
        const controlsRef = doc(db, "adminControls", "gamesResults");
        unsubControl = onSnapshot(controlsRef, (snap) => {
          if (!snap.exists()) {
            setGovernanceState({ finalized: false, archiveMode: false });
            return;
          }
          const data = snap.data() as GovernanceState;
          setGovernanceState({
            finalized: !!data.finalized,
            finalizedAt: data.finalizedAt,
            finalizedBy: data.finalizedBy,
            signature: data.signature,
            archiveMode: !!data.archiveMode
          });
        });

        const q = query(
          collection(db, "adminAuditLogs"),
          orderBy("timestamp", "desc")
        );
        unsubAudit = onSnapshot(q, (snap) => {
          const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as AuditLog[];
          setAuditLogs(rows);
        });
      })
      .catch((error) => {
        console.error("Admin monitor subscriptions failed", error);
        toast.error(getErrorMessage(error, "Failed to sync admin monitor"));
      });

    return () => {
      cancelled = true;
      unsubControl();
      unsubAudit();
    };
  }, [activeSection]);

  useEffect(() => {
    let unsub = () => {};
    let cancelled = false;

    ensureAnonymousAuth()
      .then(() => {
        if (cancelled) return;
        const q = query(collection(db, "adminRoles"), orderBy("timestamp", "desc"), limit(80));
        unsub = onSnapshot(q, (snap) => {
          const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as AdminRoleDoc[];
          setAdminRoles(rows);
        });
      })
      .catch((error) => {
        console.error("Admin roles subscription failed", error);
        toast.error(getErrorMessage(error, "Failed to load admin roles"));
      });

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    const storedEntryId = localStorage.getItem("admin-entry-id")?.trim() ?? "";
    if (!storedEntryId) {
      localStorage.removeItem("admin-auth");
      setAuthenticated(false);
      setAdminSessionEntryId("");
      toast.error("Admin session expired. Please log in again.");
      return;
    }
    if (storedEntryId !== adminSessionEntryId) {
      setAdminSessionEntryId(storedEntryId);
    }
  }, [authenticated, adminSessionEntryId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("gview");
    const category = params.get("gcat") as "all" | GameCategory | null;
    const q = params.get("gq");
    const start = params.get("gstart");
    const end = params.get("gend");

    if (view === "analytics" || view === "tables") setGamesView(view);
    if (category) setGamesCategoryFilter(category);
    if (q) setGamesSearch(q);
    if (start) setGamesStartDate(start);
    if (end) setGamesEndDate(end);
  }, []);

  useEffect(() => {
    if (activeSection !== "games" && activeSection !== "games_monitor") return;
    const params = new URLSearchParams(window.location.search);
    params.set("gview", gamesView);
    params.set("gcat", gamesCategoryFilter);
    if (gamesSearch) params.set("gq", gamesSearch); else params.delete("gq");
    if (gamesStartDate) params.set("gstart", gamesStartDate); else params.delete("gstart");
    if (gamesEndDate) params.set("gend", gamesEndDate); else params.delete("gend");
    const queryString = params.toString();
    const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}`;
    window.history.replaceState({}, "", nextUrl);
  }, [activeSection, gamesView, gamesCategoryFilter, gamesSearch, gamesStartDate, gamesEndDate]);

  const handleToggleDeviceBlock = async (deviceId: string) => {
    if (!isAdmin) {
      toast.error("Admin access required");
      return;
    }
    try {
      if (blockedDeviceIds.has(deviceId)) {
        await unblockDevice(deviceId);
        toast.success("Device unblocked");
      } else {
        await blockDevice(deviceId);
        toast.success("Device blocked");
      }
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Failed to update device block status"));
    }
  };

  const handleToggleEntryBlock = async (entryId: string, name?: string) => {
    if (!isAdmin) {
      toast.error("Admin access required");
      return;
    }
    try {
      if (blockedEntryIds.has(entryId)) {
        await unblockEntry(entryId);
        toast.success(`Unblocked ${entryId}`);
      } else {
        await blockEntry(entryId, name);
        toast.success(`Blocked ${entryId}`);
      }
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Failed to update account block status"));
    }
  };

  const handleSendWarning = async (entryId: string, name?: string) => {
    if (!isAdmin) {
      toast.error("Admin access required");
      return;
    }
    try {
      await sendGuestWarning({
        entryId,
        name,
        sentBy: currentEntryId || ADMIN_ACTOR,
        message: DEFAULT_WARNING_MESSAGE,
      });
      void logAdminAction("guest_warning_sent", `entryId=${entryId}`);
      toast.success(`Warning sent to ${entryId}`);
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Failed to send warning"));
    }
  };

  const handleClearWarning = async (entryId: string) => {
    if (!isAdmin) {
      toast.error("Admin access required");
      return;
    }
    try {
      await clearGuestWarning({ entryId, acknowledgedByEntryId: currentEntryId || ADMIN_ACTOR });
      void logAdminAction("guest_warning_cleared", `entryId=${entryId}`);
      toast.success(`Warning cleared for ${entryId}`);
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Failed to clear warning"));
    }
  };

  const renderGuestModerationControls = (entryId: string, name?: string) => {
    const warning = guestWarnings.get(entryId);
    const warningCount = Number(warning?.warningCount ?? 0);
    const hasActiveWarning = !!warning?.isActive;

    return (
      <div style={controlsStyle}>
        <button
          style={blockBtn(blockedEntryIds.has(entryId))}
          onClick={() => handleToggleEntryBlock(entryId, name)}
          disabled={!isAdmin}
        >
          {blockedEntryIds.has(entryId) ? "Unblock Account" : "Block Account"}
        </button>
        <button
          style={warnBtn(hasActiveWarning)}
          onClick={() => handleSendWarning(entryId, name)}
          disabled={!isAdmin}
        >
          Send Warning
        </button>
        <button
          style={clearWarnBtn}
          onClick={() => handleClearWarning(entryId)}
          disabled={!hasActiveWarning || !isAdmin}
        >
          Clear Warning
        </button>
        <span style={badge(hasActiveWarning ? "#ff6b6b" : "#7f8a96")}>
          Warnings: {warningCount}
        </span>
      </div>
    );
  };

  const handleDeleteSong = async (songId: string) => {
    try {
      await deleteDoc(doc(db, "songs", songId));
      toast.success("Song request deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete song request");
    }
  };

  const handleDeleteSuggestion = async (suggestionId: string) => {
    try {
      await deleteDoc(doc(db, "suggestions", suggestionId));
      toast.success("Suggestion deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete suggestion");
    }
  };

  const applyDatePreset = (preset: "today" | "last7" | "all") => {
    if (preset === "all") {
      setGamesStartDate("");
      setGamesEndDate("");
      return;
    }

    const now = new Date();
    const end = toInputDate(now);
    if (preset === "today") {
      setGamesStartDate(end);
      setGamesEndDate(end);
      return;
    }

    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 6);
    setGamesStartDate(toInputDate(startDate));
    setGamesEndDate(end);
  };

  const handleDownloadFiltered = () => {
    if (downloadFormat === "excel") {
      handleExportExcelReport();
      return;
    }
    handlePrintPdfReport();
  };

  const handleDownloadDrilldown = () => {
    if (!drilldown || drilldown.rows.length === 0) {
      toast.error("No drilldown rows to download");
      return;
    }

    if (drillDownloadFormat === "excel") {
      const workbookHtml = `
        <html><head><meta charset="utf-8" /></head><body>
        <table border="1">
          <tr><th>Voter</th><th>Entry ID</th><th>Selection</th><th>Time</th></tr>
          ${drilldown.rows
            .map((row) => `<tr><td>${row.voterName}</td><td>${row.voterEntryId}</td><td>${row.selection}</td><td>${row.submittedAt}</td></tr>`)
            .join("")}
        </table>
        </body></html>`;
      const blob = new Blob([workbookHtml], { type: "application/vnd.ms-excel" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${sanitizeFileName(drilldown.title)}-${new Date().toISOString().slice(0, 10)}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      void logAdminAction("drilldown_excel_downloaded", `${drilldown.title} rows=${drilldown.rows.length}`);
      return;
    }

    const printWindow = window.open("", "_blank", "width=1024,height=768");
    if (!printWindow) {
      toast.error("Unable to open print window");
      return;
    }
    printWindow.document.write(`
      <html><head><title>${drilldown.title}</title></head><body>
      <h2>${drilldown.title}</h2>
      <table border="1" cellspacing="0" cellpadding="6">
        <tr><th>Voter</th><th>Entry ID</th><th>Selection</th><th>Time</th></tr>
        ${drilldown.rows
          .map((row) => `<tr><td>${row.voterName}</td><td>${row.voterEntryId}</td><td>${row.selection}</td><td>${row.submittedAt}</td></tr>`)
          .join("")}
      </table></body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    void logAdminAction("drilldown_pdf_printed", `${drilldown.title} rows=${drilldown.rows.length}`);
  };

  const logAdminAction = async (action: string, details: string) => {
    try {
      await addDoc(collection(db, "adminAuditLogs"), {
        action,
        actor: ADMIN_ACTOR,
        details,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Failed to log admin action", error);
    }
  };

  const handleSetGovernance = async (next: Partial<GovernanceState>, action: string) => {
    if (!isSuperAdmin) return;
    try {
      const nextState: GovernanceState = {
        ...governanceState,
        ...next
      };
      await setDoc(doc(db, "adminControls", "gamesResults"), nextState, { merge: true });
      setGovernanceState(nextState);
      await logAdminAction(action, JSON.stringify(next));
      toast.success("Governance updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update governance");
    }
  };

  const handleFinalizeResults = async () => {
    if (!governanceSignature.trim()) {
      toast.error("Enter signature before finalizing");
      return;
    }
    await handleSetGovernance(
      {
        finalized: true,
        finalizedAt: new Date().toISOString(),
        finalizedBy: ADMIN_ACTOR,
        signature: governanceSignature.trim()
      },
      "results_finalized"
    );
  };

  const handleUnfinalizeResults = async () => {
    await handleSetGovernance(
      {
        finalized: false,
        finalizedAt: "",
        finalizedBy: "",
        signature: ""
      },
      "results_unfinalized"
    );
  };

  const handleToggleArchiveMode = async () => {
    await handleSetGovernance({ archiveMode: !governanceState.archiveMode }, "archive_mode_toggled");
  };

  const handleExportExcelReport = () => {
    const analyticsRows = [
      { metric: "Unique Voters", value: gamesStats.uniqueVoterCount },
      { metric: "Invitees", value: gamesStats.inviteeCount },
      { metric: "Participation Rate", value: `${gamesStats.participationRate}%` }
    ];

    const suspiciousRows = suspiciousVoteInsights.map((item) => ({
      title: item.title,
      detail: item.detail
    }));

    const workbookHtml = `
      <html>
        <head><meta charset="utf-8" /></head>
        <body>
          <table border="1">
            <tr><th colspan="2">Analytics</th></tr>
            <tr><th>Metric</th><th>Value</th></tr>
            ${analyticsRows.map((r) => `<tr><td>${r.metric}</td><td>${r.value}</td></tr>`).join("")}
          </table>
          <br/>
          <table border="1">
            <tr><th colspan="5">Raw Votes</th></tr>
            <tr><th>Category</th><th>Voter</th><th>Entry ID</th><th>Selection</th><th>Time</th></tr>
            ${filteredGameRows
              .map(
                (r) =>
                  `<tr><td>${r.categoryLabel}</td><td>${r.voterName}</td><td>${r.voterEntryId}</td><td>${r.selection}</td><td>${r.submittedAtText}</td></tr>`
              )
              .join("")}
          </table>
          <br/>
          <table border="1">
            <tr><th colspan="2">Suspicious Insights</th></tr>
            <tr><th>Title</th><th>Detail</th></tr>
            ${suspiciousRows.map((r) => `<tr><td>${r.title}</td><td>${r.detail}</td></tr>`).join("")}
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([workbookHtml], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `games-report-${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    void logAdminAction("excel_report_exported", `rows=${filteredGameRows.length}`);
  };

  const handlePrintPdfReport = () => {
    const printWindow = window.open("", "_blank", "width=1024,height=768");
    if (!printWindow) {
      toast.error("Unable to open print window");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Games Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            th, td { border: 1px solid #ddd; padding: 6px; font-size: 12px; text-align: left; }
            h1, h2 { margin: 0 0 10px 0; }
          </style>
        </head>
        <body>
          <h1>Games Report</h1>
          <h2>Summary</h2>
          <table>
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Unique Voters</td><td>${gamesStats.uniqueVoterCount}</td></tr>
            <tr><td>Invitees</td><td>${gamesStats.inviteeCount}</td></tr>
            <tr><td>Participation Rate</td><td>${gamesStats.participationRate}%</td></tr>
          </table>
          <h2>Suspicious Insights</h2>
          <table>
            <tr><th>Title</th><th>Detail</th></tr>
            ${suspiciousVoteInsights.map((item) => `<tr><td>${item.title}</td><td>${item.detail}</td></tr>`).join("")}
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    void logAdminAction("pdf_report_printed", `rows=${filteredGameRows.length}`);
  };

  const handleAddAdmin = async () => {
    if (!isAdmin) return;
    const entryId = newAdminEntryId.trim();
    if (!entryId) return;
    if (entryId === SUPER_ADMIN_ENTRY_ID) return;
    try {
      await setDoc(doc(db, "adminRoles", entryId), {
        entryId,
        role: "admin",
        addedBy: currentEntryId || ADMIN_ACTOR,
        timestamp: serverTimestamp()
      });
      setNewAdminEntryId("");
      void logAdminAction("admin_added", `entryId=${entryId}`);
      toast.success(`Admin access added for ${entryId}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add admin");
    }
  };

  const handleRemoveAdmin = async (entryId: string) => {
    if (!isSuperAdmin) return;
    if (!entryId || entryId === SUPER_ADMIN_ENTRY_ID) return;
    try {
      await deleteDoc(doc(db, "adminRoles", entryId));
      void logAdminAction("admin_removed", `entryId=${entryId}`);
      toast.success(`Admin removed: ${entryId}`);
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Failed to remove admin"));
    }
  };

  /* ---------------- AUTH ---------------- */

  const handleLogout = () => {
    localStorage.removeItem("admin-auth");
    localStorage.removeItem("admin-entry-id");
    setAuthenticated(false);
    setAdminSessionEntryId("");
    setLoginEntryId("");
    setPassword("");
  };

  /* ---------------- LOGIN SCREEN ---------------- */

  if (!authenticated) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#0f0f0f",
        }}
      >
        <div
          style={{
            background: "#161616",
            padding: 40,
            borderRadius: 10,
            width: 320,
            color: "#fff",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginBottom: 20 }}>Admin Login</h2>

          <input
            type="text"
            placeholder="Enter admin Entry ID"
            value={loginEntryId}
            onChange={(e) => setLoginEntryId(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 10,
              borderRadius: 6,
              border: "1px solid #333",
              background: "#111",
              color: "#fff",
            }}
          />

          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 20,
              borderRadius: 6,
              border: "1px solid #333",
              background: "#111",
              color: "#fff",
            }}
          />

          <button
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 6,
              border: "none",
              background: "#f5b000",
              color: "#111",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={() => {
              const entryId = loginEntryId.trim();
              if (password !== ADMIN_PASSWORD) {
                alert("Incorrect password");
                return;
              }
              if (!entryId) {
                alert("Admin access denied");
                return;
              }
              const allowedAdmin = entryId === SUPER_ADMIN_ENTRY_ID || !!adminRoleMap[entryId];
              if (!allowedAdmin) {
                alert("Admin access denied");
                return;
              }
              localStorage.setItem("admin-auth", "true");
              localStorage.setItem("admin-entry-id", entryId);
              setAdminSessionEntryId(entryId);
              setAuthenticated(true);
              setPassword("");
            }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- DASHBOARD ---------------- */

  const renderMobileContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div style={mobileStack}>
            <AdminStats stats={stats} />
            <section style={panelStyle}>
              <h3 style={panelTitle}>Latest RSVP</h3>
              {recentRSVPs.length === 0 ? (
                <p style={mutedText}>No RSVP yet.</p>
              ) : (
                recentRSVPs.map((r: RSVP) => (
                  <div key={r.id} style={row}>
                    <span>{r.name ?? "Unknown"}</span>
                    <span style={badge(r.attendance === "yes" ? "#2ecc71" : "#ff6666")}>
                      {r.attendance === "yes" ? "Attending" : "Not Attending"}
                    </span>
                  </div>
                ))
              )}
            </section>

            <section style={panelStyle}>
              <h3 style={panelTitle}>Recent Songs</h3>
              {recentSongs.length === 0 ? (
                <p style={mutedText}>No song requests yet.</p>
              ) : (
                recentSongs.map((s: any) => (
                  <div key={s.id} style={row}>
                    <span>{s.songName ?? "-"}</span>
                    <span style={mutedTextSmall}>{s.name ?? "Unknown"}</span>
                  </div>
                ))
              )}
            </section>

            <section style={panelStyle}>
              <h3 style={panelTitle}>Recent Suggestions</h3>
              {recentSuggestions.length === 0 ? (
                <p style={mutedText}>No suggestions yet.</p>
              ) : (
                recentSuggestions.map((s: any) => (
                  <div key={s.id} style={row}>
                    <span style={mutedTextSmall}>{s.name ?? "Unknown"}</span>
                    <span style={truncateText}>{s.suggestion ?? "-"}</span>
                  </div>
                ))
              )}
            </section>

            <section style={panelStyle}>
              <h3 style={panelTitle}>Suspicious Devices</h3>
              {suspiciousDevices.length === 0 ? (
                <p style={mutedText}>No device has logged multiple accounts yet.</p>
              ) : (
                suspiciousDevices.slice(0, 4).map((device) => (
                  <div key={device.deviceId} style={row}>
                    <span style={mutedTextSmall}>{shortDevice(device.deviceId)}</span>
                    <span style={badge(blockedDeviceIds.has(device.deviceId) ? "#ff4d4f" : "#ff8c42")}>
                      {blockedDeviceIds.has(device.deviceId) ? "Blocked" : `${device.accounts.length} accounts`}
                    </span>
                  </div>
                ))
              )}
            </section>

            <section style={panelStyle}>
              <h3 style={panelTitle}>Recent Suspicious Activity</h3>
              {suspiciousEvents.length === 0 ? (
                <p style={mutedText}>No suspicious recent events.</p>
              ) : (
                <div style={activityTableWrap}>
                  <table style={activityTableStyle}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                        <th style={th}>Time</th>
                        <th style={th}>Action</th>
                        <th style={th}>Name</th>
                        <th style={th}>Entry ID</th>
                        <th style={th}>Device</th>
                        <th style={th}>Controls</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suspiciousEvents.map((log: ActivityLog) => (
                        <tr key={log.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                          <td style={td}>{formatLogTime(log)}</td>
                          <td style={td}>{log.type ?? "-"}</td>
                          <td style={td}>{log.name ?? "-"}</td>
                          <td style={td}>{log.entryId ?? "-"}</td>
                          <td style={td}>{shortDevice(log.deviceId ?? "unknown-device")}</td>
                          <td style={td}>
                            {log.entryId ? renderGuestModerationControls(log.entryId, log.name) : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        );
      case "rsvps":
        return (
          <>
            <div style={searchWrap}>
              <input
                placeholder="Search guest by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={searchInputStyle}
              />
            </div>
            <RSVPTable guests={filteredGuests} />
          </>
        );
      case "songs":
        return <SongsTable songs={songs} onDelete={handleDeleteSong} />;
      case "suggestions":
        return <SuggestionsTable suggestions={suggestions} onDelete={handleDeleteSuggestion} />;
      case "activity":
        return (
          <section style={panelStyle}>
            <h3 style={panelTitle}>Recent Activity Logs</h3>

            <div style={activityTableWrap}>
              <table style={activityTableStyle}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                    <th style={th}>Time</th>
                    <th style={th}>Action</th>
                    <th style={th}>Name</th>
                    <th style={th}>Entry ID</th>
                    <th style={th}>Device</th>
                    <th style={th}>Details</th>
                    <th style={th}>Controls</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLogs.length === 0 && (
                    <tr>
                      <td style={emptyTd} colSpan={7}>No activity logs yet.</td>
                    </tr>
                  )}

                  {activityLogs.slice(0, activityVisibleCount).map((log: ActivityLog) => (
                    <tr key={log.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      <td style={td}>{formatLogTime(log)}</td>
                      <td style={td}>{log.type ?? "-"}</td>
                      <td style={td}>{log.name ?? "-"}</td>
                      <td style={td}>{log.entryId ?? "-"}</td>
                      <td style={td}>{shortDevice(log.deviceId ?? "unknown-device")}</td>
                      <td style={td}>{log.details || "-"}</td>
                      <td style={td}>
                        <div style={controlsStyle}>
                          {log.entryId && renderGuestModerationControls(log.entryId, log.name)}
                          {log.deviceId && (
                            <button
                              style={blockBtn(blockedDeviceIds.has(log.deviceId))}
                              onClick={() => handleToggleDeviceBlock(log.deviceId as string)}
                              disabled={!isAdmin}
                            >
                              {blockedDeviceIds.has(log.deviceId) ? "Unblock Device" : "Block Device"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {activityLogs.length > activityVisibleCount && (
              <div style={{ marginTop: 12 }}>
                <button
                  style={toggleViewBtn(false)}
                  onClick={() => setActivityVisibleCount((count) => count + 120)}
                >
                  Load more
                </button>
              </div>
            )}
          </section>
        );
      case "device_watch":
        return (
          <section style={panelStyle}>
            <h3 style={panelTitle}>All Devices (Manual Block Controls)</h3>

            {allDevices.length === 0 ? (
              <p style={mutedText}>No device logs found yet.</p>
            ) : (
              <div style={activityTableWrap}>
                <table style={activityTableStyle}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                      <th style={th}>Device</th>
                      <th style={th}>Accounts</th>
                      <th style={th}>Controls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allDevices.map((device) => (
                      <tr key={device.deviceId} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        <td style={td}>{shortDevice(device.deviceId)}</td>
                        <td style={td}>
                          <div style={chipWrapStyle}>
                            {device.accountPairs.map((item) => (
                              <div key={item.entryId}>
                                {renderGuestModerationControls(item.entryId, item.name)}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td style={td}>
                          <button
                            style={blockBtn(blockedDeviceIds.has(device.deviceId))}
                            onClick={() => handleToggleDeviceBlock(device.deviceId)}
                            disabled={!isAdmin}
                          >
                            {blockedDeviceIds.has(device.deviceId) ? "Unblock Device" : "Block Device"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      case "games":
        return (
          <div style={mobileStack}>
            <section style={panelStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div>
                  <h3 style={panelTitle}>Games Analytics</h3>
                  <p style={mutedText}>Visual stats, advanced filters, and drill-down voter details</p>
                </div>
                <div style={controlsStyle}>
                  <button
                    style={toggleViewBtn(gamesView === "analytics")}
                    onClick={() => setGamesView("analytics")}
                  >
                    Analytics
                  </button>
                  <button
                    style={toggleViewBtn(gamesView === "tables")}
                    onClick={() => setGamesView("tables")}
                  >
                    Tables
                  </button>
                </div>
              </div>
            </section>

            <section style={panelStyle}>
              <div style={filterGridStyle}>
                <div style={filterCell}>
                  <label style={filterLabel}>Category</label>
                  <Select value={gamesCategoryFilter} onValueChange={(v) => setGamesCategoryFilter(v as GameCategory)}>
                    <SelectTrigger className="bg-black/40 border-gold/30 text-champagne">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="self">Self Nomination</SelectItem>
                      <SelectItem value="cys">A Couple You Ship</SelectItem>
                      <SelectItem value="mpm">Most Popular Male</SelectItem>
                      <SelectItem value="mpf">Most Popular Female</SelectItem>
                      <SelectItem value="bmd">Best Male Duo</SelectItem>
                      <SelectItem value="bfd">Best Female Duo</SelectItem>
                      <SelectItem value="swdbitp">Someone Who Doesn't Belong</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div style={filterCell}>
                  <label style={filterLabel}>Search</label>
                  <input
                    value={gamesSearch}
                    onChange={(e) => setGamesSearch(e.target.value)}
                    placeholder="Search voter/nominee"
                    style={filterInput}
                  />
                </div>

                <div style={filterCell}>
                  <label style={filterLabel}>From</label>
                  <input
                    type="date"
                    value={gamesStartDate}
                    onChange={(e) => setGamesStartDate(e.target.value)}
                    style={filterInput}
                  />
                </div>

                <div style={filterCell}>
                  <label style={filterLabel}>To</label>
                  <input
                    type="date"
                    value={gamesEndDate}
                    onChange={(e) => setGamesEndDate(e.target.value)}
                    style={filterInput}
                  />
                </div>

                <div style={{ ...filterCell, justifyContent: "flex-end" }}>
                  <div style={controlsStyle}>
                    <button style={smallBtn} onClick={() => applyDatePreset("today")}>Today</button>
                    <button style={smallBtn} onClick={() => applyDatePreset("last7")}>Last 7 Days</button>
                    <button style={smallBtn} onClick={() => applyDatePreset("all")}>Clear Dates</button>
                  </div>
                </div>
              </div>
            </section>

            {gamesView === "analytics" && (
              <>
                <section style={overviewGridStyle}>
                  <div style={panelStyle}>
                    <h3 style={panelTitle}>Participation</h3>
                    <div style={{ display: "grid", gap: 8 }}>
                      <div style={statRow}>
                        <span style={mutedText}>Unique voters</span>
                        <strong>{gamesStats.uniqueVoterCount}</strong>
                      </div>
                      <div style={statRow}>
                        <span style={mutedText}>Invitees</span>
                        <strong>{gamesStats.inviteeCount}</strong>
                      </div>
                      <div style={statRow}>
                        <span style={mutedText}>Participation Rate</span>
                        <strong>{gamesStats.participationRate}%</strong>
                      </div>
                    </div>
                  </div>

                  <div style={panelStyle}>
                    <h3 style={panelTitle}>Self Nomination Mix</h3>
                    <ChartDonut
                      data={gamesStats.selfNominationCounts}
                      onSliceClick={() => null}
                      emptyLabel="No self nominations yet."
                      compact
                    />
                  </div>
                </section>

                <section style={overviewGridStyle}>
                  <div style={panelStyle}>
                    <h3 style={panelTitle}>Most Popular Male</h3>
                    <ChartBars
                      data={gamesStats.categories.mpm.ranking.slice(0, 8)}
                      emptyLabel="No MPM votes yet."
                      onBarClick={(name) => {
                        const rows = gamesStats.categories.mpm.votersBySelection.get(name) ?? [];
                        setDrilldown({ title: `MPM - ${name}`, rows });
                      }}
                      compact
                    />
                  </div>
                  <div style={panelStyle}>
                    <h3 style={panelTitle}>Most Popular Female</h3>
                    <ChartBars
                      data={gamesStats.categories.mpf.ranking.slice(0, 8)}
                      emptyLabel="No MPF votes yet."
                      onBarClick={(name) => {
                        const rows = gamesStats.categories.mpf.votersBySelection.get(name) ?? [];
                        setDrilldown({ title: `MPF - ${name}`, rows });
                      }}
                      compact
                    />
                  </div>
                </section>

                <section style={overviewGridStyle}>
                  <div style={panelStyle}>
                    <h3 style={panelTitle}>A Couple You Ship</h3>
                    <ChartDonut
                      data={gamesStats.categories.cys.ranking.slice(0, 8)}
                      emptyLabel="No CYS votes yet."
                      onSliceClick={(name) => {
                        const rows = gamesStats.categories.cys.votersBySelection.get(name) ?? [];
                        setDrilldown({ title: `CYS - ${name}`, rows });
                      }}
                      compact
                    />
                  </div>
                  <div style={panelStyle}>
                    <h3 style={panelTitle}>Someone Who Doesn't Belong</h3>
                    <ChartDonut
                      data={gamesStats.categories.swdbitp.ranking.slice(0, 8)}
                      emptyLabel="No SWDBITP votes yet."
                      onSliceClick={(name) => {
                        const rows = gamesStats.categories.swdbitp.votersBySelection.get(name) ?? [];
                        setDrilldown({ title: `SWDBITP - ${name}`, rows });
                      }}
                      compact
                    />
                  </div>
                </section>

                <section style={overviewGridStyle}>
                  <div style={panelStyle}>
                    <h3 style={panelTitle}>Best Male Duo</h3>
                    <ChartBars
                      data={gamesStats.categories.bmd.ranking.slice(0, 8)}
                      emptyLabel="No BMD votes yet."
                      onBarClick={(name) => {
                        const rows = gamesStats.categories.bmd.votersBySelection.get(name) ?? [];
                        setDrilldown({ title: `BMD - ${name}`, rows });
                      }}
                      compact
                    />
                  </div>
                  <div style={panelStyle}>
                    <h3 style={panelTitle}>Best Female Duo</h3>
                    <ChartBars
                      data={gamesStats.categories.bfd.ranking.slice(0, 8)}
                      emptyLabel="No BFD votes yet."
                      onBarClick={(name) => {
                        const rows = gamesStats.categories.bfd.votersBySelection.get(name) ?? [];
                        setDrilldown({ title: `BFD - ${name}`, rows });
                      }}
                      compact
                    />
                  </div>
                </section>
              </>
            )}

            {gamesView === "tables" && (
              <>
                <section style={panelStyle}>
                  <h3 style={panelTitle}>Self Nominations</h3>
                  <p style={mutedText}>Grouped by category</p>

                  <div style={overviewGridStyle}>
                    {Object.entries(nominationCategoryLabels).map(([key, label]) => {
                      const names = nominationGroups[key] ?? [];
                      return (
                        <div key={key} style={miniPanel}>
                          <h4 style={miniPanelTitle}>{label}</h4>
                          {names.length === 0 ? (
                            <p style={mutedTextSmall}>No nominations.</p>
                          ) : (
                            <div style={{ display: "grid", gap: 4 }}>
                              {names.map((name, index) => (
                                <span key={`${name}-${index}`} style={mutedTextSmall}>{name}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section style={panelStyle}>
                  <h3 style={panelTitle}>CYS Votes</h3>
                  <div style={activityTableWrap}>
                    <table style={activityTableStyle}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                          <th style={th}>Time</th>
                          <th style={th}>Voter</th>
                          <th style={th}>Entry ID</th>
                          <th style={th}>Couple</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rowsByCategory.cys.length === 0 && (
                          <tr>
                            <td style={emptyTd} colSpan={4}>No CYS votes yet.</td>
                          </tr>
                        )}
                        {rowsByCategory.cys.slice(0, 150).map((row) => (
                          <tr key={row.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                            <td style={td}>{row.submittedAtText ?? "-"}</td>
                            <td style={td}>{row.voterName ?? "-"}</td>
                            <td style={td}>{row.voterEntryId ?? "-"}</td>
                            <td style={td}>{row.selection ?? "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section style={overviewGridStyle}>
                  <div style={panelStyle}>
                    <h3 style={panelTitle}>MPM Votes</h3>
                    <VoteTable rows={rowsByCategory.mpm} emptyLabel="No MPM votes yet." tableStyle={activityTableStyle} />
                  </div>

                  <div style={panelStyle}>
                    <h3 style={panelTitle}>MPF Votes</h3>
                    <VoteTable rows={rowsByCategory.mpf} emptyLabel="No MPF votes yet." tableStyle={activityTableStyle} />
                  </div>
                </section>

                <section style={overviewGridStyle}>
                  <div style={panelStyle}>
                    <h3 style={panelTitle}>BMD Votes</h3>
                    <DuoVoteTable rows={rowsByCategory.bmd} leftLabel="Pair" rightLabel="Votes" emptyLabel="No BMD votes yet." tableStyle={activityTableStyle} />
                  </div>

                  <div style={panelStyle}>
                    <h3 style={panelTitle}>BFD Votes</h3>
                    <DuoVoteTable rows={rowsByCategory.bfd} leftLabel="Pair" rightLabel="Votes" emptyLabel="No BFD votes yet." tableStyle={activityTableStyle} />
                  </div>
                </section>

                <section style={panelStyle}>
                  <h3 style={panelTitle}>SWDBITP Votes</h3>
                  <VoteTable rows={rowsByCategory.swdbitp} emptyLabel="No SWDBITP votes yet." tableStyle={activityTableStyle} />
                </section>
              </>
            )}

            {drilldown && (
              <div style={modalOverlay} onClick={() => setDrilldown(null)}>
                <div style={modalCard} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <h3 style={{ ...panelTitle, marginBottom: 0 }}>{drilldown.title}</h3>
                    <div style={controlsStyle}>
                      <Select value={drillDownloadFormat} onValueChange={(v) => setDrillDownloadFormat(v as "excel" | "pdf")}>
                        <SelectTrigger className="w-[110px] h-9 bg-black/40 border-gold/30 text-champagne">
                          <SelectValue placeholder="Format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                        </SelectContent>
                      </Select>
                      <button style={csvBtn} onClick={() => handleDrilldownDownload()}>
                        Download
                      </button>
                      <button style={closeBtn} onClick={() => setDrilldown(null)}>Close</button>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 12 }}>
                    <input
                      value={drillSearch}
                      onChange={(e) => setDrillSearch(e.target.value)}
                      placeholder="Search voter"
                      style={{ ...filterInput, maxWidth: 220 }}
                    />
                    <button style={smallBtn} onClick={() => setDrillSearch("")}>Clear</button>
                  </div>

                  <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                    {drilldownFilteredRows.map((row, index) => (
                      <div key={`${row.voterEntryId}-${index}`} style={rowCompact}>
                        <div>{row.voterName} ({row.voterEntryId})</div>
                        <div>{row.selection}</div>
                        <div style={mutedTextSmall}>{row.submittedAt}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case "games_monitor":
        return (
          <div style={mobileStack}>
            <section style={panelStyle}>
              <h3 style={panelTitle}>Download Center</h3>
              <p style={mutedText}>Export report files without CSV clutter</p>
              <div style={controlsStyle}>
                <Select value={downloadFormat} onValueChange={(v) => setDownloadFormat(v as "excel" | "pdf")}>
                  <SelectTrigger className="w-[120px] h-9 bg-black/40 border-gold/30 text-champagne">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
                <button style={csvBtn} onClick={handleDownloadReport}>Download</button>
              </div>
            </section>

            <section style={panelStyle}>
              <h3 style={panelTitle}>Governance</h3>
              <p style={mutedTextSmall}>Control result finalization and archive mode.</p>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={rowCompact}>
                  <span>Finalized:</span>
                  <strong>{governanceState.finalized ? "Yes" : "No"}</strong>
                </div>
                {governanceState.finalizedAt && (
                  <div style={rowCompact}>
                    <span>Finalized At:</span>
                    <strong>{governanceState.finalizedAt}</strong>
                  </div>
                )}
                {governanceState.finalizedBy && (
                  <div style={rowCompact}>
                    <span>Finalized By:</span>
                    <strong>{governanceState.finalizedBy}</strong>
                  </div>
                )}
              </div>
              <input
                value={governanceSignature}
                onChange={(e) => setGovernanceSignature(e.target.value)}
                placeholder="Signature to finalize"
                style={filterInput}
              />
              <div style={controlsStyle}>
                <button style={csvBtn} onClick={handleFinalizeResults}>Finalize Results</button>
                <button style={smallBtn} onClick={handleUnfinalizeResults}>Unfinalize</button>
                <button style={smallBtn} onClick={handleToggleArchiveMode}>
                  {governanceState.archiveMode ? "Disable Archive" : "Enable Archive"}
                </button>
              </div>
            </section>

            <section style={panelStyle}>
              <h3 style={panelTitle}>Admin Access</h3>
              <p style={mutedTextSmall}>
                Add admin Entry IDs. Super admin is fixed to {SUPER_ADMIN_ENTRY_ID}.
              </p>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  value={newAdminEntryId}
                  onChange={(e) => setNewAdminEntryId(e.target.value)}
                  placeholder="Entry ID"
                  style={{ ...filterInput, maxWidth: 220 }}
                />
                <button style={csvBtn} onClick={handleAddAdmin}>Add Admin</button>
              </div>

              <div style={adminAccessList}>
                <div style={adminAccessRow}>
                  <div style={{ display: "grid", gap: 2 }}>
                    <span style={adminNameText}>
                      {entryNameMap[SUPER_ADMIN_ENTRY_ID] ?? "Super Admin"} ({SUPER_ADMIN_ENTRY_ID})
                    </span>
                  </div>
                  <span style={rolePillSuper}>Super Admin</span>
                </div>
                {adminRoles
                  .filter((r) => (r.entryId ?? r.id ?? "") !== SUPER_ADMIN_ENTRY_ID)
                  .map((admin) => {
                    const adminEntryId = admin.entryId ?? admin.id ?? "";
                    const displayEntryId = adminEntryId || "-";
                    const displayName = entryNameMap[adminEntryId] ?? displayEntryId;
                    return (
                      <div key={admin.id} style={adminAccessRow}>
                        <span style={adminNameText}>
                          {displayName} ({displayEntryId})
                        </span>
                        <div style={controlsStyle}>
                          <span style={rolePillAdmin}>Admin</span>
                          {isSuperAdmin && (
                            <button style={smallBtn} onClick={() => handleRemoveAdmin(adminEntryId)}>
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                {adminRoles.filter((r) => (r.entryId ?? r.id ?? "") !== SUPER_ADMIN_ENTRY_ID).length === 0 && (
                  <p style={{ ...mutedText, marginTop: 4 }}>No additional admins added yet.</p>
                )}
              </div>
            </section>

            <section style={panelStyle}>
              <h3 style={panelTitle}>Suspicious Pattern Insights</h3>
              {suspiciousVoteInsights.length === 0 ? (
                <p style={mutedText}>No suspicious patterns detected for current filters.</p>
              ) : (
                <div style={overviewGridStyle}>
                  {suspiciousVoteInsights.map((item) => (
                    <div key={item.id} style={miniPanel}>
                      <h4 style={miniPanelTitle}>{item.title}</h4>
                      <p style={mutedText}>{item.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section style={panelStyle}>
              <h3 style={panelTitle}>Admin Action Log</h3>
              {auditLogs.length === 0 ? (
                <p style={mutedText}>No admin actions logged yet.</p>
              ) : (
                <div style={activityTableWrap}>
                  <table style={activityTableStyle}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                        <th style={th}>Time</th>
                        <th style={th}>Actor</th>
                        <th style={th}>Action</th>
                        <th style={th}>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.slice(0, auditVisibleCount).map((log) => (
                        <tr key={log.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                          <td style={td}>{formatGameTime(log)}</td>
                          <td style={td}>{log.actor ?? "-"}</td>
                          <td style={td}>{log.action ?? "-"}</td>
                          <td style={td}>{log.details ?? "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {auditLogs.length > auditVisibleCount && (
                <div style={{ marginTop: 12 }}>
                  <button
                    style={smallBtn}
                    onClick={() => setAuditVisibleCount((count) => count + 60)}
                  >
                    Load more
                  </button>
                </div>
              )}
            </section>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout
      navItems={[
        { key: "overview", label: "Overview" },
        { key: "rsvps", label: "RSVP Manager" },
        { key: "songs", label: "Song Requests" },
        { key: "suggestions", label: "Suggestions" },
        { key: "activity", label: "Activity Monitor" },
        { key: "device_watch", label: "Device Watch" },
        { key: "games", label: "Games Votes" },
        { key: "games_monitor", label: "Admin Monitor" }
      ]}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      title={
        activeSection === "overview"
          ? "Admin Dashboard"
          : activeSection === "rsvps"
            ? "RSVP Manager"
            : activeSection === "songs"
              ? "Song Requests"
              : activeSection === "suggestions"
                ? "Guest Suggestions"
                : activeSection === "activity"
                  ? "Activity Monitor"
                  : activeSection === "device_watch"
                    ? "Device Watch"
                    : activeSection === "games"
                      ? "Games Votes"
                      : "Admin Monitor"
      }
      subtitle={`Live data updates from Firestore • ${authBadge}`}
      onLogout={handleLogout}
    >
      {!isMobile && (
        <>
      {activeSection === "overview" && (
        <>
          <AdminStats stats={stats} />

          <div style={overviewGridStyle}>
            <section style={panelStyle}>
              <h3 style={panelTitle}>Latest RSVP</h3>
              {recentRSVPs.length === 0 ? (
                <p style={mutedText}>No RSVP yet.</p>
              ) : (
                recentRSVPs.map((r: RSVP) => (
                  <div key={r.id} style={row}>
                    <span>{r.name ?? "Unknown"}</span>
                    <span style={badge(r.attendance === "yes" ? "#2ecc71" : "#ff6666")}>
                      {r.attendance === "yes" ? "Attending" : "Not Attending"}
                    </span>
                  </div>
                ))
              )}
            </section>

            <section style={panelStyle}>
              <h3 style={panelTitle}>Recent Songs</h3>
              {recentSongs.length === 0 ? (
                <p style={mutedText}>No song requests yet.</p>
              ) : (
                recentSongs.map((s: any) => (
                  <div key={s.id} style={row}>
                    <span>{s.songName ?? "-"}</span>
                    <span style={mutedTextSmall}>{s.name ?? "Unknown"}</span>
                  </div>
                ))
              )}
            </section>

            <section style={panelStyle}>
              <h3 style={panelTitle}>Recent Suggestions</h3>
              {recentSuggestions.length === 0 ? (
                <p style={mutedText}>No suggestions yet.</p>
              ) : (
                recentSuggestions.map((s: any) => (
                  <div key={s.id} style={row}>
                    <span style={mutedTextSmall}>{s.name ?? "Unknown"}</span>
                    <span style={truncateText}>{s.suggestion ?? "-"}</span>
                  </div>
                ))
              )}
            </section>

            <section style={panelStyle}>
              <h3 style={panelTitle}>Suspicious Devices</h3>
              {suspiciousDevices.length === 0 ? (
                <p style={mutedText}>No device has logged multiple accounts yet.</p>
              ) : (
                suspiciousDevices.slice(0, 4).map((device) => (
                  <div key={device.deviceId} style={row}>
                    <span style={mutedTextSmall}>{shortDevice(device.deviceId)}</span>
                    <span style={badge(blockedDeviceIds.has(device.deviceId) ? "#ff4d4f" : "#ff8c42")}>
                      {blockedDeviceIds.has(device.deviceId) ? "Blocked" : `${device.accounts.length} accounts`}
                    </span>
                  </div>
                ))
              )}
            </section>
          </div>

          <section style={{ ...panelStyle, marginTop: 16 }}>
            <h3 style={panelTitle}>Recent Suspicious Activity</h3>
            {suspiciousEvents.length === 0 ? (
              <p style={mutedText}>No suspicious recent events.</p>
            ) : (
              <div style={activityTableWrap}>
                <table style={activityTableStyle}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                      <th style={th}>Time</th>
                  <th style={th}>Action</th>
                  <th style={th}>Name</th>
                  <th style={th}>Entry ID</th>
                  <th style={th}>Device</th>
                  <th style={th}>Controls</th>
                </tr>
              </thead>
              <tbody>
                {suspiciousEvents.map((log: ActivityLog) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        <td style={td}>{formatLogTime(log)}</td>
                        <td style={td}>{log.type ?? "-"}</td>
                    <td style={td}>{log.name ?? "-"}</td>
                    <td style={td}>{log.entryId ?? "-"}</td>
                    <td style={td}>{shortDevice(log.deviceId ?? "unknown-device")}</td>
                    <td style={td}>
                      {log.entryId ? renderGuestModerationControls(log.entryId, log.name) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {activeSection === "rsvps" && (
        <>
          <div style={searchWrap}>
            <input
              placeholder="Search guest by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={searchInputStyle}
            />
          </div>
          <RSVPTable guests={filteredGuests} />
        </>
      )}

      {activeSection === "songs" && <SongsTable songs={songs} onDelete={handleDeleteSong} />}
      {activeSection === "suggestions" && <SuggestionsTable suggestions={suggestions} onDelete={handleDeleteSuggestion} />}
      {activeSection === "activity" && (
        <div style={panelStyle}>
          <h3 style={panelTitle}>Recent Activity Logs</h3>

          <div style={activityTableWrap}>
            <table style={activityTableStyle}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                  <th style={th}>Time</th>
                  <th style={th}>Action</th>
                  <th style={th}>Name</th>
                  <th style={th}>Entry ID</th>
                  <th style={th}>Device</th>
                  <th style={th}>Details</th>
                  <th style={th}>Controls</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.length === 0 && (
                  <tr>
                    <td style={emptyTd} colSpan={7}>No activity logs yet.</td>
                  </tr>
                )}

                {activityLogs.slice(0, activityVisibleCount).map((log: ActivityLog) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <td style={td}>{formatLogTime(log)}</td>
                    <td style={td}>{log.type ?? "-"}</td>
                    <td style={td}>{log.name ?? "-"}</td>
                    <td style={td}>{log.entryId ?? "-"}</td>
                    <td style={td}>{shortDevice(log.deviceId ?? "unknown-device")}</td>
                    <td style={td}>{log.details || "-"}</td>
                    <td style={td}>
                      <div style={controlsStyle}>
                        {log.entryId && renderGuestModerationControls(log.entryId, log.name)}
                        {log.deviceId && (
                          <button
                            style={blockBtn(blockedDeviceIds.has(log.deviceId))}
                            onClick={() => handleToggleDeviceBlock(log.deviceId as string)}
                            disabled={!isAdmin}
                          >
                            {blockedDeviceIds.has(log.deviceId) ? "Unblock Device" : "Block Device"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {activityLogs.length > activityVisibleCount && (
            <div style={{ marginTop: 12 }}>
              <button
                style={toggleViewBtn(false)}
                onClick={() => setActivityVisibleCount((count) => count + 120)}
              >
                Load more
              </button>
            </div>
          )}
        </div>
      )}

      {activeSection === "device_watch" && (
        <div style={panelStyle}>
          <h3 style={panelTitle}>All Devices (Manual Block Controls)</h3>

          {allDevices.length === 0 ? (
            <p style={mutedText}>No device logs found yet.</p>
          ) : (
            <div style={activityTableWrap}>
              <table style={activityTableStyle}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                    <th style={th}>Device</th>
                    <th style={th}>Accounts Used</th>
                    <th style={th}>Guest Names</th>
                    <th style={th}>Total Events</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allDevices.map((device) => (
                    <tr key={device.deviceId} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      <td style={td}>{shortDevice(device.deviceId)}</td>
                      <td style={td}>
                        <div style={chipWrapStyle}>
                          {device.accountPairs.map((item) => (
                            <div key={item.entryId}>
                              {renderGuestModerationControls(item.entryId, item.name)}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td style={td}>{device.names.join(", ")}</td>
                      <td style={td}>
                        <span style={badge("#ff8c42")}>{device.events}</span>
                      </td>
                      <td style={td}>
                        <button
                          style={blockBtn(blockedDeviceIds.has(device.deviceId))}
                          onClick={() => handleToggleDeviceBlock(device.deviceId)}
                          disabled={!isAdmin}
                        >
                          {blockedDeviceIds.has(device.deviceId) ? "Unblock Device" : "Block Device"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeSection === "games" && (
        <div style={{ display: "grid", gap: 16 }}>
          <section style={{ ...panel, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div>
              <h3 style={panelTitle}>Games Analytics</h3>
              <p style={mutedText}>Visual stats, advanced filters, and drill-down voter details</p>
            </div>
            <div style={controlsStyle}>
              <button
                style={toggleViewBtn(gamesView === "analytics")}
                onClick={() => setGamesView("analytics")}
              >
                Charts
              </button>
              <button
                style={toggleViewBtn(gamesView === "tables")}
                onClick={() => setGamesView("tables")}
              >
                Detailed Tables
              </button>
              <Select value={downloadFormat} onValueChange={(v) => setDownloadFormat(v as "excel" | "pdf")}>
                <SelectTrigger className="w-[110px] h-9 bg-black/40 border-gold/30 text-champagne">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gold/30 text-champagne">
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
              <button style={csvBtn} onClick={handleDownloadFiltered}>Download</button>
            </div>
          </section>

          <section style={panelStyle}>
            <div style={filterGridStyle}>
              <div style={filterCell}>
                <label style={filterLabel}>Category</label>
                <Select
                  value={gamesCategoryFilter}
                  onValueChange={(v) => setGamesCategoryFilter(v as "all" | GameCategory)}
                >
                  <SelectTrigger className="h-10 bg-black/40 border-gold/30 text-champagne">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-gold/30 text-champagne">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="self">Self Nominations</SelectItem>
                    <SelectItem value="cys">A Couple You Ship</SelectItem>
                    <SelectItem value="mpm">Most Popular Male</SelectItem>
                    <SelectItem value="mpf">Most Popular Female</SelectItem>
                    <SelectItem value="bmd">Best Male Duo</SelectItem>
                    <SelectItem value="bfd">Best Female Duo</SelectItem>
                    <SelectItem value="swdbitp">Someone Who Doesn't Belong</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div style={filterCell}>
                <label style={filterLabel}>Search</label>
                <input
                  value={gamesSearch}
                  onChange={(e) => setGamesSearch(e.target.value)}
                  placeholder="Voter / entry ID / nominee"
                  style={filterInput}
                />
              </div>

              <div style={filterCell}>
                <label style={filterLabel}>Start Date</label>
                <input
                  type="date"
                  value={gamesStartDate}
                  onChange={(e) => setGamesStartDate(e.target.value)}
                  style={filterInput}
                />
              </div>

              <div style={filterCell}>
                <label style={filterLabel}>End Date</label>
                <input
                  type="date"
                  value={gamesEndDate}
                  onChange={(e) => setGamesEndDate(e.target.value)}
                  style={filterInput}
                />
              </div>

              <div style={{ ...filterCell, justifyContent: "flex-end" }}>
                <div style={controlsStyle}>
                  <button style={smallBtn} onClick={() => applyDatePreset("today")}>Today</button>
                  <button style={smallBtn} onClick={() => applyDatePreset("last7")}>Last 7 Days</button>
                  <button style={smallBtn} onClick={() => applyDatePreset("all")}>Clear Dates</button>
                </div>
              </div>
            </div>
          </section>

          {gamesView === "analytics" && (
            <>
              <section style={overviewGridStyle}>
                <div style={panelStyle}>
                  <h3 style={panelTitle}>Participation</h3>
                  <div style={{ display: "grid", gap: 8 }}>
                    <div style={statRow}>
                      <span style={mutedText}>Unique Voters</span>
                      <strong>{gamesStats.uniqueVoterCount}</strong>
                    </div>
                    <div style={statRow}>
                      <span style={mutedText}>Invitees</span>
                      <strong>{gamesStats.inviteeCount}</strong>
                    </div>
                    <div style={statRow}>
                      <span style={mutedText}>Participation Rate</span>
                      <strong>{gamesStats.participationRate}%</strong>
                    </div>
                  </div>
                </div>

                <div style={panelStyle}>
                  <h3 style={panelTitle}>Self Nomination Mix</h3>
                  <ChartDonut
                    data={gamesStats.selfNominationCounts}
                    onSliceClick={() => null}
                    emptyLabel="No self nominations yet."
                    compact={isMobile}
                  />
                </div>
              </section>

              <section style={overviewGridStyle}>
                <div style={panelStyle}>
                  <h3 style={panelTitle}>Most Popular Male</h3>
                  <ChartBars
                    data={gamesStats.categories.mpm.ranking.slice(0, 8)}
                    emptyLabel="No MPM votes yet."
                    onBarClick={(name) => {
                      const rows = gamesStats.categories.mpm.votersBySelection.get(name) ?? [];
                      setDrilldown({ title: `MPM - ${name}`, rows });
                    }}
                    compact={isMobile}
                  />
                </div>
                <div style={panelStyle}>
                  <h3 style={panelTitle}>Most Popular Female</h3>
                  <ChartBars
                    data={gamesStats.categories.mpf.ranking.slice(0, 8)}
                    emptyLabel="No MPF votes yet."
                    onBarClick={(name) => {
                      const rows = gamesStats.categories.mpf.votersBySelection.get(name) ?? [];
                      setDrilldown({ title: `MPF - ${name}`, rows });
                    }}
                    compact={isMobile}
                  />
                </div>
              </section>

              <section style={overviewGridStyle}>
                <div style={panelStyle}>
                  <h3 style={panelTitle}>A Couple You Ship</h3>
                  <ChartDonut
                    data={gamesStats.categories.cys.ranking.slice(0, 8)}
                    emptyLabel="No CYS votes yet."
                    onSliceClick={(name) => {
                      const rows = gamesStats.categories.cys.votersBySelection.get(name) ?? [];
                      setDrilldown({ title: `CYS - ${name}`, rows });
                    }}
                    compact={isMobile}
                  />
                </div>
                <div style={panelStyle}>
                  <h3 style={panelTitle}>Someone Who Doesn't Belong</h3>
                  <ChartDonut
                    data={gamesStats.categories.swdbitp.ranking.slice(0, 8)}
                    emptyLabel="No SWDBITP votes yet."
                    onSliceClick={(name) => {
                      const rows = gamesStats.categories.swdbitp.votersBySelection.get(name) ?? [];
                      setDrilldown({ title: `SWDBITP - ${name}`, rows });
                    }}
                    compact={isMobile}
                  />
                </div>
              </section>

              <section style={overviewGridStyle}>
                <div style={panelStyle}>
                  <h3 style={panelTitle}>Best Male Duo</h3>
                  <ChartBars
                    data={gamesStats.categories.bmd.ranking.slice(0, 8)}
                    emptyLabel="No BMD votes yet."
                    onBarClick={(name) => {
                      const rows = gamesStats.categories.bmd.votersBySelection.get(name) ?? [];
                      setDrilldown({ title: `BMD - ${name}`, rows });
                    }}
                    compact={isMobile}
                  />
                </div>
                <div style={panelStyle}>
                  <h3 style={panelTitle}>Best Female Duo</h3>
                  <ChartBars
                    data={gamesStats.categories.bfd.ranking.slice(0, 8)}
                    emptyLabel="No BFD votes yet."
                    onBarClick={(name) => {
                      const rows = gamesStats.categories.bfd.votersBySelection.get(name) ?? [];
                      setDrilldown({ title: `BFD - ${name}`, rows });
                    }}
                    compact={isMobile}
                  />
                </div>
              </section>
            </>
          )}

          {gamesView === "tables" && (
            <>
              <section style={panelStyle}>
                <h3 style={panelTitle}>Self Nominations</h3>
                <p style={mutedText}>Grouped by category</p>

                <div style={overviewGridStyle}>
                  {Object.entries(nominationCategoryLabels).map(([key, label]) => {
                    const names = nominationGroups[key] ?? [];
                    return (
                      <div key={key} style={miniPanel}>
                        <h4 style={miniPanelTitle}>{label}</h4>
                        <div style={mutedTextSmall}>{names.length} submissions</div>
                        {names.length === 0 ? (
                          <p style={mutedText}>No submissions yet.</p>
                        ) : (
                          <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
                            {names.slice(0, 18).map((name, idx) => (
                              <div key={`${name}-${idx}`} style={rowCompact}>{name}</div>
                            ))}
                            {names.length > 18 && (
                              <div style={mutedTextSmall}>+{names.length - 18} more</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              <section style={panelStyle}>
                <h3 style={panelTitle}>CYS Votes</h3>
                <div style={activityTableWrap}>
                  <table style={activityTableStyle}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                        <th style={th}>Time</th>
                        <th style={th}>Submitter</th>
                        <th style={th}>Entry ID</th>
                        <th style={th}>Selected Pair</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rowsByCategory.cys.length === 0 && (
                        <tr>
                          <td style={emptyTd} colSpan={4}>No CYS votes yet.</td>
                        </tr>
                      )}
                      {rowsByCategory.cys.map((item: any) => (
                        <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                          <td style={td}>{item.submittedAtText ?? "-"}</td>
                          <td style={td}>{item.voterName ?? "-"}</td>
                          <td style={td}>{item.voterEntryId ?? "-"}</td>
                          <td style={td}>{item.selection ?? "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section style={overviewGridStyle}>
                <div style={panelStyle}>
                  <h3 style={panelTitle}>MPM Votes</h3>
                  <VoteTable
                    rows={rowsByCategory.mpm}
                    emptyLabel="No MPM votes yet."
                    tableStyle={activityTableStyle}
                  />
                </div>

                <div style={panelStyle}>
                  <h3 style={panelTitle}>MPF Votes</h3>
                  <VoteTable
                    rows={rowsByCategory.mpf}
                    emptyLabel="No MPF votes yet."
                    tableStyle={activityTableStyle}
                  />
                </div>
              </section>

              <section style={overviewGridStyle}>
                <div style={panelStyle}>
                  <h3 style={panelTitle}>BMD Votes</h3>
                  <DuoVoteTable
                    rows={rowsByCategory.bmd}
                    leftLabel="Pair"
                    rightLabel="Votes"
                    emptyLabel="No BMD votes yet."
                    tableStyle={activityTableStyle}
                  />
                </div>

                <div style={panelStyle}>
                  <h3 style={panelTitle}>BFD Votes</h3>
                  <DuoVoteTable
                    rows={rowsByCategory.bfd}
                    leftLabel="Pair"
                    rightLabel="Votes"
                    emptyLabel="No BFD votes yet."
                    tableStyle={activityTableStyle}
                  />
                </div>
              </section>

              <section style={panelStyle}>
                <h3 style={panelTitle}>SWDBITP Votes</h3>
                <VoteTable
                  rows={rowsByCategory.swdbitp}
                  emptyLabel="No SWDBITP votes yet."
                  tableStyle={activityTableStyle}
                />
              </section>
            </>
          )}

          {drilldown && (
            <div style={modalOverlay}>
              <div style={modalCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <h3 style={{ ...panelTitle, marginBottom: 0 }}>{drilldown.title}</h3>
                  <div style={controlsStyle}>
                    <Select value={drillDownloadFormat} onValueChange={(v) => setDrillDownloadFormat(v as "excel" | "pdf")}>
                      <SelectTrigger className="w-[110px] h-9 bg-black/40 border-gold/30 text-champagne">
                        <SelectValue placeholder="Format" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-gold/30 text-champagne">
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                    <button style={csvBtn} onClick={handleDownloadDrilldown}>Download</button>
                    <button style={closeBtn} onClick={() => setDrilldown(null)}>Close</button>
                  </div>
                </div>
                <div style={{ ...controls, margin: "10px 0" }}>
                  <input
                    value={drillSearch}
                    onChange={(e) => setDrillSearch(e.target.value)}
                    placeholder="Search inside drilldown..."
                    style={{ ...filterInput, minWidth: 260 }}
                  />
                  {drillTopVoters.map((voter) => (
                    <button
                      key={voter.entryId}
                      style={smallBtn}
                      onClick={() => setDrillSearch(voter.entryId)}
                    >
                      {voter.name} ({voter.count})
                    </button>
                  ))}
                </div>
                <div style={activityTableWrap}>
                  <table style={activityTableStyle}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                        <th style={th}>Voter</th>
                        <th style={th}>Entry ID</th>
                        <th style={th}>Selection</th>
                        <th style={th}>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drilldownFilteredRows.length === 0 && (
                        <tr>
                          <td style={emptyTd} colSpan={4}>No rows found.</td>
                        </tr>
                      )}
                      {drilldownFilteredRows.map((row, idx) => (
                        <tr key={`${row.voterEntryId}-${idx}`} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                          <td style={td}>
                            <button
                              style={linkBtn}
                              onClick={() => {
                                const rows = filteredGameRows
                                  .filter((r) => r.voterEntryId === row.voterEntryId)
                                  .map((r) => ({
                                    voterName: r.voterName,
                                    voterEntryId: r.voterEntryId,
                                    selection: `${r.categoryLabel}: ${r.selection}`,
                                    submittedAt: r.submittedAtText
                                  }));
                                setDrilldown({
                                  title: `All votes by ${row.voterName} (${row.voterEntryId})`,
                                  rows
                                });
                                setDrillSearch("");
                              }}
                            >
                              {row.voterName}
                            </button>
                          </td>
                          <td style={td}>{row.voterEntryId}</td>
                          <td style={td}>{row.selection}</td>
                          <td style={td}>{row.submittedAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSection === "games_monitor" && (
        <div style={{ display: "grid", gap: 16 }}>
          <section style={overviewGridStyle}>
            <div style={panelStyle}>
              <h3 style={panelTitle}>Download Center</h3>
              <p style={mutedText}>Export report files without CSV clutter</p>
              <div style={controlsStyle}>
                <Select value={downloadFormat} onValueChange={(v) => setDownloadFormat(v as "excel" | "pdf")}>
                  <SelectTrigger className="w-[120px] h-9 bg-black/40 border-gold/30 text-champagne">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-gold/30 text-champagne">
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
                <button style={csvBtn} onClick={handleDownloadFiltered}>Download</button>
              </div>
            </div>

            <div style={panelStyle}>
              <h3 style={panelTitle}>Governance</h3>
              <p style={mutedTextSmall}>Control result finalization and archive mode.</p>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={statRow}>
                  <span style={mutedText}>Finalized</span>
                  <strong>{governanceState.finalized ? "Yes" : "No"}</strong>
                </div>
                <div style={statRow}>
                  <span style={mutedText}>Archive Mode</span>
                  <strong>{governanceState.archiveMode ? "On" : "Off"}</strong>
                </div>
                <input
                  value={governanceSignature}
                  onChange={(e) => setGovernanceSignature(e.target.value)}
                  placeholder="Signature to finalize"
                  style={filterInput}
                />
                <div style={controlsStyle}>
                  <button style={csvBtn} onClick={handleFinalizeResults}>Finalize Results</button>
                  <button style={smallBtn} onClick={handleUnfinalizeResults}>Unfinalize</button>
                  <button style={smallBtn} onClick={handleToggleArchiveMode}>
                    {governanceState.archiveMode ? "Disable Archive" : "Enable Archive"}
                  </button>
                </div>
                {governanceState.finalizedAt && (
                  <p style={mutedTextSmall}>
                    Finalized at {new Date(governanceState.finalizedAt).toLocaleString()} by {governanceState.finalizedBy || "-"}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section style={panelStyle}>
            <h3 style={panelTitle}>Admin Access</h3>
            <p style={mutedTextSmall}>
              Add admin Entry IDs. Super admin is fixed to {SUPER_ADMIN_ENTRY_ID}.
            </p>
            <div style={{ ...controls, marginTop: 8 }}>
                <input
                  value={newAdminEntryId}
                  onChange={(e) => setNewAdminEntryId(e.target.value)}
                  placeholder="Entry ID"
                  style={{ ...filterInput, maxWidth: 220 }}
                />
              <button style={csvBtn} onClick={handleAddAdmin}>Add Admin</button>
            </div>

            <div style={adminAccessList}>
              <div style={adminAccessRow}>
                <div style={{ display: "grid", gap: 2 }}>
                  <span style={adminNameText}>
                    {entryNameMap[SUPER_ADMIN_ENTRY_ID] ?? "Super Admin"} ({SUPER_ADMIN_ENTRY_ID})
                  </span>
                </div>
                <span style={rolePillSuper}>Super Admin</span>
              </div>
              {adminRoles
                .filter((r) => (r.entryId ?? r.id ?? "") !== SUPER_ADMIN_ENTRY_ID)
                .map((admin) => {
                  const adminEntryId = admin.entryId ?? admin.id ?? "";
                  const displayEntryId = adminEntryId || "-";
                  const displayName = entryNameMap[adminEntryId] ?? displayEntryId;
                  return (
                    <div key={admin.id} style={adminAccessRow}>
                      <span style={adminNameText}>
                        {displayName} ({displayEntryId})
                      </span>
                      <div style={controlsStyle}>
                        <span style={rolePillAdmin}>Admin</span>
                        {isSuperAdmin && (
                          <button style={smallBtn} onClick={() => handleRemoveAdmin(adminEntryId)}>
                          Remove
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              {adminRoles.filter((r) => (r.entryId ?? r.id ?? "") !== SUPER_ADMIN_ENTRY_ID).length === 0 && (
                <p style={{ ...mutedText, marginTop: 4 }}>No additional admins added yet.</p>
              )}
            </div>
          </section>

          <section style={panelStyle}>
            <h3 style={panelTitle}>Suspicious Pattern Insights</h3>
            {suspiciousVoteInsights.length === 0 ? (
              <p style={mutedText}>No suspicious patterns detected for current filters.</p>
            ) : (
              <div style={overviewGridStyle}>
                {suspiciousVoteInsights.map((item) => (
                  <div key={item.id} style={miniPanel}>
                    <h4 style={miniPanelTitle}>{item.title}</h4>
                    <p style={mutedText}>{item.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section style={panelStyle}>
            <h3 style={panelTitle}>Admin Action Log</h3>
            {auditLogs.length === 0 ? (
              <p style={mutedText}>No admin actions logged yet.</p>
            ) : (
              <div style={activityTableWrap}>
                <table style={activityTableStyle}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                      <th style={th}>Time</th>
                      <th style={th}>Actor</th>
                      <th style={th}>Action</th>
                      <th style={th}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.slice(0, auditVisibleCount).map((log) => (
                      <tr key={log.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        <td style={td}>{formatGameTime(log)}</td>
                        <td style={td}>{log.actor ?? "-"}</td>
                        <td style={td}>{log.action ?? "-"}</td>
                        <td style={td}>{log.details ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {auditLogs.length > auditVisibleCount && (
              <div style={{ marginTop: 12 }}>
                <button
                  style={smallBtn}
                  onClick={() => setAuditVisibleCount((count) => count + 60)}
                >
                  Load more
                </button>
              </div>
            )}
          </section>
        </div>
      )}
        </>
      )}
      {isMobile && renderMobileContent()}
    </AdminLayout>
  );
}

function VoteTable({
  rows,
  emptyLabel,
  tableStyle
}: {
  rows: any[];
  emptyLabel: string;
  tableStyle: CSSProperties;
}) {
  const [visibleCount, setVisibleCount] = useState(150);
  const visibleRows = rows.slice(0, visibleCount);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={activityTableWrap}>
        <table style={tableStyle}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
              <th style={th}>Time</th>
              <th style={th}>Submitter</th>
              <th style={th}>Entry ID</th>
              <th style={th}>Nominee</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td style={emptyTd} colSpan={4}>{emptyLabel}</td>
              </tr>
            )}
            {visibleRows.map((item) => (
              <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <td style={td}>{item.submittedAtText ?? formatGameTime(item)}</td>
                <td style={td}>{item.voterName ?? item.name ?? "-"}</td>
                <td style={td}>{item.voterEntryId ?? item.entryId ?? "-"}</td>
                <td style={td}>{item.selection ?? item.nomineeName ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > visibleCount && (
        <button style={smallBtn} onClick={() => setVisibleCount((v) => v + 150)}>
          Load More ({rows.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
}

function DuoVoteTable({
  rows,
  leftLabel,
  rightLabel,
  emptyLabel,
  tableStyle
}: {
  rows: any[];
  leftLabel: string;
  rightLabel: string;
  emptyLabel: string;
  tableStyle: CSSProperties;
}) {
  const [visibleCount, setVisibleCount] = useState(150);
  const visibleRows = rows.slice(0, visibleCount);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={activityTableWrap}>
        <table style={tableStyle}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
              <th style={th}>Time</th>
              <th style={th}>Submitter</th>
              <th style={th}>Entry ID</th>
              <th style={th}>{leftLabel}</th>
              <th style={th}>{rightLabel}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td style={emptyTd} colSpan={5}>{emptyLabel}</td>
              </tr>
            )}
            {visibleRows.map((item) => (
              <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <td style={td}>{item.submittedAtText ?? formatGameTime(item)}</td>
                <td style={td}>{item.voterName ?? item.name ?? "-"}</td>
                <td style={td}>{item.voterEntryId ?? item.entryId ?? "-"}</td>
                <td style={td}>{item.selection ?? `${item.male1Name ?? item.female1Name ?? "-"} + ${item.male2Name ?? item.female2Name ?? "-"}`}</td>
                <td style={td}>{item.value ?? 1}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > visibleCount && (
        <button style={smallBtn} onClick={() => setVisibleCount((v) => v + 150)}>
          Load More ({rows.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
}

function ChartDonut({
  data,
  emptyLabel,
  onSliceClick,
  compact
}: {
  data: Array<{ name: string; value: number }>;
  emptyLabel: string;
  onSliceClick: (name: string) => void;
  compact?: boolean;
}) {
  if (!data.length) {
    return <p style={mutedText}>{emptyLabel}</p>;
  }

  return (
    <div style={compact ? { ...chartWrap, minHeight: 220 } : chartWrap}>
      <ResponsiveContainer width="100%" height={compact ? 220 : 280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={95}
            onClick={(entry: any) => onSliceClick(entry?.name)}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={chartPalette[index % chartPalette.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div style={legendWrap}>
        {data.slice(0, 8).map((item, index) => (
          <button
            key={item.name}
            style={legendBtn}
            onClick={() => onSliceClick(item.name)}
          >
            <span
              style={{
                ...legendDot,
                background: chartPalette[index % chartPalette.length]
              }}
            />
            {item.name} ({item.value})
          </button>
        ))}
      </div>
    </div>
  );
}

function ChartBars({
  data,
  emptyLabel,
  onBarClick,
  compact
}: {
  data: Array<{ name: string; value: number }>;
  emptyLabel: string;
  onBarClick: (name: string) => void;
  compact?: boolean;
}) {
  if (!data.length) {
    return <p style={mutedText}>{emptyLabel}</p>;
  }

  return (
    <div style={compact ? { ...chartWrap, minHeight: 220 } : chartWrap}>
      <ResponsiveContainer width="100%" height={compact ? 220 : 280}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
          <XAxis type="number" tick={{ fill: "#d2d7df", fontSize: 11 }} />
          <YAxis
            dataKey="name"
            type="category"
            width={120}
            tick={{ fill: "#d2d7df", fontSize: 11 }}
            tickFormatter={(value) => `${String(value).slice(0, 16)}${String(value).length > 16 ? "..." : ""}`}
          />
          <Tooltip />
          <Bar dataKey="value" radius={[6, 6, 6, 6]} onClick={(entry: any) => onBarClick(entry?.name)}>
            {data.map((_, index) => (
              <Cell key={`bar-${index}`} fill={chartPalette[index % chartPalette.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const overviewGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
  gap: 16
};

const panel: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 14,
  background: "rgba(255,255,255,0.03)",
  padding: 16
};

const panelTitle: CSSProperties = {
  marginTop: 0,
  color: "#ffd57a"
};

const row: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  padding: "8px 0",
  borderBottom: "1px solid rgba(255,255,255,0.08)"
};

const rowCompact: CSSProperties = {
  fontSize: 13,
  color: "#eceff3",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  paddingBottom: 6
};

const miniPanel: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  background: "rgba(255,255,255,0.03)",
  padding: 12
};

const miniPanelTitle: CSSProperties = {
  margin: 0,
  color: "#ffd57a",
  fontSize: 14
};

const adminAccessList: CSSProperties = {
  marginTop: 12,
  display: "grid",
  gap: 8
};

const adminAccessRow: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  background: "rgba(255,255,255,0.03)",
  padding: "10px 12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10
};

const adminNameText: CSSProperties = {
  color: "#eceff3",
  fontSize: 14,
  fontWeight: 600
};

const rolePillSuper: CSSProperties = {
  border: "1px solid rgba(255,213,122,0.6)",
  background: "rgba(255,213,122,0.15)",
  color: "#ffd57a",
  borderRadius: 999,
  padding: "4px 10px",
  fontSize: 11,
  fontWeight: 700
};

const rolePillAdmin: CSSProperties = {
  border: "1px solid rgba(124,196,255,0.6)",
  background: "rgba(124,196,255,0.14)",
  color: "#7cc4ff",
  borderRadius: 999,
  padding: "4px 10px",
  fontSize: 11,
  fontWeight: 700
};

const statRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 10px",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  background: "rgba(255,255,255,0.02)"
};

const mutedText: CSSProperties = {
  color: "#9fa3a9"
};

const mutedTextSmall: CSSProperties = {
  color: "#b8bcc2",
  fontSize: 12
};

const truncateText: CSSProperties = {
  color: "#e4e6eb",
  maxWidth: 180,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};

const searchWrap: CSSProperties = {
  marginBottom: 20
};

const searchInput: CSSProperties = {
  width: "100%",
  maxWidth: 360,
  padding: "11px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  outline: "none"
};

const activityTableWrap: CSSProperties = {
  overflowX: "auto",
  WebkitOverflowScrolling: "touch"
};

const activityTable: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 780
};

const th: CSSProperties = {
  textAlign: "left",
  padding: "11px 10px",
  color: "#d8b35e",
  fontSize: 12,
  letterSpacing: 0.4
};

const td: CSSProperties = {
  padding: "11px 10px",
  fontSize: 13,
  color: "#eceff3"
};

const emptyTd: CSSProperties = {
  padding: "18px 12px",
  textAlign: "center",
  color: "#9fa3a9"
};

const chipWrap: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6
};

const controls: CSSProperties = {
  display: "flex",
  gap: 6,
  flexWrap: "wrap"
};

const gamesFilterGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 10
};

const filterCell: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6
};

const filterLabel: CSSProperties = {
  fontSize: 12,
  color: "#d8b35e"
};

const filterInput: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 8,
  padding: "8px 10px",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  outline: "none"
};

const smallBtn: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 8,
  padding: "7px 9px",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700,
  color: "#fff",
  background: "rgba(255,255,255,0.06)"
};

const csvBtn: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 8,
  padding: "6px 10px",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700,
  color: "#111",
  background: "#ffd57a"
};

const toggleViewBtn = (active: boolean): CSSProperties => ({
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 8,
  padding: "6px 10px",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700,
  color: active ? "#111" : "#fff",
  background: active ? "#ffd57a" : "rgba(255,255,255,0.06)"
});

const chartWrap: CSSProperties = {
  width: "100%",
  minHeight: 280
};

const legendWrap: CSSProperties = {
  display: "grid",
  gap: 6
};

const legendBtn: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 8,
  padding: "6px 8px",
  background: "rgba(255,255,255,0.03)",
  color: "#e8ecf2",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
  textAlign: "left"
};

const legendDot: CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: 999
};

const modalOverlay: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.65)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 16,
  zIndex: 50
};

const modalCard: CSSProperties = {
  width: "min(980px, 100%)",
  maxHeight: "85vh",
  overflow: "auto",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 14,
  background: "#111418",
  padding: 14
};

const closeBtn: CSSProperties = {
  border: "none",
  borderRadius: 8,
  padding: "6px 10px",
  background: "#ff4d4f",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700
};

const linkBtn: CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#7cc4ff",
  cursor: "pointer",
  textDecoration: "underline",
  padding: 0,
  fontSize: 13
};

const blockBtn = (blocked: boolean): CSSProperties => ({
  border: "none",
  borderRadius: 7,
  padding: "5px 9px",
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 700,
  background: blocked ? "#2f7d32" : "#ff4d4f",
  color: "#fff"
});

const warnBtn = (active: boolean): CSSProperties => ({
  border: "none",
  borderRadius: 7,
  padding: "5px 9px",
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 700,
  background: active ? "#8b1a1a" : "#ff8c42",
  color: "#fff"
});

const clearWarnBtn: CSSProperties = {
  border: "none",
  borderRadius: 7,
  padding: "5px 9px",
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 700,
  background: "#3b82f6",
  color: "#fff"
};

const badge = (color: string): CSSProperties => ({
  border: `1px solid ${color}`,
  color,
  borderRadius: 999,
  padding: "3px 10px",
  fontSize: 11,
  fontWeight: 700
});

const shortDevice = (deviceId: string) => {
  if (deviceId.length <= 16) return deviceId;
  return `${deviceId.slice(0, 8)}...${deviceId.slice(-6)}`;
};

const formatLogTime = (log: ActivityLog) => {
  const dateFromTimestamp = log.timestamp?.toDate?.();
  if (dateFromTimestamp instanceof Date) {
    return dateFromTimestamp.toLocaleString();
  }

  if (log.clientTime) {
    const parsed = new Date(log.clientTime);
    if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleString();
  }

  return "-";
};

const formatGameTime = (record: { timestamp?: { toDate?: () => Date } }) => {
  const dateFromTimestamp = record.timestamp?.toDate?.();
  if (dateFromTimestamp instanceof Date) {
    return dateFromTimestamp.toLocaleString();
  }
  return "-";
};

const getRecordDate = (record: { timestamp?: { toDate?: () => Date } }) => {
  const dateFromTimestamp = record.timestamp?.toDate?.();
  return dateFromTimestamp instanceof Date ? dateFromTimestamp : null;
};

const canonicalGuestName = (
  fallbackName: string | undefined,
  entryId: string | undefined,
  entryNameMap: Record<string, string>
) => {
  const byEntry = entryId ? entryNameMap[entryId] : undefined;
  const trimmedFallback = (fallbackName ?? "").trim();
  return byEntry || trimmedFallback || "-";
};

const normalizeDuoPair = (
  name1?: string,
  entryId1?: string,
  name2?: string,
  entryId2?: string,
  entryNameMap?: Record<string, string>
) => {
  const left = {
    name: canonicalGuestName(name1, entryId1, entryNameMap ?? {}),
    entryId: entryId1 ?? "",
  };
  const right = {
    name: canonicalGuestName(name2, entryId2, entryNameMap ?? {}),
    entryId: entryId2 ?? "",
  };
  const pair = [left, right].sort((a, b) => {
    const aKey = (a.entryId || a.name).toLowerCase();
    const bKey = (b.entryId || b.name).toLowerCase();
    return aKey.localeCompare(bKey);
  });
  return `${pair[0].name} + ${pair[1].name}`;
};

const toInputDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const sanitizeFileName = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
