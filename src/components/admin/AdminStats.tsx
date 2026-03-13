export default function AdminStats({ stats }: any) {

  return (

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
        gap: 25,
        marginBottom: 40
      }}
    >

      <StatCard title="Total Guests" value={stats.total} accent="#7aa2ff" />
      <StatCard title="Attending" value={stats.attending} accent="#2ecc71" />
      <StatCard title="Veg Meals" value={stats.veg} accent="#9ccc65" />
      <StatCard title="Non-Veg Meals" value={stats.nonVeg} accent="#ffb74d" />

    </div>

  );
}

function StatCard({ title, value, accent }: any) {

  return (

    <div
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
        borderRadius: 12,
        padding: 25,
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
      }}
    >

      <p
        style={{
          color: "#aaa",
          fontSize: 14,
          marginBottom: 10
        }}
      >
        {title}
      </p>

      <h2
        style={{
          fontSize: 30,
          color: accent ?? "#f5b000",
          margin: 0
        }}
      >
        {value}
      </h2>

    </div>

  );
}
