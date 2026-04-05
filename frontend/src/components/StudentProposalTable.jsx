import StatusBadge from "./StatusBadge";

export default function StudentProposalTable({proposals}){

  return(
    <div className="proposal-table">

      <div className="table-header">
        <h3>Your Submitted Proposals</h3>
      </div>

      <table>

        <thead>
          <tr>
            <th>Thesis Title</th>
            <th>Research Area</th>
            <th>Date Submitted</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>

          {proposals.map((p)=>(
            <tr key={p.id}>

              <td>{p.title}</td>
              <td>{p.area}</td>
              <td>{p.date}</td>
              <td>
                <StatusBadge status={p.status}/>
              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  )
}