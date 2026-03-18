import { ReactNode, useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  Activity,
  BadgeCheck,
  Disc3,
  Gamepad2,
  LayoutDashboard,
  LogOut,
  Menu,
  MonitorSmartphone,
  ShieldAlert,
  Sparkles,
  Users
} from "lucide-react";

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

type StatusItem = {
  label: string;
  value: string;
};

interface AdminLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  title: string;
  subtitle: string;
  onLogout: () => void;
  statusItems?: StatusItem[];
}

const navMeta: Record<
  Section,
  {
    icon: typeof LayoutDashboard;
    eyebrow: string;
    copy: string;
  }
> = {
  overview: {
    icon: LayoutDashboard,
    eyebrow: "Command center",
    copy: "High-signal event health, moderation heat, and live platform readiness."
  },
  rsvps: {
    icon: Users,
    eyebrow: "Guest ops",
    copy: "Attendance cleanup, meal corrections, and RSVP oversight."
  },
  songs: {
    icon: Disc3,
    eyebrow: "Music queue",
    copy: "Playlist moderation with faster request handling across both devices."
  },
  suggestions: {
    icon: Sparkles,
    eyebrow: "Feedback inbox",
    copy: "Review guest ideas, notes, and request quality in one focused surface."
  },
  activity: {
    icon: Activity,
    eyebrow: "Live telemetry",
    copy: "Moderation actions, account behavior, and event stream visibility."
  },
  device_watch: {
    icon: MonitorSmartphone,
    eyebrow: "Device risk",
    copy: "Monitor suspicious overlap, manual device blocks, and account spread."
  },
  games: {
    icon: Gamepad2,
    eyebrow: "Vote intelligence",
    copy: "Charts, drilldowns, exports, and participation analysis for game results."
  },
  games_monitor: {
    icon: ShieldAlert,
    eyebrow: "Governance",
    copy: "Admin access, audit control, archive mode, and result finalization."
  }
};

export default function AdminLayout({
  children,
  navItems,
  activeSection,
  onSectionChange,
  title,
  subtitle,
  onLogout,
  statusItems = []
}: AdminLayoutProps) {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const onResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) setOpenSidebar(false);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const selectSection = (section: Section) => {
    onSectionChange(section);
    setOpenSidebar(false);
  };

  const currentMeta = navMeta[activeSection];
  const CurrentIcon = currentMeta.icon;
  const formattedTime = useMemo(
    () =>
      now.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      }),
    [now]
  );

  return (
    <div style={{ ...shell, ...(isDesktop ? {} : shellMobile) }}>
      <div style={ambientGlowTop} aria-hidden="true" />
      <div style={ambientGlowBottom} aria-hidden="true" />

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
        <div style={sidebarHeader}>
          <div style={brandMark}>
            <Sparkles size={16} />
          </div>
          <div style={{ display: "grid", gap: 4 }}>
            <span style={brandEyebrow}>Invite Ops</span>
            <h2 style={brand}>Admin Command</h2>
          </div>
        </div>

        <div style={sidebarLeadCard}>
          <span style={sidebarLeadLabel}>{currentMeta.eyebrow}</span>
          <div style={sidebarLeadTitleRow}>
            <CurrentIcon size={18} />
            <strong style={sidebarLeadTitle}>{title}</strong>
          </div>
          <p style={sidebarLeadCopy}>{currentMeta.copy}</p>
        </div>

        <div style={sidebarUtilityGrid}>
          <div style={utilityCard}>
            <span style={utilityLabel}>Live Sync</span>
            <strong style={utilityValue}>Firestore</strong>
          </div>
          <div style={utilityCard}>
            <span style={utilityLabel}>Local Time</span>
            <strong style={utilityValue}>{formattedTime}</strong>
          </div>
        </div>

        <nav style={nav}>
          {navItems.map((item) => {
            const itemMeta = navMeta[item.key];
            const ItemIcon = itemMeta.icon;
            const isActive = activeSection === item.key;

            return (
              <button
                key={item.key}
                onClick={() => selectSection(item.key)}
                style={{
                  ...navItem,
                  ...(isActive ? navItemActive : {})
                }}
              >
                <span style={navIconWrap(isActive)}>
                  <ItemIcon size={16} />
                </span>
                <span style={navTextWrap}>
                  <span style={navLabel}>{item.label}</span>
                  <span style={navCopy}>{itemMeta.eyebrow}</span>
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main style={{ ...content, ...(isDesktop ? contentDesktop : contentMobile) }}>
        <header style={{ ...topBar, ...(isDesktop ? {} : topBarMobile) }}>
          <div style={heroIntro}>
            <span style={heroEyebrow}>{currentMeta.eyebrow}</span>
            <div style={heroTitleRow}>
              <span style={heroIconWrap}>
                <CurrentIcon size={18} />
              </span>
              <div>
                <h1 style={{ ...pageTitle, ...(isDesktop ? {} : pageTitleMobile) }}>{title}</h1>
                <p style={{ ...pageSubtitle, ...(isDesktop ? {} : pageSubtitleMobile) }}>{subtitle}</p>
              </div>
            </div>
          </div>

          <div style={{ ...topActions, ...(isDesktop ? {} : topActionsMobile) }}>
            <div style={headerMetaWrap}>
              <div style={headerMetaCard}>
                <span style={headerMetaLabel}>Last Refresh</span>
                <strong style={headerMetaValue}>{formattedTime}</strong>
              </div>
            </div>

            <button
              onClick={() => setOpenSidebar(true)}
              style={{
                ...menuButton,
                ...(isDesktop ? menuButtonHidden : {}),
                ...(isDesktop ? {} : menuButtonMobile)
              }}
              aria-label="Open sidebar"
            >
              <Menu size={14} />
              Sections
            </button>

            <button onClick={onLogout} style={{ ...logoutBtn, ...(isDesktop ? {} : logoutBtnMobile) }}>
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </header>

        {statusItems.length > 0 && (
          <section style={statusStrip} aria-label="Admin status summary">
            {statusItems.map((item) => (
              <article key={item.label} style={statusCard}>
                <span style={statusLabel}>{item.label}</span>
                <strong style={statusValue}>{item.value}</strong>
              </article>
            ))}
          </section>
        )}

        {!isDesktop && (
          <nav style={mobileTabs} aria-label="Admin sections">
            {navItems.map((item) => {
              const ItemIcon = navMeta[item.key].icon;
              const isActive = activeSection === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => selectSection(item.key)}
                  style={{
                    ...mobileTab,
                    ...(isActive ? mobileTabActive : {})
                  }}
                >
                  <ItemIcon size={13} />
                  {item.label}
                </button>
              );
            })}
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
  background:
    "radial-gradient(circle at 10% 10%, rgba(255,213,122,0.1) 0%, rgba(255,213,122,0) 28%), radial-gradient(circle at 100% 0%, rgba(124,196,255,0.14) 0%, rgba(124,196,255,0) 30%), linear-gradient(180deg, #090b0f 0%, #0c1016 35%, #090a0e 100%)",
  color: "#f5f5f5",
  fontFamily: "\"Segoe UI\", system-ui, sans-serif",
  position: "relative",
  overflow: "hidden"
};

const shellMobile: CSSProperties = {
  flexDirection: "column"
};

const ambientGlowTop: CSSProperties = {
  position: "fixed",
  top: -140,
  right: -100,
  width: 360,
  height: 360,
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(255,213,122,0.16) 0%, rgba(255,213,122,0) 72%)",
  pointerEvents: "none",
  filter: "blur(8px)"
};

const ambientGlowBottom: CSSProperties = {
  position: "fixed",
  bottom: -180,
  left: -120,
  width: 420,
  height: 420,
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(124,196,255,0.12) 0%, rgba(124,196,255,0) 72%)",
  pointerEvents: "none",
  filter: "blur(10px)"
};

const overlay: CSSProperties = {
  position: "fixed",
  inset: 0,
  border: "none",
  background: "rgba(3,5,8,0.68)",
  zIndex: 30
};

const sidebar: CSSProperties = {
  width: 290,
  padding: 22,
  borderRight: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(8,10,14,0.88)",
  backdropFilter: "blur(14px)",
  position: "fixed",
  top: 0,
  left: 0,
  bottom: 0,
  transform: "translateX(-100%)",
  transition: "transform 220ms ease",
  zIndex: 40,
  display: "grid",
  alignContent: "start",
  gap: 18,
  boxShadow: "24px 0 60px rgba(0,0,0,0.24)"
};

const sidebarOpen: CSSProperties = {
  transform: "translateX(0)"
};

const sidebarDesktop: CSSProperties = {
  transform: "translateX(0)",
  zIndex: 10
};

const sidebarHeader: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12
};

const brandMark: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 12,
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(135deg, rgba(255,213,122,0.94) 0%, rgba(245,176,0,0.9) 100%)",
  color: "#1b1203",
  boxShadow: "0 14px 30px rgba(245,176,0,0.25)"
};

const brandEyebrow: CSSProperties = {
  color: "#8b96a1",
  fontSize: 10,
  letterSpacing: 1.2,
  textTransform: "uppercase",
  fontWeight: 700
};

const brand: CSSProperties = {
  margin: 0,
  color: "#fff7df",
  letterSpacing: 0.2,
  fontSize: 21
};

const sidebarLeadCard: CSSProperties = {
  border: "1px solid rgba(255,213,122,0.16)",
  borderRadius: 18,
  padding: "14px 15px",
  background:
    "linear-gradient(145deg, rgba(255,213,122,0.12) 0%, rgba(255,255,255,0.03) 42%, rgba(12,16,22,0.9) 100%)",
  display: "grid",
  gap: 10
};

const sidebarLeadLabel: CSSProperties = {
  color: "#f5c768",
  fontSize: 10,
  letterSpacing: 1.1,
  textTransform: "uppercase",
  fontWeight: 800
};

const sidebarLeadTitleRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  color: "#fff"
};

const sidebarLeadTitle: CSSProperties = {
  fontSize: 16
};

const sidebarLeadCopy: CSSProperties = {
  margin: 0,
  color: "#afbac4",
  fontSize: 12,
  lineHeight: 1.55
};

const sidebarUtilityGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10
};

const utilityCard: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  padding: "11px 12px",
  background: "rgba(255,255,255,0.025)",
  display: "grid",
  gap: 6
};

const utilityLabel: CSSProperties = {
  color: "#8f99a4",
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: 0.8
};

const utilityValue: CSSProperties = {
  color: "#eef2f7",
  fontSize: 13,
  lineHeight: 1.3
};

const nav: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10
};

const navItem: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.02)",
  color: "#ddd",
  borderRadius: 14,
  textAlign: "left",
  padding: "12px 13px",
  cursor: "pointer",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: 12,
  transition: "transform 180ms ease"
};

const navItemActive: CSSProperties = {
  background: "linear-gradient(90deg, rgba(255,213,122,0.2), rgba(124,196,255,0.08))",
  borderColor: "rgba(255,213,122,0.34)",
  color: "#fff7df",
  boxShadow: "0 16px 28px rgba(0,0,0,0.18)"
};

const navIconWrap = (active: boolean): CSSProperties => ({
  width: 34,
  height: 34,
  borderRadius: 12,
  display: "grid",
  placeItems: "center",
  background: active ? "rgba(255,213,122,0.16)" : "rgba(255,255,255,0.05)",
  color: active ? "#ffd57a" : "#c9d0d8",
  flexShrink: 0
});

const navTextWrap: CSSProperties = {
  display: "grid",
  gap: 2,
  minWidth: 0
};

const navLabel: CSSProperties = {
  fontSize: 13,
  fontWeight: 800
};

const navCopy: CSSProperties = {
  fontSize: 11,
  color: "#8b95a0"
};

const content: CSSProperties = {
  width: "100%",
  padding: 20,
  minWidth: 0,
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
  position: "relative",
  zIndex: 1
};

const contentMobile: CSSProperties = {
  padding: 10,
  maxWidth: "100%"
};

const contentDesktop: CSSProperties = {
  marginLeft: 290
};

const topBar: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 14,
  padding: "16px 18px",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 18,
  background: "rgba(11,14,20,0.64)",
  backdropFilter: "blur(14px)",
  boxShadow: "0 22px 40px rgba(0,0,0,0.2)"
};

const topBarMobile: CSSProperties = {
  position: "sticky",
  top: 10,
  zIndex: 20,
  marginBottom: 10,
  padding: "12px 12px 11px",
  borderRadius: 16,
  alignItems: "flex-start",
  flexDirection: "column",
  gap: 10
};

const heroIntro: CSSProperties = {
  display: "grid",
  gap: 8,
  minWidth: 0
};

const heroEyebrow: CSSProperties = {
  color: "#f5c768",
  fontSize: 10,
  letterSpacing: 1.1,
  textTransform: "uppercase",
  fontWeight: 800
};

const heroTitleRow: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12
};

const heroIconWrap: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 12,
  background: "rgba(255,255,255,0.05)",
  color: "#fff2cf",
  display: "grid",
  placeItems: "center",
  flexShrink: 0
};

const topActions: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10
};

const topActionsMobile: CSSProperties = {
  width: "100%",
  justifyContent: "space-between",
  gap: 8,
  flexWrap: "wrap"
};

const headerMetaWrap: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10
};

const headerMetaCard: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  padding: "8px 11px",
  background: "rgba(255,255,255,0.03)",
  display: "grid",
  gap: 3
};

const headerMetaLabel: CSSProperties = {
  color: "#919aa4",
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: 0.8
};

const headerMetaValue: CSSProperties = {
  color: "#f4f7fb",
  fontSize: 12
};

const menuButton: CSSProperties = {
  padding: "9px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.03)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  gap: 8
};

const menuButtonHidden: CSSProperties = {
  display: "none"
};

const menuButtonMobile: CSSProperties = {
  padding: "8px 10px",
  fontSize: 11,
  borderColor: "rgba(245,176,0,0.4)",
  color: "#ffd57a"
};

const logoutBtn: CSSProperties = {
  padding: "9px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,77,79,0.22)",
  background: "rgba(255,77,79,0.16)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 800,
  display: "inline-flex",
  alignItems: "center",
  gap: 8
};

const logoutBtnMobile: CSSProperties = {
  padding: "8px 10px",
  fontSize: 11,
  borderRadius: 10
};

const pageTitle: CSSProperties = {
  margin: 0,
  fontSize: 24,
  color: "#fff9e8",
  lineHeight: 1.05
};

const pageTitleMobile: CSSProperties = {
  fontSize: 17
};

const pageSubtitle: CSSProperties = {
  margin: "5px 0 0",
  color: "#b2bbc5",
  fontSize: 13,
  lineHeight: 1.45
};

const pageSubtitleMobile: CSSProperties = {
  fontSize: 11
};

const statusStrip: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
  gap: 10,
  marginBottom: 14
};

const statusCard: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: "12px 14px",
  background: "rgba(255,255,255,0.03)",
  display: "grid",
  gap: 6
};

const statusLabel: CSSProperties = {
  color: "#95a0ab",
  fontSize: 10,
  letterSpacing: 0.8,
  textTransform: "uppercase"
};

const statusValue: CSSProperties = {
  color: "#f4f7fb",
  fontSize: 15,
  lineHeight: 1.2
};

const mobileTabs: CSSProperties = {
  display: "flex",
  gap: 8,
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
  paddingBottom: 8,
  marginBottom: 12
};

const mobileTab: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
  color: "#d8d8d8",
  borderRadius: 999,
  padding: "9px 13px",
  cursor: "pointer",
  fontWeight: 800,
  fontSize: 12,
  whiteSpace: "nowrap",
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  gap: 6
};

const mobileTabActive: CSSProperties = {
  color: "#1d1300",
  borderColor: "rgba(245,176,0,0.85)",
  background: "linear-gradient(135deg, #ffd57a 0%, #f5b000 100%)",
  boxShadow: "0 8px 18px rgba(245,176,0,0.25)"
};
