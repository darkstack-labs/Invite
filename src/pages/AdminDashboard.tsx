import { useState, useMemo } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import AdminStats from "../components/admin/AdminStats";
import RSVPTable from "../components/admin/RSPVTable";
import SongsTable from "../components/admin/SongsTable";
import SuggestionsTable from "../components/admin/SuggestionsTable";

import useRSVPs from "../hooks/useRSPVs";
import useSongs from "../hooks/useSongs";
import useSuggestions from "../hooks/useSuggestions";

interface RSVP {
  name?: string;
  attendance?: "yes" | "no";
  mealPreference?: "veg" | "nonveg";
}

const ADMIN_PASSWORD = "randiokimehfil";

export default function AdminDashboard(): JSX.Element {

  /* ---------------- DATA HOOKS ---------------- */

  const rsvps = useRSVPs() ?? [];
  const songs = useSongs() ?? [];
  const suggestions = useSuggestions() ?? [];

  /* ---------------- STATE ---------------- */

  const [search, setSearch] = useState<string>("");

  const [authenticated, setAuthenticated] = useState<boolean>(
    localStorage.getItem("admin-auth") === "true"
  );

  const [password, setPassword] = useState<string>("");

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
    <AdminLayout>

      {/* LOGOUT */}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 20,
        }}
      >
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 14px",
            borderRadius: 6,
            border: "none",
            background: "#ff4d4f",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* STATS */}

      <AdminStats stats={stats} />

      {/* SEARCH */}

      <div style={{ marginBottom: 30 }}>
        <input
          placeholder="Search guest..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: 10,
            width: 300,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />
      </div>

      {/* RSVP TABLE */}

      <RSVPTable guests={filteredGuests} />

      {/* SONG REQUESTS */}

      <SongsTable songs={songs} />

      {/* SUGGESTIONS */}

      <SuggestionsTable suggestions={suggestions} />

    </AdminLayout>
  );
}
