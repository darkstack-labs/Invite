import React, { useCallback, useEffect, useMemo, useState } from "react";

import AdminLayout from "../components/admin/AdminLayout";
import AdminStats from "../components/admin/AdminStats";
import RSVPTable from "../components/admin/RSPVTable";
import SongsTable from "../components/admin/SongsTable";
import SuggestionsTable from "../components/admin/SuggestionsTable";
import useRSVPs from "../hooks/useRSPVs";
import useSongs from "../hooks/useSongs";
import useSuggestions from "../hooks/useSuggestions";
import type { AdminStatsData, RSVP } from "../types/admin";

const AUTH_KEY = "admin-auth-session";

const AdminLogin = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
  const [passcode, setPasscode] = useState("");

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#0b0b0b",
        color: "#fff",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          border: "1px solid #222",
          borderRadius: "16px",
          padding: "24px",
          background: "#121212",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Admin Access</h1>
        <p style={{ color: "#888", marginTop: "8px" }}>
          This local gate only protects the dashboard UI shell.
        </p>
        <input
          type="password"
          value={passcode}
          onChange={(event) => setPasscode(event.target.value)}
          placeholder="Enter any admin passcode"
          style={{
            width: "100%",
            marginTop: "16px",
            padding: "12px 14px",
            borderRadius: "10px",
            border: "1px solid #333",
            background: "#0b0b0b",
            color: "#fff",
          }}
        />
        <button
          type="button"
          onClick={onLoginSuccess}
          disabled={!passcode.trim()}
          style={{
            width: "100%",
            marginTop: "16px",
            padding: "12px 14px",
            borderRadius: "10px",
            border: "1px solid #f5b000",
            background: "#f5b000",
            color: "#111",
            cursor: passcode.trim() ? "pointer" : "not-allowed",
            fontWeight: 700,
            opacity: passcode.trim() ? 1 : 0.6,
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default function AdminDashboard(): JSX.Element {
  const rsvps = useRSVPs();
  const songs = useSongs();
  const suggestions = useSuggestions();

  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTH_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  const filteredGuests = useMemo(() => {
    const query = debouncedSearch.toLowerCase().trim();

    if (!query) {
      return rsvps;
    }

    return rsvps.filter((guest: RSVP) =>
      (guest?.name ?? "").toLowerCase().includes(query)
    );
  }, [debouncedSearch, rsvps]);

  const stats: AdminStatsData = useMemo(
    () => ({
      total: rsvps.length,
      attending: rsvps.filter((rsvp) => rsvp.attendance === "yes").length,
      veg: rsvps.filter((rsvp) => rsvp.mealPreference === "veg").length,
      nonVeg: rsvps.filter((rsvp) => rsvp.mealPreference === "nonveg").length,
    }),
    [rsvps]
  );

  const handleLogin = useCallback(() => {
    localStorage.setItem(AUTH_KEY, "true");
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  }, []);

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLogin} />;
  }

  return (
    <AdminLayout activeSection="Dashboard">
      <div style={headerActionStyle}>
        <div>
          <h1 style={titleStyle}>Event Overview</h1>
          <p style={subtitleStyle}>Real-time guest and request management</p>
        </div>
        <button
          onClick={handleLogout}
          style={logoutButtonStyle}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = "rgba(255,77,79,0.1)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = "transparent";
          }}
        >
          Sign Out
        </button>
      </div>

      <hr style={dividerStyle} />

      <AdminStats stats={stats} />

      <div style={contentGridStyle}>
        <section style={sectionStyle}>
          <div style={toolbarStyle}>
            <h2 style={sectionTitleStyle}>Guest List</h2>
            <div style={searchContainerStyle}>
              <span style={searchIconStyle}>Search</span>
              <input
                type="text"
                placeholder="Search by guest name..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                style={searchInputStyle}
              />
            </div>
          </div>
          <RSVPTable guests={filteredGuests} />
        </section>

        <div style={splitGridStyle}>
          <SongsTable songs={songs} />
          <SuggestionsTable suggestions={suggestions} />
        </div>
      </div>
    </AdminLayout>
  );
}

const headerActionStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  marginBottom: "20px",
};

const titleStyle: React.CSSProperties = {
  fontSize: "2rem",
  fontWeight: 800,
  margin: 0,
  color: "#fff",
};

const subtitleStyle: React.CSSProperties = {
  color: "#666",
  margin: "4px 0 0 0",
};

const logoutButtonStyle: React.CSSProperties = {
  padding: "10px 20px",
  backgroundColor: "transparent",
  color: "#ff4d4f",
  border: "1px solid #ff4d4f",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
  transition: "all 0.2s ease",
};

const dividerStyle: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #222",
  margin: "30px 0",
};

const contentGridStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "50px",
};

const sectionStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const toolbarStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "15px",
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "1.25rem",
  color: "#f5b000",
};

const searchContainerStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  maxWidth: "350px",
};

const searchIconStyle: React.CSSProperties = {
  position: "absolute",
  left: "12px",
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: "12px",
  opacity: 0.5,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const searchInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px 12px 64px",
  backgroundColor: "#161616",
  border: "1px solid #333",
  borderRadius: "10px",
  color: "#fff",
  fontSize: "0.95rem",
  outline: "none",
};

const splitGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
  gap: "30px",
  alignItems: "start",
};
