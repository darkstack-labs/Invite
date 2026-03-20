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

const adminSectionConfig: Array<{ key: Section; label: string; title: string }> = [
  { key: "overview", label: "Overview", title: "Admin Dashboard" },
  { key: "rsvps", label: "RSVP Manager", title: "RSVP Manager" },
  { key: "songs", label: "Song Requests", title: "Song Requests" },
  { key: "suggestions", label: "Suggestions", title: "Guest Suggestions" },
  { key: "activity", label: "Activity Monitor", title: "Activity Monitor" },
  { key: "device_watch", label: "Device Watch", title: "Device Watch" },
  { key: "games", label: "Games Votes", title: "Games Votes" },
  { key: "games_monitor", label: "Control Room", title: "Control Room" }
];

export default function AdminDashboard(): JSX.Element {
  const { user } = useAuth();

  /* ---------------- STATE ---------------- */

  const [activeSection, setActiveSection] = useState<Section>("overview");
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

  /* ---------------- DATA HOOKS ---------------- */

  const rsvps = useRSVPs(authenticated) ?? [];
  const songs = useSongs(authenticated) ?? [];
  const suggestions = useSuggestions(authenticated) ?? [];
  const activityLogs = useActivityLogs(authenticated) ?? [];
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
  const [incidentModeOpen, setIncidentModeOpen] = useState(false);
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
  const activeSectionMeta =
    adminSectionConfig.find((section) => section.key === activeSection) ?? adminSectionConfig[0];
  const mobileOverviewGrid = { ...overviewGrid, gridTemplateColumns: "1fr", gap: 12 };
  const mobilePanel = { ...panel, padding: 12 };
  const mobileActivityTable = { ...activityTable, minWidth: 640 };
  const mobileControls = { ...controls, flexWrap: "wrap", width: "100%", gap: 8 };
  const mobileChipWrap = { ...chipWrap, flexDirection: "column", alignItems: "stretch", gap: 8 };
  const mobileSearchInput = { ...searchInput, maxWidth: "100%", padding: "9px 10px", fontSize: 13 };
  const mobileFilterGrid = { ...gamesFilterGrid, gridTemplateColumns: "1fr", gap: 10 };
  const mobileStack = { display: "grid", gap: 12 };

  const overviewGridStyle = isMobile ? mobileOverviewGrid : overviewGrid;
  const panelStyle = isMobile ? mobilePanel : panel;
  const activityTableStyle = isMobile ? mobileActivityTable : activityTable;
  const controlsStyle = isMobile ? mobileControls : controls;
  const chipWrapStyle = isMobile ? mobileChipWrap : chipWrap;
  const searchInputStyle = isMobile ? mobileSearchInput : searchInput;
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

  const activeWarnings = useMemo(() => {
    return Array.from(guestWarnings.values())
      .filter((warning) => warning.isActive)
      .sort((a, b) => Number(b.warningCount ?? 0) - Number(a.warningCount ?? 0));
  }, [guestWarnings]);


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

  const mealMixData = useMemo(
    () =>
      [
        { name: "Veg", value: stats.veg },
        { name: "Non-Veg", value: stats.nonVeg }
      ].filter((item) => item.value > 0),
    [stats.veg, stats.nonVeg]
  );

  const activityTrendData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      return date;
    });

    return days.map((day) => {
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      const count = activityLogs.filter((log) => {
        const logDate = log.timestamp?.toDate?.() ?? (log.clientTime ? new Date(log.clientTime) : null);
        if (!(logDate instanceof Date) || Number.isNaN(logDate.getTime())) return false;
        return logDate >= day && logDate < next;
      }).length;

      return {
        name: day.toLocaleDateString([], { month: "short", day: "numeric" }),
        value: count
      };
    });
  }, [activityLogs]);

  const actionBreakdownData = useMemo(() => {
    const counts = new Map<string, number>();
    activityLogs.forEach((log) => {
      const key = (log.type ?? "unknown").trim() || "unknown";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [activityLogs]);

  const deviceRiskRows = useMemo(() => {
    return allDevices
      .map((device) => {
        const warningHits = device.accountPairs.reduce((sum, pair) => {
          const warningCount = Number(guestWarnings.get(pair.entryId)?.warningCount ?? 0);
          return sum + warningCount;
        }, 0);

        const score = Math.min(
          100,
          device.accounts.length * 22 +
            Math.min(device.events, 20) * 2 +
            (blockedDeviceIds.has(device.deviceId) ? 18 : 0) +
            warningHits * 8
        );

        return {
          ...device,
          warningHits,
          score
        };
      })
      .sort((a, b) => b.score - a.score || b.events - a.events)
      .slice(0, 6);
  }, [allDevices, guestWarnings, blockedDeviceIds]);

  const recentActivityCount = useMemo(() => {
    const threshold = Date.now() - 24 * 60 * 60 * 1000;
    return activityLogs.filter((log) => {
      const date = log.timestamp?.toDate?.() ?? (log.clientTime ? new Date(log.clientTime) : null);
      return date instanceof Date && !Number.isNaN(date.getTime()) && date.getTime() >= threshold;
    }).length;
  }, [activityLogs]);

  const incidentCards = useMemo(
    () => [
      {
        id: "warnings",
        label: "Active Warnings",
        value: String(activeWarnings.length),
        tone: activeWarnings.length > 0 ? "#ff7b7b" : "#7cc4ff"
      },
      {
        id: "devices",
        label: "Flagged Devices",
        value: String(suspiciousDevices.length),
        tone: suspiciousDevices.length > 0 ? "#ffd57a" : "#7cc4ff"
      },
      {
        id: "votes",
        label: "Vote Insights",
        value: String(suspiciousVoteInsights.length),
        tone: suspiciousVoteInsights.length > 0 ? "#c2a2ff" : "#7cc4ff"
      },
      {
        id: "events",
        label: "Suspicious Events",
        value: String(suspiciousEvents.length),
        tone: suspiciousEvents.length > 0 ? "#ffb05c" : "#7cc4ff"
      }
    ],
    [
      activeWarnings.length,
      suspiciousDevices.length,
      suspiciousVoteInsights.length,
      suspiciousEvents.length
    ]
  );

  const missionControlMetrics = useMemo(() => {
    const riskIndex = Math.min(
      100,
      suspiciousDevices.length * 18 +
        activeWarnings.length * 12 +
        suspiciousVoteInsights.length * 9 +
        blockedDeviceIds.size * 6
    );

    const guestResponse = stats.total > 0 ? Math.round((stats.attending / stats.total) * 100) : 0;
    const voteIntegrity = Math.max(
      0,
      100 - suspiciousVoteInsights.length * 10 - suspiciousDevices.length * 6 - activeWarnings.length * 4
    );
    const opsLoad = Math.min(100, recentActivityCount * 4 + activityLogs.length / 10);

    return [
      {
        label: "Risk Index",
        value: riskIndex,
        tone: riskIndex >= 70 ? "#ff7b7b" : riskIndex >= 40 ? "#ffd57a" : "#49d17d"
      },
      {
        label: "Guest Response",
        value: guestResponse,
        tone: "#7cc4ff"
      },
      {
        label: "Vote Integrity",
        value: voteIntegrity,
        tone: voteIntegrity < 60 ? "#ffb05c" : "#8ddf8d"
      },
      {
        label: "Ops Load",
        value: Math.round(opsLoad),
        tone: "#c2a2ff"
      }
    ];
  }, [
    suspiciousDevices.length,
    activeWarnings.length,
    suspiciousVoteInsights.length,
    blockedDeviceIds.size,
    stats.total,
    stats.attending,
    recentActivityCount,
    activityLogs.length
  ]);

  const overviewCommandCards = useMemo(
    () => [
      {
        id: "risk",
        eyebrow: "Moderation",
        title: "Review live activity",
        copy: "Jump into event logs and device abuse checks when the dashboard sees risky overlap.",
        value: `${suspiciousDevices.length} flagged devices`,
        action: () => setActiveSection("activity")
      },
      {
        id: "guest",
        eyebrow: "Guests",
        title: "Clean up RSVPs",
        copy: "Fix attendance, meals, and final guest state before event-day operations.",
        value: `${stats.attending}/${stats.total} attending`,
        action: () => setActiveSection("rsvps")
      },
      {
        id: "games",
        eyebrow: "Votes",
        title: "Inspect games analytics",
        copy: "Open charts, drilldowns, and suspicious voting insights with current filters.",
        value: `${gamesStats.uniqueVoterCount} unique voters`,
        action: () => setActiveSection("games")
      },
      {
        id: "governance",
        eyebrow: "Control",
        title: "Lock governance actions",
        copy: "Export reports, manage admin access, and control result finalization.",
        value: governanceState.finalized ? "Results finalized" : "Results open",
        action: () => setActiveSection("games_monitor")
      }
    ],
    [
      suspiciousDevices.length,
      stats.attending,
      stats.total,
      gamesStats.uniqueVoterCount,
      governanceState.finalized
    ]
  );

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

  const layoutStatusItems = useMemo(() => {
    switch (activeSection) {
      case "overview":
        return [
          { label: "Role", value: authBadge },
          { label: "Warnings", value: String(activeWarnings.length) },
          { label: "Flagged Devices", value: String(suspiciousDevices.length) },
          { label: "Games Participation", value: `${gamesStats.participationRate}%` }
        ];
      case "rsvps":
        return [
          { label: "Guests", value: String(stats.total) },
          { label: "Attending", value: String(stats.attending) },
          { label: "Veg", value: String(stats.veg) },
          { label: "Non-Veg", value: String(stats.nonVeg) }
        ];
      case "songs":
        return [
          { label: "Requests", value: String(songs.length) },
          { label: "Latest Slice", value: String(recentSongs.length) },
          { label: "Role", value: authBadge }
        ];
      case "suggestions":
        return [
          { label: "Suggestions", value: String(suggestions.length) },
          { label: "Active Warnings", value: String(activeWarnings.length) },
          { label: "Role", value: authBadge }
        ];
      case "activity":
        return [
          { label: "Events", value: String(activityLogs.length) },
          { label: "Warnings", value: String(activeWarnings.length) },
          { label: "Flagged Devices", value: String(suspiciousDevices.length) }
        ];
      case "device_watch":
        return [
          { label: "Tracked Devices", value: String(allDevices.length) },
          { label: "Suspicious", value: String(suspiciousDevices.length) },
          { label: "Blocked", value: String(blockedDeviceIds.size) }
        ];
      case "games":
        return [
          { label: "Unique Voters", value: String(gamesStats.uniqueVoterCount) },
          { label: "Participation", value: `${gamesStats.participationRate}%` },
          { label: "Insights", value: String(suspiciousVoteInsights.length) }
        ];
      case "games_monitor":
        return [
          { label: "Admins", value: String(adminRoles.length + 1) },
          { label: "Audit Logs", value: String(auditLogs.length) },
          { label: "Finalized", value: governanceState.finalized ? "Yes" : "No" }
        ];
      default:
        return [];
    }
  }, [
    activeSection,
    authBadge,
    activeWarnings.length,
    suspiciousDevices.length,
    gamesStats.participationRate,
    stats.total,
    stats.attending,
    stats.veg,
    stats.nonVeg,
    songs.length,
    recentSongs.length,
    suggestions.length,
    activityLogs.length,
    allDevices.length,
    blockedDeviceIds.size,
    gamesStats.uniqueVoterCount,
    suspiciousVoteInsights.length,
    adminRoles.length,
    auditLogs.length,
    governanceState.finalized
  ]);

  const shouldShowIncidentShortcut = useMemo(
    () => ["overview", "activity", "device_watch", "games_monitor"].includes(activeSection),
    [activeSection]
  );

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
        style={loginShell}
      >
        <div style={loginGlowTop} aria-hidden="true" />
        <div style={loginGlowBottom} aria-hidden="true" />
        <div style={loginCard}>
          <div style={loginHeader}>
            <p style={loginEyebrow}>Invite Ops</p>
            <h2 style={loginTitle}>Admin Command Access</h2>
            <p style={loginCopy}>
              Sign in with an allowed entry ID to review guests, moderation, devices, and game control.
            </p>
          </div>

          <input
            type="text"
            placeholder="Enter admin Entry ID"
            value={loginEntryId}
            onChange={(e) => setLoginEntryId(e.target.value)}
            style={loginInput}
          />

          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={loginInput}
          />

          <button
            style={loginButton}
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

          <div style={loginMetaRow}>
            <div style={loginMetaCard}>
              <span style={loginMetaLabel}>Access model</span>
              <strong style={loginMetaValue}>Entry ID + password</strong>
            </div>
            <div style={loginMetaCard}>
              <span style={loginMetaLabel}>Surface</span>
              <strong style={loginMetaValue}>Admin only</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- DASHBOARD ---------------- */

  const renderMobileContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div style={mobilePage}>
            <section style={mobileHero}>
              <p style={mobileHeroEyebrow}>Admin Dashboard</p>
              <h2 style={mobileHeroTitle}>Live Event Control</h2>
              <p style={mobileHeroCopy}>Mobile-first monitoring for RSVPs, activity, devices, and voting health.</p>
              <div style={mobileKpiGrid}>
                <div style={mobileKpiCard}>
                  <span style={mobileKpiLabel}>RSVP Total</span>
                  <span style={mobileKpiValue}>{stats.total}</span>
                </div>
                <div style={mobileKpiCard}>
                  <span style={mobileKpiLabel}>Attending</span>
                  <span style={mobileKpiValue}>{stats.attending}</span>
                </div>
                <div style={mobileKpiCard}>
                  <span style={mobileKpiLabel}>Veg Meals</span>
                  <span style={mobileKpiValue}>{stats.veg}</span>
                </div>
                <div style={mobileKpiCard}>
                  <span style={mobileKpiLabel}>Non-Veg Meals</span>
                  <span style={mobileKpiValue}>{stats.nonVeg}</span>
                </div>
                <div style={mobileKpiCard}>
                  <span style={mobileKpiLabel}>Suspicious Devices</span>
                  <span style={mobileKpiValue}>{suspiciousDevices.length}</span>
                </div>
                <div style={mobileKpiCard}>
                  <span style={mobileKpiLabel}>Current Role</span>
                  <span style={mobileKpiValue}>{authBadge}</span>
                </div>
              </div>
            </section>

            <section style={panelStyle}>
              <div style={mobileSectionHeader}>
                <p style={mobileSectionEyebrow}>Action Center</p>
                <h3 style={mobileSectionTitle}>Fast routes into the highest-leverage work</h3>
                <p style={mobileSectionCopy}>This compresses the busiest admin moves into one place so mobile stays as capable as desktop.</p>
              </div>
              <div style={commandCardGrid}>
                {overviewCommandCards.map((item) => (
                  <button key={item.id} style={commandCard} onClick={item.action}>
                    <span style={commandCardEyebrow}>{item.eyebrow}</span>
                    <strong style={commandCardTitle}>{item.title}</strong>
                    <span style={commandCardCopy}>{item.copy}</span>
                    <span style={commandCardValue}>{item.value}</span>
                  </button>
                ))}
              </div>
            </section>

            <section style={panelStyle}>
              <div style={mobileSectionHeader}>
                <p style={mobileSectionEyebrow}>Alerts</p>
                <h3 style={mobileSectionTitle}>Warning watchlist</h3>
                <p style={mobileSectionCopy}>Guests with active warnings stay visible here for faster moderation follow-up.</p>
              </div>
              {activeWarnings.length === 0 ? (
                <p style={mutedText}>No active warnings right now.</p>
              ) : (
                <div style={mobileFeed}>
                  {activeWarnings.slice(0, 4).map((warning) => (
                    <article key={warning.entryId} style={alertRailCard}>
                      <div style={mobileLogHeader}>
                        <div>
                          <p style={mobileLogTitle}>{warning.name || warning.entryId}</p>
                          <p style={mutedTextSmall}>Entry ID {warning.entryId}</p>
                        </div>
                        <span style={badge("#ff6b6b")}>Warnings: {warning.warningCount}</span>
                      </div>
                      <p style={alertRailCopy}>{warning.message}</p>
                      <div style={controlsStyle}>
                        {renderGuestModerationControls(warning.entryId, warning.name)}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section style={panelStyle}>
              <div style={mobileSectionHeader}>
                <p style={mobileSectionEyebrow}>Mission Control</p>
                <h3 style={mobileSectionTitle}>Live signals that explain event health</h3>
                <p style={mobileSectionCopy}>This is the compact operations layer: risk, response, vote quality, and recent load.</p>
              </div>
              <div style={missionMetricGrid}>
                {missionControlMetrics.map((metric) => (
                  <article key={metric.label} style={missionMetricCard}>
                    <div style={missionMetricHeader}>
                      <span style={missionMetricLabel}>{metric.label}</span>
                      <strong style={{ ...missionMetricValue, color: metric.tone }}>{metric.value}%</strong>
                    </div>
                    <div style={metricTrack}>
                      <div
                        style={{
                          ...metricFill(metric.value),
                          background: `linear-gradient(90deg, ${metric.tone}, rgba(255,255,255,0.18))`
                        }}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section style={panelStyle}>
              <div style={mobileSectionHeader}>
                <p style={mobileSectionEyebrow}>Visuals</p>
                <h3 style={mobileSectionTitle}>Operational mix and trendlines</h3>
                <p style={mobileSectionCopy}>Deeper data viz for meals, live activity, and action composition.</p>
              </div>
              <div style={mobileStack}>
                <div style={mobileMiniCard}>
                  <h4 style={miniPanelTitle}>Meal Mix</h4>
                  <ChartDonut data={mealMixData} emptyLabel="No meal selections yet." onSliceClick={() => null} compact />
                </div>
                <div style={mobileMiniCard}>
                  <h4 style={miniPanelTitle}>Activity Trend</h4>
                  <ChartBars data={activityTrendData} emptyLabel="No activity yet." onBarClick={() => setActiveSection("activity")} compact />
                </div>
                <div style={mobileMiniCard}>
                  <h4 style={miniPanelTitle}>Action Breakdown</h4>
                  <ChartDonut data={actionBreakdownData} emptyLabel="No actions yet." onSliceClick={() => setActiveSection("activity")} compact />
                </div>
              </div>
            </section>

            <section style={panelStyle}>
              <div style={mobileSectionHeader}>
                <p style={mobileSectionEyebrow}>Risk</p>
                <h3 style={mobileSectionTitle}>Device pressure ladder</h3>
                <p style={mobileSectionCopy}>The highest-risk devices are ranked with account overlap, event volume, and warning linkage.</p>
              </div>
              {deviceRiskRows.length === 0 ? (
                <p style={mutedText}>No device pressure detected yet.</p>
              ) : (
                <div style={riskList}>
                  {deviceRiskRows.map((device) => (
                    <article key={device.deviceId} style={riskItemCard}>
                      <div style={riskItemHeader}>
                        <div>
                          <strong style={riskItemTitle}>{shortDevice(device.deviceId)}</strong>
                          <p style={riskItemCopy}>{device.accounts.length} accounts • {device.events} events • {device.warningHits} warning hits</p>
                        </div>
                        <span style={badge(device.score >= 70 ? "#ff7b7b" : device.score >= 40 ? "#ffd57a" : "#7cc4ff")}>
                          Risk {device.score}
                        </span>
                      </div>
                      <div style={metricTrack}>
                        <div
                          style={{
                            ...metricFill(device.score),
                            background:
                              device.score >= 70
                                ? "linear-gradient(90deg, #ff7b7b, rgba(255,123,123,0.18))"
                                : device.score >= 40
                                  ? "linear-gradient(90deg, #ffd57a, rgba(255,213,122,0.18))"
                                  : "linear-gradient(90deg, #7cc4ff, rgba(124,196,255,0.18))"
                          }}
                        />
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <div style={mobileCardGrid}>
              <section style={mobileMiniCard}>
                <div style={mobileSectionHeader}>
                  <p style={mobileSectionEyebrow}>Guests</p>
                  <h3 style={mobileSectionTitle}>Latest RSVP</h3>
                </div>
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

              <section style={mobileMiniCard}>
                <div style={mobileSectionHeader}>
                  <p style={mobileSectionEyebrow}>Music</p>
                  <h3 style={mobileSectionTitle}>Recent Songs</h3>
                </div>
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

              <section style={mobileMiniCard}>
                <div style={mobileSectionHeader}>
                  <p style={mobileSectionEyebrow}>Feedback</p>
                  <h3 style={mobileSectionTitle}>Recent Suggestions</h3>
                </div>
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

              <section style={mobileMiniCard}>
                <div style={mobileSectionHeader}>
                  <p style={mobileSectionEyebrow}>Risk</p>
                  <h3 style={mobileSectionTitle}>Suspicious Devices</h3>
                </div>
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

            <section style={panelStyle}>
              <div style={mobileSectionHeader}>
                <p style={mobileSectionEyebrow}>Monitor</p>
                <h3 style={mobileSectionTitle}>Recent Suspicious Activity</h3>
                <p style={mobileSectionCopy}>Swipe horizontally if the controls table extends beyond the viewport.</p>
              </div>
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
            <RSVPTable guests={filteredGuests} canManage={isAdmin} />
          </>
        );
      case "songs":
        return <SongsTable songs={songs} onDelete={handleDeleteSong} canManage={isAdmin} />;
      case "suggestions":
        return <SuggestionsTable suggestions={suggestions} onDelete={handleDeleteSuggestion} canManage={isAdmin} />;
      case "activity":
        return (
          <div style={mobilePage}>
            <section style={panelStyle}>
              <div style={mobileSectionHeader}>
                <p style={mobileSectionEyebrow}>Activity Intelligence</p>
                <h3 style={mobileSectionTitle}>Trend, composition, and live load</h3>
                <p style={mobileSectionCopy}>Mobile gets the same signal layer: event trend, action mix, and ops pressure.</p>
              </div>
              <div style={mobileStack}>
                <div style={mobileMiniCard}>
                  <h4 style={miniPanelTitle}>Activity Trend</h4>
                  <ChartBars data={activityTrendData} emptyLabel="No activity yet." onBarClick={() => null} compact />
                </div>
                <div style={mobileMiniCard}>
                  <h4 style={miniPanelTitle}>Action Breakdown</h4>
                  <ChartDonut data={actionBreakdownData} emptyLabel="No actions yet." onSliceClick={() => null} compact />
                </div>
                <div style={missionMetricGrid}>
                  <article style={missionMetricCard}>
                    <div style={missionMetricHeader}>
                      <span style={missionMetricLabel}>Last 24h</span>
                      <strong style={missionMetricValue}>{recentActivityCount}</strong>
                    </div>
                  </article>
                  <article style={missionMetricCard}>
                    <div style={missionMetricHeader}>
                      <span style={missionMetricLabel}>Warnings</span>
                      <strong style={missionMetricValue}>{activeWarnings.length}</strong>
                    </div>
                  </article>
                </div>
              </div>
            </section>

            <section style={panelStyle}>
              <div style={mobileSectionHeader}>
                <p style={mobileSectionEyebrow}>Activity</p>
                <h3 style={mobileSectionTitle}>Recent Activity Logs</h3>
                <p style={mobileSectionCopy}>Operational log with moderation actions and device controls.</p>
              </div>
              {activityLogs.length === 0 ? (
                <p style={mutedText}>No activity logs yet.</p>
              ) : (
                <div style={mobileFeed}>
                  {activityLogs.slice(0, activityVisibleCount).map((log: ActivityLog) => (
                    <article key={log.id} style={mobileLogCard}>
                      <div style={mobileLogHeader}>
                        <div>
                          <p style={mobileLogTitle}>{log.type ?? "Unknown action"}</p>
                          <p style={mutedTextSmall}>{formatLogTime(log)}</p>
                        </div>
                        {log.deviceId ? (
                          <span style={badge(blockedDeviceIds.has(log.deviceId) ? "#ff4d4f" : "#7cc4ff")}>
                            {blockedDeviceIds.has(log.deviceId) ? "Blocked Device" : "Device Active"}
                          </span>
                        ) : (
                          <span style={badge("#7f8a96")}>No Device</span>
                        )}
                      </div>

                      <div style={mobileMetaGrid}>
                        <div style={mobileMetaItem}>
                          <span style={mobileMetaLabel}>Guest</span>
                          <span style={mobileMetaValue}>{log.name ?? "-"}</span>
                        </div>
                        <div style={mobileMetaItem}>
                          <span style={mobileMetaLabel}>Entry ID</span>
                          <span style={mobileMetaValue}>{log.entryId ?? "-"}</span>
                        </div>
                        <div style={mobileMetaItem}>
                          <span style={mobileMetaLabel}>Device</span>
                          <span style={mobileMetaValue}>{shortDevice(log.deviceId ?? "unknown-device")}</span>
                        </div>
                        <div style={mobileMetaItem}>
                          <span style={mobileMetaLabel}>Details</span>
                          <span style={mobileMetaValue}>{log.details || "-"}</span>
                        </div>
                      </div>

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
                    </article>
                  ))}
                </div>
              )}
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
          </div>
        );
      case "device_watch":
        return (
          <div style={mobilePage}>
            <section style={panelStyle}>
              <div style={mobileSectionHeader}>
                <p style={mobileSectionEyebrow}>Risk Ladder</p>
                <h3 style={mobileSectionTitle}>Mobile device intelligence</h3>
                <p style={mobileSectionCopy}>Ranked pressure view for device overlap, event volume, and warning-linked accounts.</p>
              </div>
              <div style={mobileStack}>
                <div style={mobileMiniCard}>
                  <h4 style={miniPanelTitle}>Overlap Pulse</h4>
                  <ChartBars
                    data={deviceRiskRows.map((device) => ({ name: shortDevice(device.deviceId), value: device.accounts.length }))}
                    emptyLabel="No overlap yet."
                    onBarClick={() => null}
                    compact
                  />
                </div>
                {deviceRiskRows.length > 0 && (
                  <div style={riskList}>
                    {deviceRiskRows.map((device) => (
                      <article key={device.deviceId} style={riskItemCard}>
                        <div style={riskItemHeader}>
                          <div>
                            <strong style={riskItemTitle}>{shortDevice(device.deviceId)}</strong>
                            <p style={riskItemCopy}>{device.accounts.length} accounts • {device.events} events • {device.warningHits} warning hits</p>
                          </div>
                          <span style={badge(device.score >= 70 ? "#ff7b7b" : device.score >= 40 ? "#ffd57a" : "#7cc4ff")}>
                            Risk {device.score}
                          </span>
                        </div>
                        <div style={metricTrack}>
                          <div
                            style={{
                              ...metricFill(device.score),
                              background:
                                device.score >= 70
                                  ? "linear-gradient(90deg, #ff7b7b, rgba(255,123,123,0.18))"
                                  : device.score >= 40
                                    ? "linear-gradient(90deg, #ffd57a, rgba(255,213,122,0.18))"
                                    : "linear-gradient(90deg, #7cc4ff, rgba(124,196,255,0.18))"
                            }}
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section style={panelStyle}>
              <div style={mobileSectionHeader}>
                <p style={mobileSectionEyebrow}>Devices</p>
                <h3 style={mobileSectionTitle}>All Devices</h3>
                <p style={mobileSectionCopy}>Device-level review for multi-account behavior and manual blocking.</p>
              </div>

              {allDevices.length === 0 ? (
                <p style={mutedText}>No device logs found yet.</p>
              ) : (
                <div style={mobileFeed}>
                  {allDevices.map((device) => (
                    <article key={device.deviceId} style={mobileLogCard}>
                      <div style={mobileLogHeader}>
                        <div>
                          <p style={mobileLogTitle}>{shortDevice(device.deviceId)}</p>
                          <p style={mutedTextSmall}>{device.events} logged events</p>
                        </div>
                        <span style={badge(blockedDeviceIds.has(device.deviceId) ? "#ff4d4f" : "#ff8c42")}>
                          {blockedDeviceIds.has(device.deviceId) ? "Blocked" : `${device.accounts.length} accounts`}
                        </span>
                      </div>

                      <div style={mobileMetaGrid}>
                        <div style={mobileMetaItem}>
                          <span style={mobileMetaLabel}>Accounts</span>
                          <span style={mobileMetaValue}>{device.accounts.join(", ") || "-"}</span>
                        </div>
                        <div style={mobileMetaItem}>
                          <span style={mobileMetaLabel}>Guests</span>
                          <span style={mobileMetaValue}>{device.names.join(", ") || "-"}</span>
                        </div>
                      </div>

                      <div style={chipWrapStyle}>
                        {device.accountPairs.map((item) => (
                          <div key={item.entryId}>
                            {renderGuestModerationControls(item.entryId, item.name)}
                          </div>
                        ))}
                      </div>

                      <div style={controlsStyle}>
                        <button
                          style={blockBtn(blockedDeviceIds.has(device.deviceId))}
                          onClick={() => handleToggleDeviceBlock(device.deviceId)}
                          disabled={!isAdmin}
                        >
                          {blockedDeviceIds.has(device.deviceId) ? "Unblock Device" : "Block Device"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        );
      case "games":
        return (
          <div style={mobilePage}>
            <section style={mobileHero}>
              <p style={mobileHeroEyebrow}>Games Votes</p>
              <h2 style={mobileHeroTitle}>Voting Intelligence</h2>
              <p style={mobileHeroCopy}>Fast mobile access to participation, rankings, drilldown voters, and suspicious patterns.</p>
              <div style={mobileKpiGrid}>
                <div style={mobileKpiCard}>
                  <span style={mobileKpiLabel}>Unique Voters</span>
                  <span style={mobileKpiValue}>{gamesStats.uniqueVoterCount}</span>
                </div>
                <div style={mobileKpiCard}>
                  <span style={mobileKpiLabel}>Participation</span>
                  <span style={mobileKpiValue}>{gamesStats.participationRate}%</span>
                </div>
                <div style={mobileKpiCard}>
                  <span style={mobileKpiLabel}>Rows in View</span>
                  <span style={mobileKpiValue}>{filteredGameRows.length}</span>
                </div>
                <div style={mobileKpiCard}>
                  <span style={mobileKpiLabel}>Mode</span>
                  <span style={mobileKpiValue}>{gamesView === "analytics" ? "Charts" : "Tables"}</span>
                </div>
              </div>
            </section>

            <section style={panelStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div>
                  <p style={mobileSectionEyebrow}>View</p>
                  <h3 style={mobileSectionTitle}>Games Analytics</h3>
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
              <div style={mobileSectionHeader}>
                <p style={mobileSectionEyebrow}>Filters</p>
                <h3 style={mobileSectionTitle}>Query Votes</h3>
              </div>
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
                      <button style={csvBtn} onClick={handleDownloadDrilldown}>
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

                  {drillTopVoters.length > 0 && (
                    <div style={{ ...controlsStyle, marginTop: 10 }}>
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
                  )}

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
          <div style={mobilePage}>
            <section style={mobileHero}>
              <p style={mobileHeroEyebrow}>Admin Monitor</p>
              <h2 style={mobileHeroTitle}>Governance and Audit</h2>
              <p style={mobileHeroCopy}>Mobile controls for exports, result governance, admin access, and audit visibility.</p>
              <div style={mobileKpiGrid}>
                <div style={mobileKpiCard}>
                  <span style={mobileKpiLabel}>Audit Entries</span>
                  <span style={mobileKpiValue}>{auditLogs.length}</span>
                </div>
                <div style={mobileKpiCard}>
                  <span style={mobileKpiLabel}>Admins</span>
                  <span style={mobileKpiValue}>{adminRoles.length + 1}</span>
                </div>
                <div style={mobileKpiCard}>
                  <span style={mobileKpiLabel}>Finalized</span>
                  <span style={mobileKpiValue}>{governanceState.finalized ? "Yes" : "No"}</span>
                </div>
                <div style={mobileKpiCard}>
                  <span style={mobileKpiLabel}>Archive</span>
                  <span style={mobileKpiValue}>{governanceState.archiveMode ? "On" : "Off"}</span>
                </div>
              </div>
            </section>

            <section style={panelStyle}>
              <div style={mobileSectionHeader}>
                <p style={mobileSectionEyebrow}>Exports</p>
                <h3 style={mobileSectionTitle}>Download Center</h3>
                <p style={mobileSectionCopy}>Export filtered reporting data without leaving the dashboard.</p>
              </div>
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
                <button style={csvBtn} onClick={handleDownloadFiltered}>Download</button>
              </div>
            </section>

            <section style={panelStyle}>
              <div style={mobileSectionHeader}>
                <p style={mobileSectionEyebrow}>Governance</p>
                <h3 style={mobileSectionTitle}>Results Control</h3>
                <p style={mobileSectionCopy}>Finalize, unfinalize, or archive results with an explicit signature.</p>
              </div>
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
              <div style={mobileSectionHeader}>
                <p style={mobileSectionEyebrow}>Access</p>
                <h3 style={mobileSectionTitle}>Admin Access</h3>
                <p style={mobileSectionCopy}>Manage additional admin entry IDs. Super admin remains fixed.</p>
              </div>
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
              <div style={mobileSectionHeader}>
                <p style={mobileSectionEyebrow}>Risk</p>
                <h3 style={mobileSectionTitle}>Suspicious Pattern Insights</h3>
              </div>
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
              <div style={mobileSectionHeader}>
                <p style={mobileSectionEyebrow}>Audit</p>
                <h3 style={mobileSectionTitle}>Admin Action Log</h3>
                <p style={mobileSectionCopy}>Review the latest privileged actions and governance changes.</p>
              </div>
              {auditLogs.length === 0 ? (
                <p style={mutedText}>No admin actions logged yet.</p>
              ) : (
                <div style={mobileFeed}>
                  {auditLogs.slice(0, auditVisibleCount).map((log) => (
                    <article key={log.id} style={mobileLogCard}>
                      <div style={mobileLogHeader}>
                        <div>
                          <p style={mobileLogTitle}>{log.action ?? "Unknown action"}</p>
                          <p style={mutedTextSmall}>{formatGameTime(log)}</p>
                        </div>
                        <span style={badge("#7cc4ff")}>{log.actor ?? "-"}</span>
                      </div>
                      <div style={mobileMetaItem}>
                        <span style={mobileMetaLabel}>Details</span>
                        <span style={mobileMetaValue}>{log.details ?? "-"}</span>
                      </div>
                    </article>
                  ))}
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
    <>
      <AdminLayout
        navItems={adminSectionConfig.map(({ key, label }) => ({ key, label }))}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        title={activeSectionMeta.title}
        subtitle={`Live data updates from Firestore • ${authBadge}`}
        statusItems={layoutStatusItems}
        onLogout={handleLogout}
      >
        {shouldShowIncidentShortcut && (
          <button
            type="button"
            style={incidentFab}
            onClick={() => setIncidentModeOpen(true)}
          >
            Incident Mode
          </button>
        )}
        {!isMobile && (
          <>
      {activeSection === "overview" && (
        <>
          <section style={desktopHero}>
            <div style={desktopHeroCopyWrap}>
              <p style={desktopHeroEyebrow}>Admin Dashboard</p>
              <h2 style={desktopHeroTitle}>Live event overview with cleaner desktop density</h2>
              <p style={desktopHeroText}>
                Track RSVP momentum, moderation risk, and guest activity from the same command surface used on mobile.
              </p>
            </div>
            <div style={desktopHeroMeta}>
              <div style={desktopHeroBadgeCard}>
                <span style={desktopHeroBadgeLabel}>Current Role</span>
                <strong style={desktopHeroBadgeValue}>{authBadge}</strong>
              </div>
              <div style={desktopHeroBadgeCard}>
                <span style={desktopHeroBadgeLabel}>Suspicious Devices</span>
                <strong style={desktopHeroBadgeValue}>{suspiciousDevices.length}</strong>
              </div>
              <div style={desktopHeroBadgeCard}>
                <span style={desktopHeroBadgeLabel}>Watchlist Events</span>
                <strong style={desktopHeroBadgeValue}>{suspiciousEvents.length}</strong>
              </div>
            </div>
          </section>

          <AdminStats stats={stats} />

          <section style={commandDeck}>
            <div style={commandDeckMain}>
              <div style={sectionIntro}>
                <p style={sectionEyebrow}>Action Center</p>
                <h3 style={sectionTitle}>High-priority admin moves, surfaced immediately</h3>
                <p style={sectionCopy}>
                  Instead of hunting through sections, use these launch cards to jump straight into the pressure points.
                </p>
              </div>
              <div style={commandCardGrid}>
                {overviewCommandCards.map((item) => (
                  <button key={item.id} style={commandCard} onClick={item.action}>
                    <span style={commandCardEyebrow}>{item.eyebrow}</span>
                    <strong style={commandCardTitle}>{item.title}</strong>
                    <span style={commandCardCopy}>{item.copy}</span>
                    <span style={commandCardValue}>{item.value}</span>
                  </button>
                ))}
              </div>
            </div>

            <aside style={alertRail}>
              <div style={sectionIntroCompact}>
                <p style={sectionEyebrow}>Warnings</p>
                <h3 style={sectionTitle}>Live watchlist</h3>
                <p style={sectionCopy}>Guests with active warnings stay pinned here for quick intervention.</p>
              </div>
              {activeWarnings.length === 0 ? (
                <p style={mutedText}>No active warnings right now.</p>
              ) : (
                <div style={alertRailList}>
                  {activeWarnings.slice(0, 4).map((warning) => (
                    <article key={warning.entryId} style={alertRailCard}>
                      <div style={mobileLogHeader}>
                        <div>
                          <p style={mobileLogTitle}>{warning.name || warning.entryId}</p>
                          <p style={mutedTextSmall}>Entry ID {warning.entryId}</p>
                        </div>
                        <span style={badge("#ff6b6b")}>Warnings: {warning.warningCount}</span>
                      </div>
                      <p style={alertRailCopy}>{warning.message}</p>
                      {renderGuestModerationControls(warning.entryId, warning.name)}
                    </article>
                  ))}
                </div>
              )}
            </aside>
          </section>

          <section style={missionControlSection}>
            <div style={panelStyle}>
              <div style={sectionIntro}>
                <p style={sectionEyebrow}>Mission Control</p>
                <h3 style={sectionTitle}>Signal board for risk, turnout, vote quality, and ops pressure</h3>
                <p style={sectionCopy}>
                  This is the strategy layer of the dashboard: not just raw counts, but what they imply about the event right now.
                </p>
              </div>
              <div style={missionMetricGrid}>
                {missionControlMetrics.map((metric) => (
                  <article key={metric.label} style={missionMetricCard}>
                    <div style={missionMetricHeader}>
                      <span style={missionMetricLabel}>{metric.label}</span>
                      <strong style={{ ...missionMetricValue, color: metric.tone }}>{metric.value}%</strong>
                    </div>
                    <div style={metricTrack}>
                      <div
                        style={{
                          ...metricFill(metric.value),
                          background: `linear-gradient(90deg, ${metric.tone}, rgba(255,255,255,0.18))`
                        }}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div style={overviewGridStyle}>
              <div style={panelStyle}>
                <h3 style={panelTitle}>Meal Mix</h3>
                <p style={mutedTextSmall}>Veg and non-veg distribution stay visible from overview now.</p>
                <ChartDonut data={mealMixData} emptyLabel="No meal selections yet." onSliceClick={() => null} />
              </div>
              <div style={panelStyle}>
                <h3 style={panelTitle}>Activity Trend</h3>
                <p style={mutedTextSmall}>Seven-day motion helps spot surges before moderation gets messy.</p>
                <ChartBars data={activityTrendData} emptyLabel="No activity yet." onBarClick={() => setActiveSection("activity")} />
              </div>
              <div style={panelStyle}>
                <h3 style={panelTitle}>Action Breakdown</h3>
                <p style={mutedTextSmall}>Which admin-side event types dominate the operational stream.</p>
                <ChartDonut data={actionBreakdownData} emptyLabel="No actions yet." onSliceClick={() => setActiveSection("activity")} />
              </div>
              <div style={panelStyle}>
                <h3 style={panelTitle}>Device Risk Ladder</h3>
                <p style={mutedTextSmall}>Ranked from account overlap, event load, block state, and warning linkage.</p>
                {deviceRiskRows.length === 0 ? (
                  <p style={mutedText}>No device pressure detected yet.</p>
                ) : (
                  <div style={riskList}>
                    {deviceRiskRows.map((device) => (
                      <article key={device.deviceId} style={riskItemCard}>
                        <div style={riskItemHeader}>
                          <div>
                            <strong style={riskItemTitle}>{shortDevice(device.deviceId)}</strong>
                            <p style={riskItemCopy}>
                              {device.accounts.length} accounts • {device.events} events • {device.warningHits} warning hits
                            </p>
                          </div>
                          <span style={badge(device.score >= 70 ? "#ff7b7b" : device.score >= 40 ? "#ffd57a" : "#7cc4ff")}>
                            Risk {device.score}
                          </span>
                        </div>
                        <div style={metricTrack}>
                          <div
                            style={{
                              ...metricFill(device.score),
                              background:
                                device.score >= 70
                                  ? "linear-gradient(90deg, #ff7b7b, rgba(255,123,123,0.18))"
                                  : device.score >= 40
                                    ? "linear-gradient(90deg, #ffd57a, rgba(255,213,122,0.18))"
                                    : "linear-gradient(90deg, #7cc4ff, rgba(124,196,255,0.18))"
                            }}
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

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
          <RSVPTable guests={filteredGuests} canManage={isAdmin} />
        </>
      )}

      {activeSection === "songs" && <SongsTable songs={songs} onDelete={handleDeleteSong} canManage={isAdmin} />}
      {activeSection === "suggestions" && <SuggestionsTable suggestions={suggestions} onDelete={handleDeleteSuggestion} canManage={isAdmin} />}
      {activeSection === "activity" && (
        <div style={{ display: "grid", gap: 16 }}>
          <section style={overviewGridStyle}>
            <div style={panelStyle}>
              <h3 style={panelTitle}>Activity Trend</h3>
              <p style={mutedTextSmall}>Seven-day event flow for operational pacing.</p>
              <ChartBars data={activityTrendData} emptyLabel="No activity yet." onBarClick={() => null} />
            </div>
            <div style={panelStyle}>
              <h3 style={panelTitle}>Action Breakdown</h3>
              <p style={mutedTextSmall}>Most common activity types across the current log stream.</p>
              <ChartDonut data={actionBreakdownData} emptyLabel="No actions yet." onSliceClick={() => null} />
            </div>
            <div style={panelStyle}>
              <h3 style={panelTitle}>Ops Snapshot</h3>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={statRow}>
                  <span style={mutedText}>Last 24 Hours</span>
                  <strong>{recentActivityCount}</strong>
                </div>
                <div style={statRow}>
                  <span style={mutedText}>Flagged Devices</span>
                  <strong>{suspiciousDevices.length}</strong>
                </div>
                <div style={statRow}>
                  <span style={mutedText}>Active Warnings</span>
                  <strong>{activeWarnings.length}</strong>
                </div>
              </div>
            </div>
          </section>

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
        </div>
      )}

      {activeSection === "device_watch" && (
        <div style={{ display: "grid", gap: 16 }}>
          <section style={overviewGridStyle}>
            <div style={panelStyle}>
              <h3 style={panelTitle}>Device Risk Ladder</h3>
              <p style={mutedTextSmall}>Higher scores combine account overlap, event volume, warning pressure, and block state.</p>
              {deviceRiskRows.length === 0 ? (
                <p style={mutedText}>No device pressure detected yet.</p>
              ) : (
                <div style={riskList}>
                  {deviceRiskRows.map((device) => (
                    <article key={device.deviceId} style={riskItemCard}>
                      <div style={riskItemHeader}>
                        <div>
                          <strong style={riskItemTitle}>{shortDevice(device.deviceId)}</strong>
                          <p style={riskItemCopy}>
                            {device.accounts.length} accounts • {device.events} events • {device.warningHits} warning hits
                          </p>
                        </div>
                        <span style={badge(device.score >= 70 ? "#ff7b7b" : device.score >= 40 ? "#ffd57a" : "#7cc4ff")}>
                          Risk {device.score}
                        </span>
                      </div>
                      <div style={metricTrack}>
                        <div
                          style={{
                            ...metricFill(device.score),
                            background:
                              device.score >= 70
                                ? "linear-gradient(90deg, #ff7b7b, rgba(255,123,123,0.18))"
                                : device.score >= 40
                                  ? "linear-gradient(90deg, #ffd57a, rgba(255,213,122,0.18))"
                                  : "linear-gradient(90deg, #7cc4ff, rgba(124,196,255,0.18))"
                          }}
                        />
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
            <div style={panelStyle}>
              <h3 style={panelTitle}>Account Overlap Pulse</h3>
              <p style={mutedTextSmall}>Devices with the largest account spread get surfaced immediately.</p>
              <ChartBars
                data={deviceRiskRows.map((device) => ({ name: shortDevice(device.deviceId), value: device.accounts.length }))}
                emptyLabel="No overlap yet."
                onBarClick={() => null}
              />
            </div>
          </section>

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
        </div>
      )}

      {activeSection === "games" && (
        <div style={{ display: "grid", gap: 16 }}>
          <section style={desktopGamesHero}>
            <div>
              <p style={mobileSectionEyebrow}>Games Intelligence</p>
              <h3 style={{ ...panelTitle, marginBottom: 6 }}>Games Analytics</h3>
              <p style={mutedText}>Visual stats, advanced filters, and drill-down voter details.</p>
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

      {incidentModeOpen && (
        <div style={incidentOverlay} onClick={() => setIncidentModeOpen(false)}>
          <div style={incidentPanel} onClick={(event) => event.stopPropagation()}>
            <div style={incidentHeader}>
              <div>
                <p style={incidentEyebrow}>Incident Mode</p>
                <h2 style={incidentTitle}>Fast moderation cockpit</h2>
                <p style={incidentCopy}>
                  Concentrated view of warnings, suspicious devices, vote anomalies, and the latest risky events.
                </p>
              </div>
              <button style={closeBtn} onClick={() => setIncidentModeOpen(false)}>Close</button>
            </div>

            <section style={incidentMetricGrid}>
              {incidentCards.map((card) => (
                <article key={card.id} style={incidentMetricCard}>
                  <span style={incidentMetricLabel}>{card.label}</span>
                  <strong style={{ ...incidentMetricValue, color: card.tone }}>{card.value}</strong>
                </article>
              ))}
            </section>

            <section style={incidentGrid}>
              <div style={incidentSection}>
                <h3 style={panelTitle}>Active Warnings</h3>
                {activeWarnings.length === 0 ? (
                  <p style={mutedText}>No active warnings.</p>
                ) : (
                  <div style={incidentList}>
                    {activeWarnings.slice(0, 6).map((warning) => (
                      <article key={warning.entryId} style={incidentCard}>
                        <div style={riskItemHeader}>
                          <div>
                            <strong style={riskItemTitle}>{warning.name || warning.entryId}</strong>
                            <p style={riskItemCopy}>Entry ID {warning.entryId} • warnings {warning.warningCount}</p>
                          </div>
                          <span style={badge("#ff7b7b")}>Critical</span>
                        </div>
                        <p style={alertRailCopy}>{warning.message}</p>
                        {renderGuestModerationControls(warning.entryId, warning.name)}
                      </article>
                    ))}
                  </div>
                )}
              </div>

              <div style={incidentSection}>
                <h3 style={panelTitle}>Device Threat Board</h3>
                {deviceRiskRows.length === 0 ? (
                  <p style={mutedText}>No device threats detected.</p>
                ) : (
                  <div style={incidentList}>
                    {deviceRiskRows.map((device) => (
                      <article key={device.deviceId} style={incidentCard}>
                        <div style={riskItemHeader}>
                          <div>
                            <strong style={riskItemTitle}>{shortDevice(device.deviceId)}</strong>
                            <p style={riskItemCopy}>{device.accounts.length} accounts • {device.events} events • {device.warningHits} warning hits</p>
                          </div>
                          <span style={badge(device.score >= 70 ? "#ff7b7b" : "#ffd57a")}>Risk {device.score}</span>
                        </div>
                        <div style={metricTrack}>
                          <div
                            style={{
                              ...metricFill(device.score),
                              background:
                                device.score >= 70
                                  ? "linear-gradient(90deg, #ff7b7b, rgba(255,123,123,0.18))"
                                  : "linear-gradient(90deg, #ffd57a, rgba(255,213,122,0.18))"
                            }}
                          />
                        </div>
                        <div style={controlsStyle}>
                          <button
                            style={blockBtn(blockedDeviceIds.has(device.deviceId))}
                            onClick={() => handleToggleDeviceBlock(device.deviceId)}
                            disabled={!isAdmin}
                          >
                            {blockedDeviceIds.has(device.deviceId) ? "Unblock Device" : "Block Device"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              <div style={incidentSection}>
                <h3 style={panelTitle}>Vote Integrity Flags</h3>
                {suspiciousVoteInsights.length === 0 ? (
                  <p style={mutedText}>No vote anomalies under current filters.</p>
                ) : (
                  <div style={incidentList}>
                    {suspiciousVoteInsights.map((item) => (
                      <article key={item.id} style={incidentCard}>
                        <div style={riskItemHeader}>
                          <strong style={riskItemTitle}>{item.title}</strong>
                          <button style={smallBtn} onClick={() => setActiveSection("games")}>
                            Open Votes
                          </button>
                        </div>
                        <p style={alertRailCopy}>{item.detail}</p>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              <div style={incidentSection}>
                <h3 style={panelTitle}>Suspicious Events</h3>
                {suspiciousEvents.length === 0 ? (
                  <p style={mutedText}>No suspicious recent events.</p>
                ) : (
                  <div style={incidentList}>
                    {suspiciousEvents.slice(0, 6).map((log) => (
                      <article key={log.id} style={incidentCard}>
                        <div style={riskItemHeader}>
                          <div>
                            <strong style={riskItemTitle}>{log.type ?? "Unknown action"}</strong>
                            <p style={riskItemCopy}>{formatLogTime(log)}</p>
                          </div>
                          <span style={badge("#ffb05c")}>{shortDevice(log.deviceId ?? "unknown-device")}</span>
                        </div>
                        <p style={alertRailCopy}>
                          {(log.name ?? "-")} • {(log.entryId ?? "-")} • {(log.details ?? "No details")}
                        </p>
                        {log.entryId ? renderGuestModerationControls(log.entryId, log.name) : null}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </>
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

const desktopHero: CSSProperties = {
  border: "1px solid rgba(255,213,122,0.18)",
  borderRadius: 20,
  padding: "20px 22px",
  marginBottom: 18,
  background:
    "linear-gradient(140deg, rgba(255,213,122,0.15) 0%, rgba(255,140,66,0.08) 28%, rgba(255,255,255,0.03) 68%, rgba(10,12,16,0.9) 100%)",
  boxShadow: "0 18px 42px rgba(0,0,0,0.22)",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 0.9fr)",
  gap: 18,
  alignItems: "stretch"
};

const desktopHeroCopyWrap: CSSProperties = {
  display: "grid",
  gap: 8,
  alignContent: "start"
};

const desktopHeroEyebrow: CSSProperties = {
  margin: 0,
  fontSize: 11,
  letterSpacing: 1.4,
  textTransform: "uppercase",
  color: "#f5c768",
  fontWeight: 800
};

const desktopHeroTitle: CSSProperties = {
  margin: 0,
  fontSize: 30,
  lineHeight: 1.08,
  color: "#fff7df"
};

const desktopHeroText: CSSProperties = {
  margin: 0,
  color: "#c9d0d8",
  fontSize: 14,
  lineHeight: 1.6,
  maxWidth: 620
};

const desktopHeroMeta: CSSProperties = {
  display: "grid",
  gap: 10,
  alignContent: "stretch"
};

const desktopHeroBadgeCard: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 16,
  background: "rgba(10,12,16,0.36)",
  padding: "14px 16px",
  display: "grid",
  gap: 6
};

const desktopHeroBadgeLabel: CSSProperties = {
  color: "#9ba4ae",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 0.9
};

const desktopHeroBadgeValue: CSSProperties = {
  color: "#fff",
  fontSize: 24,
  lineHeight: 1.1
};

const desktopGamesHero: CSSProperties = {
  ...panel,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 14,
  borderRadius: 18,
  padding: 18,
  background:
    "linear-gradient(140deg, rgba(255,213,122,0.12) 0%, rgba(255,140,66,0.06) 25%, rgba(255,255,255,0.03) 75%)"
};

const commandDeck: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.4fr) minmax(300px, 0.8fr)",
  gap: 16,
  marginBottom: 18
};

const commandDeckMain: CSSProperties = {
  ...panel,
  borderRadius: 18,
  padding: 18,
  display: "grid",
  gap: 16
};

const alertRail: CSSProperties = {
  ...panel,
  borderRadius: 18,
  padding: 18,
  display: "grid",
  gap: 14,
  alignContent: "start"
};

const sectionIntro: CSSProperties = {
  display: "grid",
  gap: 6
};

const sectionIntroCompact: CSSProperties = {
  display: "grid",
  gap: 5
};

const sectionEyebrow: CSSProperties = {
  margin: 0,
  color: "#f5c768",
  fontSize: 10,
  letterSpacing: 1.1,
  textTransform: "uppercase",
  fontWeight: 800
};

const sectionTitle: CSSProperties = {
  margin: 0,
  color: "#fff7df",
  fontSize: 21,
  lineHeight: 1.15
};

const sectionCopy: CSSProperties = {
  margin: 0,
  color: "#aeb7c1",
  fontSize: 13,
  lineHeight: 1.5
};

const commandCardGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
  gap: 12
};

const commandCard: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 18,
  padding: "14px 15px",
  background:
    "linear-gradient(150deg, rgba(255,255,255,0.06) 0%, rgba(255,213,122,0.04) 25%, rgba(8,11,14,0.92) 100%)",
  display: "grid",
  gap: 8,
  textAlign: "left",
  color: "#fff",
  cursor: "pointer",
  boxShadow: "0 18px 32px rgba(0,0,0,0.16)"
};

const commandCardEyebrow: CSSProperties = {
  color: "#f5c768",
  fontSize: 10,
  letterSpacing: 1,
  textTransform: "uppercase",
  fontWeight: 800
};

const commandCardTitle: CSSProperties = {
  fontSize: 17,
  lineHeight: 1.2
};

const commandCardCopy: CSSProperties = {
  color: "#b5bec8",
  fontSize: 12,
  lineHeight: 1.5
};

const commandCardValue: CSSProperties = {
  color: "#fff2cf",
  fontSize: 12,
  fontWeight: 800
};

const alertRailList: CSSProperties = {
  display: "grid",
  gap: 10
};

const alertRailCard: CSSProperties = {
  border: "1px solid rgba(255,107,107,0.18)",
  borderRadius: 16,
  background: "rgba(255,255,255,0.03)",
  padding: 12,
  display: "grid",
  gap: 10
};

const alertRailCopy: CSSProperties = {
  margin: 0,
  color: "#d5dbe2",
  fontSize: 12,
  lineHeight: 1.55
};

const missionControlSection: CSSProperties = {
  display: "grid",
  gap: 16,
  marginBottom: 18
};

const missionMetricGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 10
};

const missionMetricCard: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 16,
  background: "rgba(255,255,255,0.03)",
  padding: "12px 13px",
  display: "grid",
  gap: 10
};

const missionMetricHeader: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 8
};

const missionMetricLabel: CSSProperties = {
  color: "#a8b1bb",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 0.8,
  fontWeight: 700
};

const missionMetricValue: CSSProperties = {
  color: "#fff",
  fontSize: 22,
  lineHeight: 1,
  fontWeight: 900
};

const metricTrack: CSSProperties = {
  width: "100%",
  height: 8,
  borderRadius: 999,
  background: "rgba(255,255,255,0.08)",
  overflow: "hidden"
};

const metricFill = (value: number): CSSProperties => ({
  width: `${Math.max(6, Math.min(value, 100))}%`,
  height: "100%",
  borderRadius: 999
});

const riskList: CSSProperties = {
  display: "grid",
  gap: 10
};

const riskItemCard: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 15,
  padding: "11px 12px",
  background: "rgba(255,255,255,0.025)",
  display: "grid",
  gap: 9
};

const riskItemHeader: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  alignItems: "flex-start"
};

const riskItemTitle: CSSProperties = {
  color: "#fff",
  fontSize: 14,
  lineHeight: 1.2
};

const riskItemCopy: CSSProperties = {
  margin: "3px 0 0",
  color: "#aeb7c1",
  fontSize: 12,
  lineHeight: 1.45
};

const incidentFab: CSSProperties = {
  position: "fixed",
  right: 18,
  bottom: 18,
  zIndex: 35,
  border: "1px solid rgba(255,123,123,0.28)",
  borderRadius: 999,
  padding: "12px 16px",
  background: "linear-gradient(135deg, rgba(255,123,123,0.94), rgba(255,92,92,0.82))",
  color: "#fff",
  fontWeight: 900,
  letterSpacing: 0.3,
  boxShadow: "0 18px 34px rgba(255,92,92,0.24)",
  cursor: "pointer"
};

const incidentOverlay: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 60,
  padding: 16,
  background: "rgba(4,6,9,0.82)",
  backdropFilter: "blur(10px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const incidentPanel: CSSProperties = {
  width: "min(1380px, 100%)",
  maxHeight: "92vh",
  overflow: "auto",
  borderRadius: 24,
  border: "1px solid rgba(255,255,255,0.1)",
  background:
    "linear-gradient(180deg, rgba(27,13,15,0.96) 0%, rgba(14,16,24,0.98) 28%, rgba(8,10,14,0.98) 100%)",
  boxShadow: "0 36px 80px rgba(0,0,0,0.36)",
  padding: 18,
  display: "grid",
  gap: 16
};

const incidentHeader: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  flexWrap: "wrap"
};

const incidentEyebrow: CSSProperties = {
  margin: 0,
  color: "#ff9b9b",
  fontSize: 10,
  letterSpacing: 1.2,
  textTransform: "uppercase",
  fontWeight: 800
};

const incidentTitle: CSSProperties = {
  margin: "6px 0 6px",
  color: "#fff3f3",
  fontSize: 30,
  lineHeight: 1.08
};

const incidentCopy: CSSProperties = {
  margin: 0,
  color: "#d1d8df",
  fontSize: 13,
  lineHeight: 1.55,
  maxWidth: 680
};

const incidentMetricGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 10
};

const incidentMetricCard: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  background: "rgba(255,255,255,0.03)",
  padding: "13px 14px",
  display: "grid",
  gap: 6
};

const incidentMetricLabel: CSSProperties = {
  color: "#9ea8b2",
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: 0.9
};

const incidentMetricValue: CSSProperties = {
  color: "#fff",
  fontSize: 26,
  lineHeight: 1.05,
  fontWeight: 900
};

const incidentGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))",
  gap: 14
};

const incidentSection: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 18,
  background: "rgba(255,255,255,0.025)",
  padding: 14,
  display: "grid",
  gap: 12,
  alignContent: "start"
};

const incidentList: CSSProperties = {
  display: "grid",
  gap: 10
};

const incidentCard: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  background: "rgba(0,0,0,0.18)",
  padding: 12,
  display: "grid",
  gap: 10
};

const mobilePage: CSSProperties = {
  display: "grid",
  gap: 14
};

const mobileHero: CSSProperties = {
  border: "1px solid rgba(255,213,122,0.22)",
  borderRadius: 18,
  padding: 14,
  background:
    "linear-gradient(145deg, rgba(255,213,122,0.16) 0%, rgba(255,140,66,0.08) 35%, rgba(255,255,255,0.03) 100%)",
  boxShadow: "0 14px 40px rgba(0,0,0,0.22)"
};

const mobileHeroEyebrow: CSSProperties = {
  margin: 0,
  fontSize: 11,
  letterSpacing: 1.2,
  textTransform: "uppercase",
  color: "#f5c768"
};

const mobileHeroTitle: CSSProperties = {
  margin: "6px 0 4px",
  fontSize: 24,
  lineHeight: 1.1,
  color: "#fff7df"
};

const mobileHeroCopy: CSSProperties = {
  margin: 0,
  color: "#d4d8de",
  fontSize: 13,
  lineHeight: 1.45
};

const mobileKpiGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
  marginTop: 14
};

const mobileKpiCard: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 14,
  padding: "10px 11px",
  background: "rgba(10,12,16,0.34)"
};

const mobileKpiLabel: CSSProperties = {
  display: "block",
  color: "#aeb5be",
  fontSize: 11,
  marginBottom: 6
};

const mobileKpiValue: CSSProperties = {
  color: "#fff",
  fontSize: 18,
  fontWeight: 800
};

const mobileSectionHeader: CSSProperties = {
  display: "grid",
  gap: 3,
  marginBottom: 10
};

const mobileSectionEyebrow: CSSProperties = {
  margin: 0,
  color: "#f0be5c",
  fontSize: 10,
  letterSpacing: 1,
  textTransform: "uppercase"
};

const mobileSectionTitle: CSSProperties = {
  margin: 0,
  color: "#fff",
  fontSize: 17,
  lineHeight: 1.2
};

const mobileSectionCopy: CSSProperties = {
  margin: 0,
  color: "#aeb5be",
  fontSize: 12,
  lineHeight: 1.45
};

const mobileTableNote: CSSProperties = {
  margin: "0 0 10px",
  color: "#97a0aa",
  fontSize: 11
};

const mobileCardGrid: CSSProperties = {
  display: "grid",
  gap: 10
};

const mobileMiniCard: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 14,
  background: "rgba(255,255,255,0.025)",
  padding: 12
};

const mobileFeed: CSSProperties = {
  display: "grid",
  gap: 10
};

const mobileLogCard: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 14,
  background: "rgba(255,255,255,0.03)",
  padding: 12,
  display: "grid",
  gap: 10
};

const mobileLogHeader: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 10
};

const mobileLogTitle: CSSProperties = {
  margin: 0,
  color: "#fff2cf",
  fontSize: 14,
  fontWeight: 700
};

const mobileMetaGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 8
};

const mobileMetaItem: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  padding: "8px 9px",
  background: "rgba(0,0,0,0.18)"
};

const mobileMetaLabel: CSSProperties = {
  display: "block",
  color: "#97a0aa",
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: 0.8,
  marginBottom: 4
};

const mobileMetaValue: CSSProperties = {
  color: "#eef2f7",
  fontSize: 12,
  lineHeight: 1.35,
  wordBreak: "break-word"
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

const loginShell: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
  background:
    "radial-gradient(circle at top left, rgba(255,213,122,0.12) 0%, rgba(255,213,122,0) 28%), radial-gradient(circle at bottom right, rgba(124,196,255,0.1) 0%, rgba(124,196,255,0) 30%), linear-gradient(180deg, #090b0f 0%, #0c1016 35%, #090a0e 100%)",
  position: "relative",
  overflow: "hidden"
};

const loginGlowTop: CSSProperties = {
  position: "absolute",
  top: -100,
  left: -60,
  width: 280,
  height: 280,
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(255,213,122,0.18) 0%, rgba(255,213,122,0) 72%)",
  filter: "blur(10px)",
  pointerEvents: "none"
};

const loginGlowBottom: CSSProperties = {
  position: "absolute",
  right: -80,
  bottom: -120,
  width: 320,
  height: 320,
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(124,196,255,0.14) 0%, rgba(124,196,255,0) 72%)",
  filter: "blur(12px)",
  pointerEvents: "none"
};

const loginCard: CSSProperties = {
  width: "min(420px, 100%)",
  borderRadius: 24,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(10,12,16,0.9)",
  boxShadow: "0 32px 64px rgba(0,0,0,0.34)",
  padding: 28,
  color: "#fff",
  display: "grid",
  gap: 14,
  position: "relative",
  zIndex: 1
};

const loginHeader: CSSProperties = {
  display: "grid",
  gap: 6
};

const loginEyebrow: CSSProperties = {
  margin: 0,
  color: "#f5c768",
  fontSize: 11,
  letterSpacing: 1.2,
  textTransform: "uppercase",
  fontWeight: 800
};

const loginTitle: CSSProperties = {
  margin: 0,
  color: "#fff7df",
  fontSize: 28,
  lineHeight: 1.08
};

const loginCopy: CSSProperties = {
  margin: 0,
  color: "#aeb7c1",
  fontSize: 13,
  lineHeight: 1.55
};

const loginInput: CSSProperties = {
  width: "100%",
  padding: "12px 13px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  outline: "none"
};

const loginButton: CSSProperties = {
  width: "100%",
  padding: "12px 13px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #ffd57a 0%, #f5b000 100%)",
  color: "#111",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 18px 32px rgba(245,176,0,0.24)"
};

const loginMetaRow: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
  marginTop: 2
};

const loginMetaCard: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  background: "rgba(255,255,255,0.03)",
  padding: "11px 12px",
  display: "grid",
  gap: 5
};

const loginMetaLabel: CSSProperties = {
  color: "#97a0aa",
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: 0.8
};

const loginMetaValue: CSSProperties = {
  color: "#eef2f7",
  fontSize: 13,
  lineHeight: 1.35
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
