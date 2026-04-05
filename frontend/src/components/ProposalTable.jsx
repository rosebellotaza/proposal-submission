import StatusBadge from "./StatusBadge";
import { useNavigate } from "react-router-dom";

export default function ProposalTable({ proposals }) {

  const navigate = useNavigate();

  const handleReview = (id) => {
    navigate(`/review/${id}`);
  };

  return (
    <div className="proposal-table">

      <div className="table-header">

        <div>
          <h3>Student Proposals</h3>
          <p>{proposals.length} proposals found</p>
        </div>

        <input
          className="search"
          placeholder="Search proposals..."
        />

      </div>

      <table>

        <thead>
          <tr>
            <th>Student Name</th>
            <th>Thesis Title</th>
            <th>Research Area</th>
            <th>Date Submitted</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {proposals.map((p) => (

            <tr key={p.id}>

              <td>{p.student}</td>
              <td>{p.title}</td>
              <td>{p.area}</td>
              <td>{p.date}</td>

              <td>
                <StatusBadge status={p.status}/>
              </td>

              <td>
                <button
                  className="review-btn"
                  onClick={() => handleReview(p.id)}
                >
                  👁 Review
                </button>
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}