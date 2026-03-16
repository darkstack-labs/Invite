import { ReactNode, useEffect, useState, type CSSProperties } from "react";

type Section =
  | "overview"
  | "rsvps"
  | "songs"
  | "suggestions"
  | "activity"
  | "device_watch"
  | "games"
  | "games_monitor";

type NavItem = {
  key: Section;
  label: string;
};

interface AdminLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  title: string;
  subtitle: string;
  onLogout: () => void;
}

export default function AdminLayout({
  children,
  navItems,
  activeSection,
  onSectionChange,
  title,
  subtitle,
  onLogout
}: AdminLayoutProps) {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );

  useEffect(() => {
    const onResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) setOpenSidebar(false);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const selectSection = (section: Section) => {
    onSectionChange(section);
    setOpenSidebar(false);
  };

  return (
    <div style={{ ...shell, ...(isDesktop ? {} : shellMobile) }}>
      {!isDesktop && openSidebar && (
        <button
          onClick={() => setOpenSidebar(false)}
          style={overlay}
          aria-label="Close sidebar"
        />
      )}

      <aside
        style={{
          ...sidebar,
          ...(isDesktop ? sidebarDesktop : {}),
          ...(openSidebar ? sidebarOpen : {})
        }}
      >
        <h2 style={brand}>Admin Panel</h2>

        <nav style={nav}>
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => selectSection(item.key)}
              style={{
                ...navItem,
                ...(activeSection === item.key ? navItemActive : {})
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main style={{ ...content, ...(isDesktop ? contentDesktop : contentMobile) }}>
        <header style={{ ...topBar, ...(isDesktop ? {} : topBarMobile) }}>
          <div>
            <h1 style={{ ...pageTitle, ...(isDesktop ? {} : pageTitleMobile) }}>{title}</h1>
            <p style={{ ...pageSubtitle, ...(isDesktop ? {} : pageSubtitleMobile) }}>{subtitle}</p>
          </div>

          <div style={{ ...topActions, ...(isDesktop ? {} : topActionsMobile) }}>
            <button
              onClick={() => setOpenSidebar(true)}
              style={{
                ...menuButton,
                ...(isDesktop ? menuButtonHidden : {}),
                ...(isDesktop ? {} : menuButtonMobile)
              }}
              aria-label="Open sidebar"
            >
              Sections
            </button>

            <button onClick={onLogout} style={{ ...logoutBtn, ...(isDesktop ? {} : logoutBtnMobile) }}>
              Logout
            </button>
          </div>
        </header>

        {!isDesktop && (
          <nav style={mobileTabs} aria-label="Admin sections">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => selectSection(item.key)}
                style={{
                  ...mobileTab,
                  ...(activeSection === item.key ? mobileTabActive : {})
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}

        {children}
      </main>
    </div>
  );
}

const shell: CSSProperties = {
  display: "flex",
  minHeight: "100vh",
  background: "radial-gradient(circle at top left, #1c1c1c 0%, #0e0e0e 45%, #090909 100%)",
  color: "#f5f5f5",
  fontFamily: "system-ui, sans-serif",
  position: "relative"
};

const shellMobile: CSSProperties = {
  flexDirection: "column"
};

const overlay: CSSProperties = {
  position: "fixed",
  inset: 0,
  border: "none",
  background: "rgba(0,0,0,0.55)",
  zIndex: 30
};

const sidebar: CSSProperties = {
  width: 260,
  padding: 24,
  borderRight: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(10,10,10,0.95)",
  position: "fixed",
  top: 0,
  left: 0,
  bottom: 0,
  transform: "translateX(-100%)",
  transition: "transform 220ms ease",
  zIndex: 40
};

const sidebarOpen: CSSProperties = {
  transform: "translateX(0)"
};

const sidebarDesktop: CSSProperties = {
  transform: "translateX(0)",
  zIndex: 10
};

const brand: CSSProperties = {
  marginBottom: 24,
  color: "#f5b000",
  letterSpacing: 1,
  fontSize: 22
};

const nav: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10
};

const navItem: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.12)",
  background: "transparent",
  color: "#ddd",
  borderRadius: 10,
  textAlign: "left",
  padding: "11px 14px",
  cursor: "pointer",
  fontWeight: 600
};

const navItemActive: CSSProperties = {
  background: "linear-gradient(90deg, rgba(245,176,0,0.22), rgba(245,176,0,0.06))",
  borderColor: "rgba(245,176,0,0.55)",
  color: "#ffd57a"
};

const content: CSSProperties = {
  width: "100%",
  padding: 20,
  minWidth: 0,
  overflowX: "hidden"
};

const contentMobile: CSSProperties = {
  padding: 12,
  maxWidth: "100%"
};

const contentDesktop: CSSProperties = {
  marginLeft: 260
};

const topBar: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 18,
  padding: "14px 16px",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 14,
  background: "rgba(255,255,255,0.03)"
};

const topBarMobile: CSSProperties = {
  position: "sticky",
  top: 10,
  zIndex: 20,
  marginBottom: 12,
  padding: "12px 12px 10px",
  borderRadius: 12,
  backdropFilter: "blur(8px)",
  alignItems: "flex-start",
  flexDirection: "column"
};

const topActions: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10
};

const topActionsMobile: CSSProperties = {
  width: "100%",
  justifyContent: "space-between",
  marginTop: 6,
  flexWrap: "wrap"
};

const menuButton: CSSProperties = {
  padding: "9px 14px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "transparent",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600
};

const menuButtonHidden: CSSProperties = {
  display: "none"
};

const menuButtonMobile: CSSProperties = {
  padding: "8px 11px",
  fontSize: 12,
  borderColor: "rgba(245,176,0,0.4)",
  color: "#ffd57a"
};

const logoutBtn: CSSProperties = {
  padding: "9px 14px",
  borderRadius: 8,
  border: "none",
  background: "#ff4d4f",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700
};

const logoutBtnMobile: CSSProperties = {
  padding: "8px 11px",
  fontSize: 12,
  borderRadius: 9
};

const pageTitle: CSSProperties = {
  margin: 0,
  fontSize: 22
};

const pageTitleMobile: CSSProperties = {
  fontSize: 17
};

const pageSubtitle: CSSProperties = {
  margin: "4px 0 0",
  color: "#bbb",
  fontSize: 13
};

const pageSubtitleMobile: CSSProperties = {
  fontSize: 11
};

const mobileTabs: CSSProperties = {
  display: "flex",
  gap: 8,
  overflowX: "auto",
  paddingBottom: 8,
  marginBottom: 14
};

const mobileTab: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.03)",
  color: "#d8d8d8",
  borderRadius: 999,
  padding: "8px 12px",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 12,
  whiteSpace: "nowrap",
  flexShrink: 0
};

const mobileTabActive: CSSProperties = {
  color: "#1d1300",
  borderColor: "rgba(245,176,0,0.85)",
  background: "linear-gradient(135deg, #ffd57a 0%, #f5b000 100%)",
  boxShadow: "0 8px 18px rgba(245,176,0,0.25)"
};
