export default function SongsTable({ songs }: any) {

  return (

    <div style={{ marginTop: 40 }}>

      <h2 style={{ marginBottom: 15 }}>Song Requests</h2>

      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        background: "#161616",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid #222"
      }}>

        <thead>
          <tr style={{ background: "#1c1c1c" }}>
            <th style={th}>Name</th>
            <th style={th}>Song</th>
            <th style={th}>Artist</th>
          </tr>
        </thead>

        <tbody>

          {songs.map((s:any)=>(
            <tr key={s.id} style={{borderBottom:"1px solid #222"}}>
              <td style={td}>{s.name}</td>
              <td style={td}>{s.songName}</td>
              <td style={td}>{s.artist}</td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>

  );

}

const th = {
  padding: "14px",
  textAlign: "left" as const,
  color: "#f5b000"
};

const td = {
  padding: "14px"
};
