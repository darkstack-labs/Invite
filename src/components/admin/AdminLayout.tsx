import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0f0f0f",
        color: "#eaeaea",
        fontFamily: "system-ui, sans-serif"
      }}
    >

      {/* Sidebar */}
      <aside
        style={{
          width: 260,
          background: "#111",
          borderRight: "1px solid #222",
          padding: 30
        }}
      >

        <h2
          style={{
            marginBottom: 40,
            color: "#f5b000",
            letterSpacing: 1
          }}
        >
          Admin Panel
        </h2>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20
          }}
        >

          <SidebarItem text="Dashboard" />
          <SidebarItem text="RSVP Manager" />
          <SidebarItem text="Song Requests" />
          <SidebarItem text="Suggestions" />

        </nav>

      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          padding: 40,
          overflowY: "auto"
        }}
      >

        {children}

      </main>

    </div>
  );
}

function SidebarItem({ text }: { text: string }) {
  return (
    <div
      style={{
        color: "#ccc",
        fontSize: 15,
        cursor: "pointer",
        padding: "8px 0"
      }}
    >
      {text}
    </div>
  );
}