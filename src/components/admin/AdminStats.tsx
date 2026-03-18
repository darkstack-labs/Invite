import type { CSSProperties } from "react";

type Stats = {
  total: number;
  attending: number;
  veg: number;
  nonVeg: number;
};

export default function AdminStats({ stats }: { stats: Stats }) {
  const cards = [
    {
      title: "Total Guests",
      value: stats.total,
      accent: "#7cc4ff",
      copy: "Live RSVP records"
    },
    {
      title: "Attending",
      value: stats.attending,
      accent: "#49d17d",
      copy: "Confirmed guests"
    },
    {
      title: "Veg Meals",
      value: stats.veg,
      accent: "#b7df74",
      copy: "Vegetarian count"
    },
    {
      title: "Non-Veg Meals",
      value: stats.nonVeg,
      accent: "#ffb05c",
      copy: "Non-veg count"
    }
  ];

  return (
    <section style={wrap}>
      {cards.map((card) => (
        <article
          key={card.title}
          style={{
            ...cardStyle,
            boxShadow: `0 18px 36px ${toShadow(card.accent)}`
          }}
        >
          <span style={cardEyebrow}>{card.title}</span>
          <strong style={{ ...cardValue, color: card.accent }}>{card.value}</strong>
          <p style={cardCopy}>{card.copy}</p>
          <div
            aria-hidden="true"
            style={{
              ...cardGlow,
              background: `linear-gradient(90deg, ${toAlpha(card.accent, 0.9)}, ${toAlpha(card.accent, 0.18)})`
            }}
          />
        </article>
      ))}
    </section>
  );
}

const wrap: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 16,
  marginBottom: 18
};

const cardStyle: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  borderRadius: 18,
  padding: "18px 18px 16px",
  border: "1px solid rgba(255,255,255,0.12)",
  background:
    "linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(18,22,30,0.84) 45%, rgba(7,10,14,0.96) 100%)",
  display: "grid",
  gap: 8,
  minHeight: 148
};

const cardEyebrow: CSSProperties = {
  color: "#9aa3ad",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 1.1,
  fontWeight: 700
};

const cardValue: CSSProperties = {
  fontSize: 34,
  lineHeight: 1,
  fontWeight: 900
};

const cardCopy: CSSProperties = {
  margin: 0,
  color: "#d5dae0",
  fontSize: 13
};

const cardGlow: CSSProperties = {
  width: 88,
  height: 4,
  borderRadius: 999
};

const toAlpha = (hex: string, alpha: number) => {
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const toShadow = (hex: string) => toAlpha(hex, 0.16);
