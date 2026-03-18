import { useMemo, useState, type CSSProperties } from "react";
import { useIsMobile } from "@/hooks/useDeviceType";

type SongRow = {
  id: string;
  name?: string;
  songName?: string;
  artist?: string;
};

export default function SongsTable({
  songs,
  onDelete
}: {
  songs: SongRow[];
  onDelete?: (id: string) => void;
}) {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");

  const filteredSongs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return songs;

    return songs.filter((song) =>
      `${song.name ?? ""} ${song.songName ?? ""} ${song.artist ?? ""}`.toLowerCase().includes(query)
    );
  }, [search, songs]);

  const uniqueGuests = new Set(songs.map((song) => (song.name ?? "").trim()).filter(Boolean)).size;

  return (
    <section style={shell}>
      <div style={header}>
        <div style={{ display: "grid", gap: 6 }}>
          <span style={eyebrow}>Music Queue</span>
          <h2 style={title}>Song Requests</h2>
          <p style={copy}>Moderate the playlist, review requests quickly, and clean up duplicates from either device.</p>
        </div>
        <div style={statGrid}>
          <MetricCard label="Requests" value={songs.length} tone="#ffd57a" />
          <MetricCard label="Guests" value={uniqueGuests} tone="#7cc4ff" />
          <MetricCard label="Shown" value={filteredSongs.length} tone="#49d17d" />
        </div>
      </div>

      <div style={toolbar}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by guest, song, or artist"
          style={searchInput}
        />
      </div>

      {filteredSongs.length === 0 ? (
        <div style={emptyState}>
          {songs.length === 0 ? "No song requests found." : "No song requests match the current search."}
        </div>
      ) : isMobile ? (
        <div style={cardList}>
          {filteredSongs.map((song) => (
            <article key={song.id} style={card}>
              <div style={cardHeader}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={cardTitle}>{song.songName ?? "Untitled request"}</h3>
                  <p style={cardSubtle}>{song.artist?.trim() || "Artist missing"}</p>
                </div>
                <span style={guestPill}>{song.name ?? "Unknown guest"}</span>
              </div>

              <div style={metaGrid}>
                <div style={metaItem}>
                  <span style={metaLabel}>Requested by</span>
                  <span style={metaValue}>{song.name ?? "-"}</span>
                </div>
                <div style={metaItem}>
                  <span style={metaLabel}>Artist</span>
                  <span style={metaValue}>{song.artist ?? "-"}</span>
                </div>
              </div>

              <button style={dangerBtn} onClick={() => onDelete?.(song.id)}>
                Delete Request
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr style={headRow}>
                <th style={th}>Guest</th>
                <th style={th}>Song</th>
                <th style={th}>Artist</th>
                <th style={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSongs.map((song) => (
                <tr key={song.id} style={row}>
                  <td style={tdStrong}>{song.name ?? "-"}</td>
                  <td style={td}>{song.songName ?? "-"}</td>
                  <td style={td}>{song.artist ?? "-"}</td>
                  <td style={td}>
                    <button style={dangerBtn} onClick={() => onDelete?.(song.id)}>
                      Delete
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
  fontWeight: 700
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

const guestPill: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid rgba(124,196,255,0.32)",
  color: "#9dd3ff",
  background: "rgba(124,196,255,0.12)",
  fontSize: 11,
  fontWeight: 800,
  whiteSpace: "nowrap"
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

const dangerBtn: CSSProperties = {
  border: "1px solid rgba(255,77,79,0.28)",
  borderRadius: 10,
  padding: "9px 12px",
  cursor: "pointer",
  background: "rgba(255,77,79,0.16)",
  color: "#ff8c8d",
  fontWeight: 800,
  fontSize: 12
};

const toAlpha = (hex: string, alpha: number) => {
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
