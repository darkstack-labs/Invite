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

  return (

    <div style={{ marginTop: 20 }}>

      <h2 style={{ marginBottom: 15 }}>RSVP List</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#161616",
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid #222"
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

          {guests.map((g: any) => (

            <tr
              key={g.id}
              style={{
                borderBottom: "1px solid #222"
              }}
            >

              <td style={td}>{g.name}</td>
              <td style={td}>{g.mealPreference}</td>

              <td style={td}>
                {g.attendance === "yes" ? "Yes" : "No"}
              </td>

              <td style={td}>

                <button
                  style={toggleBtn}
                  onClick={() => toggleAttendance(g.id, g.attendance)}
                >
                  Toggle
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

const th = {
  padding: "14px",
  textAlign: "left" as const,
  color: "#f5b000",
  fontWeight: 500
};

const td = {
  padding: "14px"
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