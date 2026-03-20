import { useMemo, type CSSProperties } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useIsMobile } from "@/hooks/useDeviceType";

type RSVPGuest = {
  id: string;
  name?: string;
  mealPreference?: string;
  attendance?: string;
  entryId?: string;
};

export default function RSVPTable({
  guests,
  canManage = false
}: {
  guests: RSVPGuest[];
  canManage?: boolean;
}) {
  const isMobile = useIsMobile();

  const summary = useMemo(
    () => ({
      total: guests.length,
      attending: guests.filter((guest) => guest.attendance === "yes").length,
      notAttending: guests.filter((guest) => guest.attendance !== "yes").length,
      veg: guests.filter((guest) => guest.mealPreference === "veg").length
    }),
    [guests]
  );

  const deleteGuest = async (id: string) => {
    await deleteDoc(doc(db, "rsvps", id));
  };

  const toggleAttendance = async (id: string, current: string) => {
    await updateDoc(doc(db, "rsvps", id), {
      attendance: current === "yes" ? "no" : "yes"
    });
  };

  const toggleMeal = async (id: string, current: string) => {
    await updateDoc(doc(db, "rsvps", id), {
      mealPreference: current === "veg" ? "nonveg" : "veg"
    });
  };

  return (
    <section style={shell}>
      <div style={header}>
        <div style={{ display: "grid", gap: 6 }}>
          <span style={eyebrow}>Guest Management</span>
          <h2 style={title}>RSVP Manager</h2>
          <p style={copy}>Review attendance, swap meal preference, and clean up records from one place.</p>
        </div>
        <div style={statGrid}>
          <SummaryPill label="Guests" value={summary.total} tone="#7cc4ff" />
          <SummaryPill label="Attending" value={summary.attending} tone="#49d17d" />
          <SummaryPill label="Not Going" value={summary.notAttending} tone="#ff7b7b" />
          <SummaryPill label="Veg" value={summary.veg} tone="#b7df74" />
        </div>
      </div>

      {guests.length === 0 ? (
        <div style={emptyState}>No RSVP records found for the current filter.</div>
      ) : isMobile ? (
        <div style={cardList}>
          {guests.map((guest) => (
            <article key={guest.id} style={card}>
              <div style={cardHeader}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={cardTitle}>{guest.name ?? "Unknown guest"}</h3>
                  <p style={cardSubtle}>{guest.entryId ? `Entry ID ${guest.entryId}` : "RSVP record"}</p>
                </div>
                <span style={attendanceBadge(guest.attendance ?? "no")}>
                  {guest.attendance === "yes" ? "Attending" : "Not Attending"}
                </span>
              </div>

              <div style={metaGrid}>
                <div style={metaItem}>
                  <span style={metaLabel}>Meal</span>
                  <span style={mealBadge(guest.mealPreference ?? "-")}>{guest.mealPreference ?? "-"}</span>
                </div>
                <div style={metaItem}>
                  <span style={metaLabel}>Status</span>
                  <span style={metaValue}>{guest.attendance === "yes" ? "Confirmed" : "Declined"}</span>
                </div>
              </div>

              <div style={actionStack}>
                {canManage ? (
                  <>
                    <button style={primaryBtn} onClick={() => toggleAttendance(guest.id, guest.attendance ?? "no")}>
                      Toggle Attendance
                    </button>
                    <button style={secondaryBtn} onClick={() => toggleMeal(guest.id, guest.mealPreference ?? "veg")}>
                      Toggle Meal
                    </button>
                    <button style={dangerBtn} onClick={() => deleteGuest(guest.id)}>
                      Delete RSVP
                    </button>
                  </>
                ) : (
                  <div style={viewerNote}>Viewer mode: editing disabled for this session.</div>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr style={tableHeadRow}>
                <th style={th}>Guest</th>
                <th style={th}>Entry ID</th>
                <th style={th}>Meal</th>
                <th style={th}>Attendance</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <tr key={guest.id} style={tableRow}>
                  <td style={tdStrong}>{guest.name ?? "Unknown guest"}</td>
                  <td style={td}>{guest.entryId ?? "-"}</td>
                  <td style={td}>
                    <span style={mealBadge(guest.mealPreference ?? "-")}>{guest.mealPreference ?? "-"}</span>
                  </td>
                  <td style={td}>
                    <span style={attendanceBadge(guest.attendance ?? "no")}>
                      {guest.attendance === "yes" ? "Attending" : "Not Attending"}
                    </span>
                  </td>
                  <td style={td}>
                    {canManage ? (
                      <div style={actions}>
                        <button style={primaryBtn} onClick={() => toggleAttendance(guest.id, guest.attendance ?? "no")}>
                          Toggle Attendance
                        </button>
                        <button style={secondaryBtn} onClick={() => toggleMeal(guest.id, guest.mealPreference ?? "veg")}>
                          Toggle Meal
                        </button>
                        <button style={dangerBtn} onClick={() => deleteGuest(guest.id)}>
                          Delete
                        </button>
                      </div>
                    ) : (
                      <span style={viewerNote}>Viewer mode</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function SummaryPill({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div style={{ ...summaryPill, borderColor: toAlpha(tone, 0.34), background: toAlpha(tone, 0.08) }}>
      <span style={summaryLabel}>{label}</span>
      <strong style={{ ...summaryValue, color: tone }}>{value}</strong>
    </div>
  );
}

const shell: CSSProperties = {
  marginTop: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(13,16,20,0.94) 18%, rgba(8,11,14,0.98) 100%)",
  borderRadius: 20,
  padding: 16,
  display: "grid",
  gap: 16,
  boxShadow: "0 20px 44px rgba(0,0,0,0.24)"
};

const header: CSSProperties = {
  display: "grid",
  gap: 14
};

const eyebrow: CSSProperties = {
  color: "#f5c768",
  fontSize: 11,
  letterSpacing: 1.1,
  textTransform: "uppercase",
  fontWeight: 800
};

const title: CSSProperties = {
  margin: 0,
  color: "#fff7df",
  fontSize: 24,
  lineHeight: 1.05
};

const copy: CSSProperties = {
  margin: 0,
  color: "#aeb7c1",
  fontSize: 13,
  lineHeight: 1.5
};

const statGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))",
  gap: 10
};

const summaryPill: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 16,
  padding: "12px 14px",
  display: "grid",
  gap: 6
};

const summaryLabel: CSSProperties = {
  color: "#98a2ad",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 0.9
};

const summaryValue: CSSProperties = {
  fontSize: 24,
  lineHeight: 1,
  fontWeight: 900
};

const tableWrap: CSSProperties = {
  overflowX: "auto",
  WebkitOverflowScrolling: "touch"
};

const table: CSSProperties = {
  width: "100%",
  minWidth: 860,
  borderCollapse: "collapse",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 16,
  overflow: "hidden",
  background: "rgba(255,255,255,0.02)"
};

const tableHeadRow: CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  borderBottom: "1px solid rgba(255,255,255,0.12)"
};

const th: CSSProperties = {
  padding: "14px 16px",
  textAlign: "left",
  color: "#e2bf73",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: 0.5,
  textTransform: "uppercase"
};

const td: CSSProperties = {
  padding: "16px",
  color: "#dfe5eb",
  fontSize: 14,
  verticalAlign: "top"
};

const tdStrong: CSSProperties = {
  ...td,
  color: "#fff",
  fontWeight: 700
};

const tableRow: CSSProperties = {
  borderBottom: "1px solid rgba(255,255,255,0.08)"
};

const actions: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8
};

const cardList: CSSProperties = {
  display: "grid",
  gap: 12
};

const card: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 18,
  background: "rgba(255,255,255,0.03)",
  padding: 14,
  display: "grid",
  gap: 12
};

const cardHeader: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "flex-start"
};

const cardTitle: CSSProperties = {
  margin: 0,
  color: "#fff",
  fontSize: 17,
  lineHeight: 1.2
};

const cardSubtle: CSSProperties = {
  margin: "4px 0 0",
  color: "#9aa3ad",
  fontSize: 12
};

const metaGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10
};

const metaItem: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  padding: "10px 11px",
  background: "rgba(0,0,0,0.16)",
  display: "grid",
  gap: 6
};

const metaLabel: CSSProperties = {
  color: "#9aa3ad",
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: 0.8
};

const metaValue: CSSProperties = {
  color: "#eef2f7",
  fontSize: 13,
  fontWeight: 700
};

const actionStack: CSSProperties = {
  display: "grid",
  gap: 8
};

const emptyState: CSSProperties = {
  border: "1px dashed rgba(255,255,255,0.18)",
  borderRadius: 18,
  padding: "28px 16px",
  textAlign: "center",
  color: "#9fa8b2",
  background: "rgba(255,255,255,0.02)"
};

const viewerNote: CSSProperties = {
  color: "#9aa3ad",
  fontSize: 12,
  lineHeight: 1.4
};

const buttonBase: CSSProperties = {
  border: "none",
  borderRadius: 10,
  padding: "9px 12px",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 800
};

const primaryBtn: CSSProperties = {
  ...buttonBase,
  background: "#ffd57a",
  color: "#1c1303"
};

const secondaryBtn: CSSProperties = {
  ...buttonBase,
  background: "rgba(124,196,255,0.12)",
  color: "#9dd3ff",
  border: "1px solid rgba(124,196,255,0.24)"
};

const dangerBtn: CSSProperties = {
  ...buttonBase,
  background: "rgba(255,77,79,0.16)",
  color: "#ff8c8d",
  border: "1px solid rgba(255,77,79,0.28)"
};

const attendanceBadge = (attendance: string): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "6px 10px",
  borderRadius: 999,
  border: `1px solid ${attendance === "yes" ? "rgba(73,209,125,0.42)" : "rgba(255,123,123,0.36)"}`,
  color: attendance === "yes" ? "#49d17d" : "#ff7b7b",
  background: attendance === "yes" ? "rgba(73,209,125,0.12)" : "rgba(255,123,123,0.10)",
  fontSize: 11,
  fontWeight: 800,
  whiteSpace: "nowrap"
});

const mealBadge = (meal: string): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  width: "fit-content",
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.14)",
  color: meal === "veg" ? "#b7df74" : meal === "nonveg" ? "#ffb05c" : "#dfe5eb",
  background: "rgba(255,255,255,0.04)",
  textTransform: "uppercase",
  fontSize: 11,
  letterSpacing: 0.5,
  fontWeight: 800
});

const toAlpha = (hex: string, alpha: number) => {
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
