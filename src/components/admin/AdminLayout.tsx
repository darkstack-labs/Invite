import React, { ReactNode, useState } from "react";
import { SidebarItemProps } from "../../types/admin";

interface AdminLayoutProps {
  children: ReactNode;
  activeSection?: string;
}

/**
 * AdminLayout - Provides the primary shell for the Admin experience.
 * Features a fixed sidebar and a scrollable main content area.
 */
export default function AdminLayout({ children, activeSection = "Dashboard" }: AdminLayoutProps) {
  return (
    <div style={layoutWrapper}>
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        <div style={logoContainer}>
          <h2 style={brandStyle}>Admin Portal</h2>
          <div style={statusIndicator}>
            <span style={dotStyle} /> Live Firestore
          </div>
        </div>

        <nav style={navStyle}>
          <SidebarItem 
            text="Dashboard" 
            isActive={activeSection === "Dashboard"} 
          />
          <SidebarItem 
            text="RSVP Manager" 
            isActive={activeSection === "RSVP Manager"} 
          />
          <SidebarItem 
            text="Song Requests" 
            isActive={activeSection === "Song Requests"} 
          />
          <SidebarItem 
            text="Suggestions" 
            isActive={activeSection === "Suggestions"} 
          />
        </nav>

        <div style={sidebarFooter}>
          <p style={versionText}>v2.4.0-production</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={mainContentStyle}>
        <div style={contentInner}>
          {children}
        </div>
      </main>
    </div>
  );
}

/* --- Sidebar Item Sub-Component --- */

function SidebarItem({ text, isActive }: SidebarItemProps) {

  const [isHovered, setIsHovered] = useState(false)

  const itemStyle: React.CSSProperties = {
    color: isActive ? "#f5b000" : isHovered ? "#fff" : "#888",
    fontSize: "14px",
    fontWeight: isActive ? 600 : 400,
    cursor: "pointer",
    padding: "10px 16px",
    borderRadius: "8px",
    background: isActive ? "rgba(245, 176, 0, 0.1)" : "transparent",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "10px"
  }

  return (
    <div
      style={itemStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isActive && <div style={activeIndicator} />}
      {text}
    </div>
  )
}

/* --- Styles --- */

const layoutWrapper: React.CSSProperties = {
  display: "flex",
  height: "100vh",
  background: "#0a0a0a", // Deep black background
  color: "#eaeaea",
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  overflow: "hidden"
};

const sidebarStyle: React.CSSProperties = {
  width: "280px",
  background: "#111",
  borderRight: "1px solid #222",
  display: "flex",
  flexDirection: "column",
  padding: "40px 20px",
  overflowY: "auto"
};

const logoContainer: React.CSSProperties = {
  marginBottom: "48px",
  paddingLeft: "16px"
};

const brandStyle: React.CSSProperties = {
  margin: 0,
  color: "#f5b000",
  fontSize: "1.25rem",
  letterSpacing: "-0.5px",
  fontWeight: 700
};

const statusIndicator: React.CSSProperties = {
  fontSize: "11px",
  color: "#555",
  textTransform: "uppercase",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  marginTop: "4px"
};

const dotStyle: React.CSSProperties = {
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  background: "#28a745", // Green for 'live'
  boxShadow: "0 0 8px #28a745"
};

const navStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  flex: 1
};

const activeIndicator: React.CSSProperties = {
  width: "4px",
  height: "16px",
  background: "#f5b000",
  borderRadius: "2px"
};

const mainContentStyle: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "40px",
  background: "linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%)"
};

const contentInner: React.CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto"
};

const sidebarFooter: React.CSSProperties = {
  paddingTop: "20px",
  borderTop: "1px solid #222"
};

const versionText: React.CSSProperties = {
  fontSize: "10px",
  color: "#333",
  textAlign: "center",
  margin: 0
};