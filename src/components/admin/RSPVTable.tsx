import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function RSVPTable({ guests }: any) {

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
    <div style={wrap}>
      <h2 style={title}>RSVP List</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "rgba(255,255,255,0.02)",
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.12)"
        }}
      >

        <thead>

          <tr style={{ background: "#1c1c1c" }}>
            <th style={th}>Name</th>
            <th style={th}>Meal</th>
            <th style={th}>Attending</th>
            <th style={th}>Actions</th>
          </tr>

        </thead>

        <tbody>

          {guests.length === 0 && (
            <tr>
              <td style={emptyTd} colSpan={4}>No RSVP records found.</td>
            </tr>
          )}

          {guests.map((g: any) => (

            <tr
              key={g.id}
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.08)"
              }}
            >

              <td style={td}>{g.name}</td>
              <td style={td}>
                <span style={mealBadge(g.mealPreference)}>{g.mealPreference}</span>
              </td>

              <td style={td}>
                <span style={attendanceBadge(g.attendance)}>
                  {g.attendance === "yes" ? "Yes" : "No"}
                </span>
              </td>

              <td style={td}>

                <button
                  style={toggleBtn}
                  onClick={() => toggleAttendance(g.id, g.attendance)}
                >
                  Toggle
                </button>

                <button
                  style={toggleBtn}
                  onClick={() => toggleMeal(g.id, g.mealPreference)}
                >
                  Toggle Menu
                </button>

                <button
                  style={deleteBtn}
                  onClick={() => deleteGuest(g.id)}
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );
}

const wrap = {
  marginTop: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
  borderRadius: 14,
  padding: 16
};

const title = {
  marginTop: 0,
  marginBottom: 15
};

const th = {
  padding: "14px",
  textAlign: "left" as const,
  color: "#f5b000",
  fontWeight: 500
};

const td = {
  padding: "14px"
};

const emptyTd = {
  padding: "20px 14px",
  color: "#aaa",
  textAlign: "center" as const
};

const toggleBtn = {
  padding: "6px 14px",
  marginRight: 10,
  borderRadius: 6,
  border: "none",
  background: "#f5b000",
  color: "#111",
  cursor: "pointer"
};

const deleteBtn = {
  padding: "6px 14px",
  borderRadius: 6,
  border: "none",
  background: "#ff4d4d",
  color: "#fff",
  cursor: "pointer"
};

const attendanceBadge = (attendance: string) => ({
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: 999,
  border: `1px solid ${attendance === "yes" ? "#2ecc71" : "#ff6b6b"}`,
  color: attendance === "yes" ? "#2ecc71" : "#ff6b6b",
  fontSize: 12,
  fontWeight: 700
});

const mealBadge = (meal: string) => ({
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.2)",
  color: meal === "veg" ? "#a5d6a7" : "#ffcc80",
  textTransform: "uppercase" as const,
  fontSize: 11,
  letterSpacing: 0.5,
  fontWeight: 700
});
