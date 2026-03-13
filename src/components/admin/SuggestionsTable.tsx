export default function SuggestionsTable({ suggestions }: any) {

  return (

    <div style={{ marginTop: 40 }}>

      <h2 style={{ marginBottom: 15 }}>Suggestions</h2>

      <table style={{
        width:"100%",
        borderCollapse:"collapse",
        background:"#161616",
        borderRadius:12,
        overflow:"hidden",
        border:"1px solid #222"
      }}>

        <thead>
          <tr style={{background:"#1c1c1c"}}>
            <th style={th}>Name</th>
            <th style={th}>Suggestion</th>
          </tr>
        </thead>

        <tbody>

          {suggestions.map((s:any)=>(
            <tr key={s.id} style={{borderBottom:"1px solid #222"}}>
              <td style={td}>{s.name}</td>
              <td style={td}>{s.suggestion}</td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>

  );

}

const th = {
  padding:"14px",
  textAlign:"left" as const,
  color:"#f5b000"
};

const td = {
  padding:"14px"
};
