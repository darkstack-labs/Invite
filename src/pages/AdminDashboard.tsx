import { useState } from "react";

import AdminLayout from "../components/admin/AdminLayout";
import AdminStats from "../components/admin/AdminStats";
import RSVPTable from "../components/admin/RSPVTable";
import SongsTable from "../components/admin/SongsTable";
import SuggestionsTable from "../components/admin/SuggestionsTable";

import useRSVPs from "../hooks/useRSPVs";
import useSongs from "../hooks/useSongs";
import useSuggestions from "../hooks/useSuggestions";

export default function AdminDashboard() {

  const rsvps = useRSVPs();
  const songs = useSongs();
  const suggestions = useSuggestions();

  const [search, setSearch] = useState("");

  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const ADMIN_PASSWORD = "randiokimehfil";

  if (!authenticated) {

    return (

      <div style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f0f0f"
      }}>

        <div style={{
          background: "#161616",
          padding: 40,
          borderRadius: 10,
          width: 320,
          color: "#fff",
          textAlign: "center"
        }}>

          <h2 style={{marginBottom:20}}>Admin Login</h2>

          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            style={{
              width:"100%",
              padding:10,
              marginBottom:20,
              borderRadius:6,
              border:"1px solid #333",
              background:"#111",
              color:"#fff"
            }}
          />

          <button
            style={{
              width:"100%",
              padding:10,
              borderRadius:6,
              border:"none",
              background:"#f5b000",
              color:"#111",
              fontWeight:600,
              cursor:"pointer"
            }}
            onClick={()=>{

              if(password===ADMIN_PASSWORD){
                setAuthenticated(true);
              } else {
                alert("Incorrect password");
              }

            }}
          >
            Login
          </button>

        </div>

      </div>

    );
  }

  const filteredGuests =
    rsvps.filter((g:any)=>
      (g.name || "").toLowerCase().includes(search.toLowerCase())
    );

  const stats = {
    total: rsvps.length,
    attending: rsvps.filter((r:any)=>r.attending).length,
    veg: rsvps.filter((r:any)=>r.mealPreference==="veg").length,
    nonVeg: rsvps.filter((r:any)=>r.mealPreference==="nonveg").length
  };

  return (

    <AdminLayout>

      <AdminStats stats={stats} />

      <div style={{marginBottom:30}}>

        <input
          placeholder="Search guest..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          style={{
            padding:10,
            width:300,
            borderRadius:6,
            border:"1px solid #ccc"
          }}
        />

      </div>

      <RSVPTable guests={filteredGuests} />

      <SongsTable songs={songs} />

      <SuggestionsTable suggestions={suggestions} />

    </AdminLayout>

  );

}