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
import {
  blockDevice,
  blockEntry,
  subscribeBlockedDevices,
  subscribeBlockedEntries,
  unblockDevice,
  unblockEntry
} from "@/services/blockService";
import { toast } from "sonner";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";
import { guests } from "@/contexts/AuthContext";

interface RSVP {
  id?: string;
  name?: string;
  entryId?: string;
  attendance?: "yes" | "no";
  mealPreference?: "veg" | "nonveg";
}

const ADMIN_PASSWORD = "randiokimehfil";
type Section =
  | "overview"
  | "rsvps"
  | "songs"
  | "suggestions"
  | "activity"
  | "device_watch"
  | "games";

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

const nominationCategoryLabels: Record<string, string> = {
  most_popular_male: "Most Popular Male",
  most_popular_female: "Most Popular Female",
  best_male_duo: "Best Male Duo",
  best_female_duo: "Best Female Duo",
  best_dancer: "Best Dancer"
};

export default function AdminDashboard(): JSX.Element {

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
  } = useGamesAdminData();

  /* ---------------- STATE ---------------- */

  const [search, setSearch] = useState<string>("");

  const [authenticated, setAuthenticated] = useState<boolean>(
    localStorage.getItem("admin-auth") === "true"
  );

  const [password, setPassword] = useState<string>("");
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [blockedDeviceIds, setBlockedDeviceIds] = useState<Set<string>>(new Set());
  const [blockedEntryIds, setBlockedEntryIds] = useState<Set<string>>(new Set());
  const entryNameMap = useMemo(() => {
    const pairs = Object.entries(guests).map(([name, entryId]) => [entryId, name]);
    return Object.fromEntries(pairs) as Record<string, string>;
  }, []);

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
    const deviceMap = new Map<string, { entryIds: Set<string>; names: Set<string>; events: number }>();

    activityLogs.forEach((log: ActivityLog) => {
      const deviceId = log.deviceId ?? "unknown-device";
      const found = deviceMap.get(deviceId) ?? {
        entryIds: new Set<string>(),
        names: new Set<string>(),
        events: 0
      };

      if (log.entryId && entryNameMap[log.entryId]) {
        found.entryIds.add(log.entryId);
        found.names.add(entryNameMap[log.entryId]);
      }
      found.events += 1;
      deviceMap.set(deviceId, found);
    });

    return Array.from(deviceMap.entries())
      .map(([deviceId, data]) => ({
        deviceId,
        accounts: Array.from(data.entryIds),
        names: Array.from(data.names),
        events: data.events
      }))
      .filter((d) => d.accounts.length > 1)
      .sort((a, b) => b.accounts.length - a.accounts.length || b.events - a.events);
  }, [activityLogs, entryNameMap]);

  const allDevices = useMemo(() => {
    const deviceMap = new Map<string, { entryIds: Set<string>; names: Set<string>; events: number }>();

    activityLogs.forEach((log: ActivityLog) => {
      const deviceId = log.deviceId ?? "unknown-device";
      const found = deviceMap.get(deviceId) ?? {
        entryIds: new Set<string>(),
        names: new Set<string>(),
        events: 0
      };

      if (log.entryId && entryNameMap[log.entryId]) {
        found.entryIds.add(log.entryId);
        found.names.add(entryNameMap[log.entryId]);
      }
      found.events += 1;
      deviceMap.set(deviceId, found);
    });

    return Array.from(deviceMap.entries())
      .map(([deviceId, data]) => ({
        deviceId,
        accounts: Array.from(data.entryIds),
        names: Array.from(data.names),
        events: data.events
      }))
      .sort((a, b) => b.events - a.events);
  }, [activityLogs, entryNameMap]);

  const suspiciousEvents = useMemo(() => {
    const suspiciousSet = new Set(suspiciousDevices.map((d) => d.deviceId));
    return activityLogs
      .filter((log: ActivityLog) => suspiciousSet.has(log.deviceId ?? "unknown-device"))
      .slice(0, 12);
  }, [activityLogs, suspiciousDevices]);

  const nominationGroups = useMemo(() => {
    const base: Record<string, string[]> = {
      most_popular_male: [],
      most_popular_female: [],
      best_male_duo: [],
      best_female_duo: [],
      best_dancer: []
    };

    selfNominations.forEach((record: any) => {
      const name = record?.name ?? "Unknown";
      const selected = Array.isArray(record?.selectedCategories)
        ? record.selectedCategories
        : [];

      selected.forEach((category: string) => {
        if (base[category]) {
          base[category].push(name);
        }
      });
    });

    return base;
  }, [selfNominations]);

  useEffect(() => {
    const unsubEntries = subscribeBlockedEntries(setBlockedEntryIds);
    const unsubDevices = subscribeBlockedDevices(setBlockedDeviceIds);

    return () => {
      unsubEntries();
      unsubDevices();
    };
  }, []);

  const handleToggleDeviceBlock = async (deviceId: string) => {
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
      toast.error("Failed to update device block status");
    }
  };

  const handleToggleEntryBlock = async (entryId: string, name?: string) => {
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
      toast.error("Failed to update account block status");
    }
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

  /* ---------------- AUTH ---------------- */

  const handleLogout = () => {
    localStorage.removeItem("admin-auth");
    setAuthenticated(false);
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
              if (password === ADMIN_PASSWORD) {
                localStorage.setItem("admin-auth", "true");
                setAuthenticated(true);
              } else {
                alert("Incorrect password");
              }
            }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- DASHBOARD ---------------- */

  return (
    <AdminLayout
      navItems={[
        { key: "overview", label: "Overview" },
        { key: "rsvps", label: "RSVP Manager" },
        { key: "songs", label: "Song Requests" },
        { key: "suggestions", label: "Suggestions" },
        { key: "activity", label: "Activity Monitor" },
        { key: "device_watch", label: "Device Watch" },
        { key: "games", label: "Games Votes" }
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
                    : "Games Votes"
      }
      subtitle="Live data updates from Firestore"
      onLogout={handleLogout}
    >
      {activeSection === "overview" && (
        <>
          <AdminStats stats={stats} />

          <div style={overviewGrid}>
            <section style={panel}>
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

            <section style={panel}>
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

            <section style={panel}>
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

            <section style={panel}>
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

          <section style={{ ...panel, marginTop: 16 }}>
            <h3 style={panelTitle}>Recent Suspicious Activity</h3>
            {suspiciousEvents.length === 0 ? (
              <p style={mutedText}>No suspicious recent events.</p>
            ) : (
              <div style={activityTableWrap}>
                <table style={activityTable}>
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
                      <div style={controls}>
                        {log.entryId && (
                          <button
                            style={blockBtn(blockedEntryIds.has(log.entryId))}
                            onClick={() => handleToggleEntryBlock(log.entryId as string, log.name)}
                          >
                            {blockedEntryIds.has(log.entryId) ? "Unblock Account" : "Block Account"}
                          </button>
                        )}
                      </div>
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
              style={searchInput}
            />
          </div>
          <RSVPTable guests={filteredGuests} />
        </>
      )}

      {activeSection === "songs" && <SongsTable songs={songs} onDelete={handleDeleteSong} />}
      {activeSection === "suggestions" && <SuggestionsTable suggestions={suggestions} onDelete={handleDeleteSuggestion} />}
      {activeSection === "activity" && (
        <div style={panel}>
          <h3 style={panelTitle}>Recent Activity Logs</h3>

          <div style={activityTableWrap}>
            <table style={activityTable}>
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

                {activityLogs.slice(0, 120).map((log: ActivityLog) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <td style={td}>{formatLogTime(log)}</td>
                    <td style={td}>{log.type ?? "-"}</td>
                    <td style={td}>{log.name ?? "-"}</td>
                    <td style={td}>{log.entryId ?? "-"}</td>
                    <td style={td}>{shortDevice(log.deviceId ?? "unknown-device")}</td>
                    <td style={td}>{log.details || "-"}</td>
                    <td style={td}>
                      <div style={controls}>
                        {log.entryId && (
                          <button
                            style={blockBtn(blockedEntryIds.has(log.entryId))}
                            onClick={() => handleToggleEntryBlock(log.entryId as string, log.name)}
                          >
                            {blockedEntryIds.has(log.entryId) ? "Unblock Account" : "Block Account"}
                          </button>
                        )}
                        {log.deviceId && (
                          <button
                            style={blockBtn(blockedDeviceIds.has(log.deviceId))}
                            onClick={() => handleToggleDeviceBlock(log.deviceId as string)}
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
        </div>
      )}

      {activeSection === "device_watch" && (
        <div style={panel}>
          <h3 style={panelTitle}>All Devices (Manual Block Controls)</h3>

          {allDevices.length === 0 ? (
            <p style={mutedText}>No device logs found yet.</p>
          ) : (
            <div style={activityTableWrap}>
              <table style={activityTable}>
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
                        <div style={chipWrap}>
                          {device.accounts.map((entryId) => (
                            <button
                              key={entryId}
                              style={blockBtn(blockedEntryIds.has(entryId))}
                              onClick={() =>
                                handleToggleEntryBlock(
                                  entryId,
                                  device.names.find((n) => n)
                                )
                              }
                            >
                              {blockedEntryIds.has(entryId) ? `Unblock ${entryId}` : `Block ${entryId}`}
                            </button>
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
          <section style={panel}>
            <h3 style={panelTitle}>Self Nominations</h3>
            <p style={mutedText}>Grouped by category</p>

            <div style={overviewGrid}>
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

            <div style={{ marginTop: 14 }}>
              <h4 style={miniPanelTitle}>Recent Self Nomination Entries</h4>
              <div style={activityTableWrap}>
                <table style={activityTable}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                      <th style={th}>Time</th>
                      <th style={th}>Submitter</th>
                      <th style={th}>Entry ID</th>
                      <th style={th}>Gender</th>
                      <th style={th}>Categories</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selfNominations.length === 0 && (
                      <tr>
                        <td style={emptyTd} colSpan={5}>No nomination entries yet.</td>
                      </tr>
                    )}
                    {selfNominations.map((item: any) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        <td style={td}>{formatGameTime(item)}</td>
                        <td style={td}>{item.name ?? "-"}</td>
                        <td style={td}>{item.entryId ?? "-"}</td>
                        <td style={td}>{item.gender ?? "-"}</td>
                        <td style={td}>
                          {Array.isArray(item.selectedCategories) && item.selectedCategories.length > 0
                            ? item.selectedCategories
                              .map((value: string) => nominationCategoryLabels[value] ?? value)
                              .join(", ")
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section style={panel}>
            <h3 style={panelTitle}>CYS Votes</h3>
            <div style={activityTableWrap}>
              <table style={activityTable}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                    <th style={th}>Time</th>
                    <th style={th}>Submitter</th>
                    <th style={th}>Entry ID</th>
                    <th style={th}>Selected Pair</th>
                  </tr>
                </thead>
                <tbody>
                  {cysVotes.length === 0 && (
                    <tr>
                      <td style={emptyTd} colSpan={4}>No CYS votes yet.</td>
                    </tr>
                  )}
                  {cysVotes.map((item: any) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      <td style={td}>{formatGameTime(item)}</td>
                      <td style={td}>{item.name ?? "-"}</td>
                      <td style={td}>{item.entryId ?? "-"}</td>
                      <td style={td}>{`${item.maleName ?? "-"} + ${item.femaleName ?? "-"}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section style={overviewGrid}>
            <div style={panel}>
              <h3 style={panelTitle}>MPM Votes</h3>
              <VoteTable
                rows={mpmVotes}
                emptyLabel="No MPM votes yet."
              />
            </div>

            <div style={panel}>
              <h3 style={panelTitle}>MPF Votes</h3>
              <VoteTable
                rows={mpfVotes}
                emptyLabel="No MPF votes yet."
              />
            </div>
          </section>

          <section style={overviewGrid}>
            <div style={panel}>
              <h3 style={panelTitle}>BMD Votes</h3>
              <DuoVoteTable
                rows={bmdVotes}
                leftLabel="Male 1"
                rightLabel="Male 2"
                emptyLabel="No BMD votes yet."
              />
            </div>

            <div style={panel}>
              <h3 style={panelTitle}>BFD Votes</h3>
              <DuoVoteTable
                rows={bfdVotes}
                leftLabel="Female 1"
                rightLabel="Female 2"
                emptyLabel="No BFD votes yet."
              />
            </div>
          </section>

          <section style={panel}>
            <h3 style={panelTitle}>SWDBITP Votes</h3>
            <VoteTable
              rows={swdbitpVotes}
              emptyLabel="No SWDBITP votes yet."
            />
          </section>
        </div>
      )}
    </AdminLayout>
  );
}

function VoteTable({
  rows,
  emptyLabel
}: {
  rows: any[];
  emptyLabel: string;
}) {
  return (
    <div style={activityTableWrap}>
      <table style={activityTable}>
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
          {rows.map((item) => (
            <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <td style={td}>{formatGameTime(item)}</td>
              <td style={td}>{item.name ?? "-"}</td>
              <td style={td}>{item.entryId ?? "-"}</td>
              <td style={td}>{item.nomineeName ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DuoVoteTable({
  rows,
  leftLabel,
  rightLabel,
  emptyLabel
}: {
  rows: any[];
  leftLabel: string;
  rightLabel: string;
  emptyLabel: string;
}) {
  return (
    <div style={activityTableWrap}>
      <table style={activityTable}>
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
          {rows.map((item) => (
            <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <td style={td}>{formatGameTime(item)}</td>
              <td style={td}>{item.name ?? "-"}</td>
              <td style={td}>{item.entryId ?? "-"}</td>
              <td style={td}>{item.male1Name ?? item.female1Name ?? "-"}</td>
              <td style={td}>{item.male2Name ?? item.female2Name ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
  overflowX: "auto"
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
