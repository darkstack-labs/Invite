import React, { memo } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { RSVP } from "../../types/admin";

interface RSVPTableProps {
  guests: RSVP[];
}

/**
 * RSVPTable - Refactored for safety, performance, and improved UX.
 * Includes Firestore write operations and visual status indicators.
 */
const RSVPTable = memo(({ guests }: RSVPTableProps) => {
  
  /* ---------------- ACTIONS ---------------- */

  const deleteGuest = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${name || "this guest"}?`);
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "rsvps", id));
    } catch (error) {
      console.error("Error deleting guest:", error);
      alert("Failed to delete guest. Please try again.");
    }
  };

const toggleAttendance = async (id: string, current: "yes" | "no") => {    try {
      await updateDoc(doc(db, "rsvps", id), {
        attendance: current === "yes" ? "no" : "yes"
      });
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerSectionStyle}>
        <h2 style={titleStyle}>RSVP List</h2>
        <span style={countBadgeStyle}>{guests.length} Guests</span>
      </div>

      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr style={headRowStyle}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Meal Preference</th>
              <th style={thStyle}>Attending</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {guests.length > 0 ? (
              guests.map((g) => (
                <tr
                  key={g.id}
                  style={rowStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#1a1a1a")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={tdStyle}>
                    <span style={nameStyle}>{g.name || "Anonymous"}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={mealBadgeStyle(g.mealPreference)}>
                      {g.mealPreference === "veg" ? "🥬 Veg" : "🍗 Non-Veg"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={attendanceBadgeStyle(g.attendance === "yes")}>
                      {g.attendance === "yes" ? "Confirmed" : "Declined"}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <button
                      style={toggleBtnStyle}
                      onClick={() => toggleAttendance(g.id, g.attendance)}
                      title="Toggle Attendance"
                    >
                      Toggle
                    </button>
                    <button
                      style={deleteBtnStyle}
                      onClick={() => deleteGuest(g.id, g.name)}
                      title="Delete Entry"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={emptyStateStyle}>No guests match your search.</td>
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
  marginTop: "20px",
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
  background: "#333",
  color: "#f5b000",
  padding: "4px 12px",
  borderRadius: "20px",
  fontSize: "0.8rem",
  fontWeight: 600,
  border: "1px solid #444"
};

const tableWrapperStyle: React.CSSProperties = {
  background: "#161616",
  borderRadius: "12px",
  border: "1px solid #222",
  overflow: "hidden",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const headRowStyle: React.CSSProperties = {
  background: "#1c1c1c",
};

const thStyle: React.CSSProperties = {
  padding: "16px",
  textAlign: "left",
  color: "#f5b000",
  fontSize: "0.85rem",
  textTransform: "uppercase",
  letterSpacing: "1px",
};

const tdStyle: React.CSSProperties = {
  padding: "16px",
  borderBottom: "1px solid #222",
  color: "#eee",
};

const rowStyle: React.CSSProperties = {
  transition: "background 0.2s",
};

const nameStyle: React.CSSProperties = {
  fontWeight: 500,
};

const attendanceBadgeStyle = (isAttending: boolean): React.CSSProperties => ({
  padding: "4px 10px",
  borderRadius: "6px",
  fontSize: "0.75rem",
  fontWeight: "bold",
  background: isAttending ? "rgba(40, 167, 69, 0.1)" : "rgba(220, 53, 69, 0.1)",
  color: isAttending ? "#28a745" : "#dc3545",
  border: `1px solid ${isAttending ? "#28a745" : "#dc3545"}`,
});

const mealBadgeStyle = (pref: string): React.CSSProperties => ({
  fontSize: "0.9rem",
  color: pref === "veg" ? "#81c784" : "#e57373",
});

const toggleBtnStyle: React.CSSProperties = {
  padding: "6px 12px",
  marginRight: "8px",
  borderRadius: "6px",
  border: "1px solid #f5b000",
  background: "transparent",
  color: "#f5b000",
  cursor: "pointer",
  fontSize: "0.85rem",
  transition: "all 0.2s"
};

const deleteBtnStyle: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "none",
  background: "#ff4d4d",
  color: "#fff",
  cursor: "pointer",
  fontSize: "0.85rem",
};

const emptyStateStyle: React.CSSProperties = {
  padding: "30px",
  textAlign: "center",
  color: "#666",
};

export default RSVPTable;