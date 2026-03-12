// Components
import AdminLayout from "../components/admin/AdminLayout";
import AdminStats from "../components/admin/AdminStats";
import RSVPTable from "../components/admin/RSPVTable";
import SongsTable from "../components/admin/SongsTable";
import SuggestionsTable from "../components/admin/SuggestionsTable";

// Hooks
import useRSVPs from "../hooks/useRSPVs";
import useSongs from "../hooks/useSongs";
import useSuggestions from "../hooks/useSuggestions";

// Types
import { RSVP, SongRequest, Suggestion, AdminStatsData } from "../types/admin";

const AUTH_KEY = "admin-auth-session";
export default function AdminDashboard(): JSX.Element {
  /* ---------------- DATA HOOKS ---------------- */
  // Real-time Firestore listeners
  const rsvps = useRSVPs() ?? [];
  const songs = useSongs() ?? [];
  const suggestions = useSuggestions() ?? [];

  /* ---------------- STATE ---------------- */
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTH_KEY) === "true";
    } catch {
      return false;
    }
  });

  /* ---------------- EFFECTS ---------------- */
  // Debounce search input to optimize performance
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  /* ---------------- DERIVED DATA ---------------- */
  // Memoized guest filtering
  const filteredGuests = useMemo(() => {
    const query = debouncedSearch.toLowerCase().trim();
    if (!query) return rsvps;
    return rsvps.filter((guest: RSVP) =>
      (guest?.name ?? "").toLowerCase().includes(query)
    );
  }, [rsvps, debouncedSearch]);

  // Memoized statistics
  const stats: AdminStatsData = useMemo(() => {
    return {
      total: rsvps.length,
      attending: rsvps.filter((r) => r.attendance === "yes").length,
      veg: rsvps.filter((r) => r.mealPreference === "veg").length,
      nonVeg: rsvps.filter((r) => r.mealPreference === "nonveg").length,
    };
  }, [rsvps]);

  /* ---------------- HANDLERS ---------------- */
  const handleLogin = useCallback(() => {
    localStorage.setItem(AUTH_KEY, "true");
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  }, []);

  /* ---------------- AUTH GUARD ---------------- */
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLogin} />;
  }

  /* ---------------- RENDER ---------------- */
  return (
    <AdminLayout activeSection="Dashboard">
      {/* Header & Logout */}
      <div style={headerActionStyle}>
        <div>
          <h1 style={titleStyle}>Event Overview</h1>
          <p style={subtitleStyle}>Real-time guest and request management</p>
        </div>
        <button
          onClick={handleLogout}
          style={logoutButtonStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,77,79,0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          Sign Out
        </button>
      </div>

      <hr style={dividerStyle} />

      {/* Statistics Section */}
      <AdminStats stats={stats} />

      {/* Main Management Section */}
      <div style={contentGridStyle}>
        
        {/* RSVPs (Full Width) */}
        <section style={sectionStyle}>
          <div style={toolbarStyle}>
            <h2 style={sectionTitleStyle}>Guest List</h2>
            <div style={searchContainerStyle}>
              <span style={searchIconStyle}>🔍</span>
              <input
                type="text"
                placeholder="Search by guest name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={searchInputStyle}
              />
            </div>
          </div>
          <RSVPTable guests={filteredGuests} />
        </section>

        {/* Requests & Feedback (Split Grid) */}
        <div style={splitGridStyle}>
          <SongsTable songs={songs} />
          <SuggestionsTable suggestions={suggestions} />
        </div>

      </div>
    </AdminLayout>
  );
}

/* ---------------- STYLES (Production Dark Theme) ---------------- */

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
  fontSize: "14px",
  opacity: 0.5,
};

const searchInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px 12px 40px",
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

const sectionSpacer: React.CSSProperties = {
  marginTop: "40px"
};