import React, { memo } from "react";
import { Suggestion } from "../../types/admin";

interface SuggestionsTableProps {
  suggestions: Suggestion[];
}

/**
 * SuggestionsTable - Optimized for long-form text content.
 * Memoized to ensure smooth dashboard interactions.
 */
const SuggestionsTable = memo(({ suggestions }: SuggestionsTableProps) => {
  // Sort by timestamp (newest feedback at the top)
  const sortedSuggestions = [...suggestions].sort((a, b) => {
    const timeA = a.timestamp?.seconds || 0;
    const timeB = b.timestamp?.seconds || 0;
    return timeB - timeA;
  });

  return (
    <div style={containerStyle}>
      <div style={headerSectionStyle}>
        <h2 style={titleStyle}>Guest Suggestions</h2>
        <span style={countBadgeStyle}>{suggestions.length}</span>
      </div>

      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr style={headRowStyle}>
              <th style={{ ...thStyle, width: "30%" }}>Guest</th>
              <th style={{ ...thStyle, width: "70%" }}>Feedback / Suggestion</th>
            </tr>
          </thead>
          <tbody>
            {sortedSuggestions.length > 0 ? (
              sortedSuggestions.map((s) => (
                <tr key={s.id} style={rowStyle}>
                  <td style={tdStyle}>
                    <div style={nameStyle}>{s.name || "Anonymous"}</div>
                  </td>
                  <td style={tdStyle}>
                    <div style={suggestionBubbleStyle}>
                      {s.suggestion || "—"}
                    </div>
                  </td>
               </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} style={emptyStateStyle}>
                  No suggestions have been submitted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

/* --- Styled Tokens --- */

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
  overflow: "hidden",
  maxHeight: "500px",
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
  verticalAlign: "top",
};

const rowStyle: React.CSSProperties = {
  transition: "background 0.2s ease",
};

const nameStyle: React.CSSProperties = {
  fontWeight: 600,
  color: "#fff",
};

const suggestionBubbleStyle: React.CSSProperties = {
  background: "#1e1e1e",
  padding: "10px 14px",
  borderRadius: "8px",
  color: "#ccc",
  lineHeight: "1.5",
  fontSize: "0.95rem",
  borderLeft: "3px solid #f5b000",
};

const emptyStateStyle: React.CSSProperties = {
  padding: "40px",
  textAlign: "center",
  color: "#666",
};

export default SuggestionsTable;