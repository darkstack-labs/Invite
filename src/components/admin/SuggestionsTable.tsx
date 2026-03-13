export default function SuggestionsTable({ suggestions }: any) {

  return (
    <div style={wrap}>
      <h2 style={title}>Suggestions</h2>

      <table style={{
        width:"100%",
        borderCollapse:"collapse",
        background: "rgba(255,255,255,0.02)",
        borderRadius:12,
        overflow:"hidden",
        border: "1px solid rgba(255,255,255,0.12)"
      }}>

        <thead>
          <tr style={{background:"#1c1c1c"}}>
            <th style={th}>Name</th>
            <th style={th}>Suggestion</th>
          </tr>
        </thead>

        <tbody>

          {suggestions.length === 0 && (
            <tr>
              <td style={emptyTd} colSpan={2}>No suggestions found.</td>
            </tr>
          )}

          {suggestions.map((s:any)=>(
            <tr key={s.id} style={{borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
              <td style={td}>{s.name}</td>
              <td style={td}>{s.suggestion}</td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>

  );

}

const wrap = {
  marginTop: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
  borderRadius: 14,
  padding: 16
};

const title = {
  marginTop: 0,
  marginBottom: 15
};

const th = {
  padding:"14px",
  textAlign:"left" as const,
  color:"#f5b000"
};

const td = {
  padding:"14px"
};

const emptyTd = {
  padding: "20px 14px",
  color: "#aaa",
  textAlign: "center" as const
};
