import { useMemo, useState, type CSSProperties } from "react";
import { useIsMobile } from "@/hooks/useDeviceType";

type SuggestionRow = {
  id: string;
  name?: string;
  suggestion?: string;
};

export default function SuggestionsTable({
  suggestions,
  onDelete,
  canManage = false
}: {
  suggestions: SuggestionRow[];
  onDelete?: (id: string) => void;
  canManage?: boolean;
}) {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");

  const filteredSuggestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return suggestions;

    return suggestions.filter((item) =>
      `${item.name ?? ""} ${item.suggestion ?? ""}`.toLowerCase().includes(query)
    );
  }, [search, suggestions]);

  const namedSuggestions = suggestions.filter((item) => (item.name ?? "").trim().length > 0).length;

  return (
    <section style={shell}>
      <div style={header}>
        <div style={{ display: "grid", gap: 6 }}>
          <span style={eyebrow}>Guest Feedback</span>
          <h2 style={title}>Suggestion Requests</h2>
          <p style={copy}>Scan feedback faster, search by guest or note text, and moderate ideas without losing mobile polish.</p>
        </div>
        <div style={statGrid}>
          <MetricCard label="Suggestions" value={suggestions.length} tone="#ffd57a" />
          <MetricCard label="Named" value={namedSuggestions} tone="#7cc4ff" />
          <MetricCard label="Shown" value={filteredSuggestions.length} tone="#49d17d" />
        </div>
      </div>

      <div style={toolbar}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by guest or suggestion"
          style={searchInput}
        />
      </div>

      {filteredSuggestions.length === 0 ? (
        <div style={emptyState}>
          {suggestions.length === 0 ? "No suggestions found." : "No suggestions match the current search."}
        </div>
      ) : isMobile ? (
        <div style={cardList}>
          {filteredSuggestions.map((item) => (
            <article key={item.id} style={card}>
              <div style={cardHeader}>
                <div>
                  <span style={authorLabel}>From</span>
                  <h3 style={cardTitle}>{item.name ?? "Anonymous guest"}</h3>
                </div>
                {canManage ? (
                  <button style={dangerBtn} onClick={() => onDelete?.(item.id)}>
                    Delete
                  </button>
                ) : (
                  <span style={viewerNote}>Viewer mode</span>
                )}
              </div>
              <div style={suggestionBox}>{item.suggestion ?? "-"}</div>
            </article>
          ))}
        </div>
      ) : (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr style={headRow}>
                <th style={th}>Guest</th>
                <th style={th}>Suggestion</th>
                <th style={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuggestions.map((item) => (
                <tr key={item.id} style={row}>
                  <td style={tdStrong}>{item.name ?? "Anonymous guest"}</td>
                  <td style={tdWide}>{item.suggestion ?? "-"}</td>
                  <td style={td}>
                    {canManage ? (
                      <button style={dangerBtn} onClick={() => onDelete?.(item.id)}>
                        Delete
                      </button>
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

function MetricCard({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div style={{ ...metricCard, borderColor: toAlpha(tone, 0.26), background: toAlpha(tone, 0.08) }}>
      <span style={metricLabel}>{label}</span>
      <strong style={{ ...metricValue, color: tone }}>{value}</strong>
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

const metricCard: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 16,
  padding: "12px 14px",
  display: "grid",
  gap: 6
};

const metricLabel: CSSProperties = {
  color: "#98a2ad",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 0.9
};

const metricValue: CSSProperties = {
  fontSize: 24,
  lineHeight: 1,
  fontWeight: 900
};

const toolbar: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10
};

const searchInput: CSSProperties = {
  width: "100%",
  maxWidth: 360,
  padding: "11px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  outline: "none"
};

const emptyState: CSSProperties = {
  border: "1px dashed rgba(255,255,255,0.18)",
  borderRadius: 18,
  padding: "28px 16px",
  textAlign: "center",
  color: "#9fa8b2",
  background: "rgba(255,255,255,0.02)"
};

const tableWrap: CSSProperties = {
  overflowX: "auto",
  WebkitOverflowScrolling: "touch"
};

const table: CSSProperties = {
  width: "100%",
  minWidth: 760,
  borderCollapse: "collapse",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 16,
  overflow: "hidden",
  background: "rgba(255,255,255,0.02)"
};

const headRow: CSSProperties = {
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

const row: CSSProperties = {
  borderBottom: "1px solid rgba(255,255,255,0.08)"
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
  fontWeight: 700,
  whiteSpace: "nowrap"
};

const tdWide: CSSProperties = {
  ...td,
  lineHeight: 1.6
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

const authorLabel: CSSProperties = {
  color: "#9aa3ad",
  fontSize: 10,
  letterSpacing: 0.9,
  textTransform: "uppercase"
};

const cardTitle: CSSProperties = {
  margin: "4px 0 0",
  color: "#fff",
  fontSize: 17,
  lineHeight: 1.2
};

const suggestionBox: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  padding: "12px 13px",
  background: "rgba(0,0,0,0.16)",
  color: "#eef2f7",
  fontSize: 13,
  lineHeight: 1.6
};

const dangerBtn: CSSProperties = {
  border: "1px solid rgba(255,77,79,0.28)",
  borderRadius: 10,
  padding: "9px 12px",
  cursor: "pointer",
  background: "rgba(255,77,79,0.16)",
  color: "#ff8c8d",
  fontWeight: 800,
  fontSize: 12,
  whiteSpace: "nowrap"
};

const viewerNote: CSSProperties = {
  color: "#9aa3ad",
  fontSize: 12,
  lineHeight: 1.4
};

const toAlpha = (hex: string, alpha: number) => {
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
