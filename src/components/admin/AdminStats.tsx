import React, { memo } from "react";
import { AdminStatsData } from "../../types/admin";

interface AdminStatsProps {
  stats: AdminStatsData;
}

/**
 * AdminStats - Displays key metrics using a responsive grid.
 * Memoized to prevent re-renders when tables are filtered.
 */
const AdminStats = memo(({ stats }: AdminStatsProps) => {
  return (
    <div style={gridStyle}>
      <StatCard 
        title="Total RSVPs" 
        value={stats.total} 
        subtitle="Total entries received"
        accentColor="#f5b000" 
      />
      <StatCard 
        title="Attending" 
        value={stats.attending} 
        subtitle={
          stats.total === 0
            ? "No RSVPs yet"
            : `${((stats.attending / stats.total) * 100).toFixed(0)}% conversion`
        }
        accentColor="#28a745" 
      />
      <StatCard 
        title="Veg Meals" 
        value={stats.veg} 
        subtitle="Kitchen count"
        accentColor="#81c784" 
      />
      <StatCard 
        title="Non-Veg Meals" 
        value={stats.nonVeg} 
        subtitle="Kitchen count"
        accentColor="#e57373" 
      />
    </div>
  );
});

/* --- Sub-Component --- */

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  accentColor: string;
}

function StatCard({ title, value, subtitle, accentColor }: StatCardProps) {
  return (
    <div style={cardStyle}>
      <div style={{ ...topAccentBar, backgroundColor: accentColor }} />
      
      <p style={titleStyle}>{title}</p>
      
      <div style={valueContainer}>
        <h2 style={{ ...valueStyle, color: accentColor }}>
          {value.toLocaleString()}
        </h2>
      </div>

      <p style={subtitleStyle}>{subtitle}</p>
    </div>
  );
}

/* --- Styled Tokens --- */

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "20px",
  marginBottom: "40px",
};

const cardStyle: React.CSSProperties = {
  background: "#161616",
  borderRadius: "12px",
  padding: "20px 24px",
  border: "1px solid #222",
  boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
  position: "relative",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const topAccentBar: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "3px",
};

const titleStyle: React.CSSProperties = {
  color: "#999",
  fontSize: "0.85rem",
  textTransform: "uppercase",
  letterSpacing: "1px",
  fontWeight: 600,
  margin: "0 0 8px 0",
};

const valueContainer: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: "8px",
};

const valueStyle: React.CSSProperties = {
  fontSize: "2.5rem",
  fontWeight: 700,
  margin: 0,
  lineHeight: 1,
};

const subtitleStyle: React.CSSProperties = {
  color: "#555",
  fontSize: "0.75rem",
  margin: "10px 0 0 0",
  fontWeight: 500,
};

export default AdminStats;