import React, { memo } from "react";
import { SongRequest } from "../../types/admin";

interface SongsTableProps {
  songs: SongRequest[];
}

/**
 * SongsTable - Memoized to prevent re-renders when other 
 * Firestore collections (RSVP/Suggestions) update.
 */
const SongsTable = memo(({ songs }: SongsTableProps) => {
  // Sort by timestamp if available (newest first)
  const sortedSongs = [...songs].sort((a, b) => {
    const timeA = a.timestamp?.seconds || 0;
    const timeB = b.timestamp?.seconds || 0;
    return timeB - timeA;
  });

  return (
    <div style={containerStyle}>
      <div style={headerSectionStyle}>
        <h2 style={titleStyle}>Song Requests</h2>
        <span style={countBadgeStyle}>{songs.length}</span>
      </div>

      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr style={headRowStyle}>
              <th style={thStyle}>Requested By</th>
              <th style={thStyle}>Song Title</th>
              <th style={thStyle}>Artist</th>
            </tr>
          </thead>
          <tbody>
            {sortedSongs.length > 0 ? (
              sortedSongs.map((song) => (
                <tr
                  key={song.id}
                  style={rowStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#1a1a1a")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={tdStyle}>
                    <div style={nameStyle}>{song.name || "Anonymous"}</div>
                  </td>
                  <td style={tdStyle}>
                    <span style={songNameStyle}>{song.songName || "—"}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={artistStyle}>{song.artist || "—"}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} style={emptyStateStyle}>
                  No song requests submitted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

/* --- Styles --- */

const containerStyle: React.CSSProperties = {
  marginTop: "40px",
  display: "flex",
  flexDirection: "column",
};

const headerSectionStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "15px",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "1.5rem",
  color: "#fff",
};

const countBadgeStyle: React.CSSProperties = {
  background: "#f5b000",
  color: "#000",
  padding: "2px 10px",
  borderRadius: "12px",
  fontSize: "0.85rem",
  fontWeight: "bold",
};

const tableWrapperStyle: React.CSSProperties = {
  background: "#161616",
  borderRadius: "12px",
  border: "1px solid #222",
  overflow: "hidden", // Clips corners of the inner table
  maxHeight: "500px", // Scrollable if list gets long
  overflowY: "auto",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
};

const headRowStyle: React.CSSProperties = {
  background: "#1c1c1c",
  position: "sticky",
  top: 0,
  zIndex: 1,
};

const thStyle: React.CSSProperties = {
  padding: "16px",
  textAlign: "left",
  color: "#f5b000",
  fontSize: "0.9rem",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  borderBottom: "2px solid #222",
};

const tdStyle: React.CSSProperties = {
  padding: "16px",
  borderBottom: "1px solid #222",
  color: "#ccc",
};

const rowStyle: React.CSSProperties = {
  transition: "background 0.2s ease",
  cursor: "default",
};

const nameStyle: React.CSSProperties = {
  fontWeight: 500,
  color: "#fff",
};

const songNameStyle: React.CSSProperties = {
  color: "#f5b000",
  fontWeight: "bold",
};

const artistStyle: React.CSSProperties = {
  fontStyle: "italic",
  opacity: 0.8,
};

const emptyStateStyle: React.CSSProperties = {
  padding: "40px",
  textAlign: "center",
  color: "#666",
};

export default SongsTable;