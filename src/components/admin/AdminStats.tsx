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

      <StatCard title="Total Guests" value={stats.total} />
      <StatCard title="Attending" value={stats.attending} />
      <StatCard title="Veg Meals" value={stats.veg} />
      <StatCard title="Non-Veg Meals" value={stats.nonVeg} />

    </div>

  );
}

function StatCard({ title, value }: any) {

  return (

    <div
      style={{
        background: "#161616",
        borderRadius: 12,
        padding: 25,
        border: "1px solid #222",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
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
          color: "#f5b000",
          margin: 0
        }}
      >
        {value}
      </h2>

    </div>

  );
}