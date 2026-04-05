import { useState } from "react";
import Navbar from "../components/Navbar";
import SignaturePad from "../components/SignaturePad";
import "../styles/review.css";

export default function ReviewProposal() {

  const [decision, setDecision] = useState("");
  const [comments, setComments] = useState("");
  const [signature, setSignature] = useState(null);

  const proposal = {
    student: "John Doe",
    title: "Machine Learning Applications in Healthcare Diagnostics",
    area: "Artificial Intelligence",
    date: "Feb 15, 2026",
    file: "#"
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const reviewData = {
      decision,
      comments,
      signature
    };

    console.log(reviewData);

    alert("Review submitted!");
  };

  return (
    <div>

      <Navbar name="Dr. Sarah Johnson" role="Adviser" />

      <div className="review-container">

        <h1>Review Proposal</h1>

        {/* Proposal Info */}
        <div className="proposal-info">

          <h3>Proposal Details</h3>

          <p><strong>Student:</strong> {proposal.student}</p>
          <p><strong>Title:</strong> {proposal.title}</p>
          <p><strong>Research Area:</strong> {proposal.area}</p>
          <p><strong>Date Submitted:</strong> {proposal.date}</p>

          <a className="download-btn" href={proposal.file}>
            Download Proposal
          </a>

        </div>

        {/* Review Form */}
        <form className="review-form" onSubmit={handleSubmit}>

          <h3>Review Decision</h3>

          <div className="decision-buttons">

            <button
              type="button"
              className={decision === "Approved" ? "active approve" : "approve"}
              onClick={() => setDecision("Approved")}
            >
              Approve
            </button>

            <button
              type="button"
              className={decision === "Revision" ? "active revision" : "revision"}
              onClick={() => setDecision("Revision")}
            >
              Request Revision
            </button>

            <button
              type="button"
              className={decision === "Rejected" ? "active reject" : "reject"}
              onClick={() => setDecision("Rejected")}
            >
              Reject
            </button>

          </div>

          {/* Comments */}
          <label>Review Comments</label>

          <textarea
            rows="5"
            placeholder="Write feedback or instructions for the student..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />

          {/* Signature (only if approved) */}
          {decision === "Approved" && (
            <SignaturePad setSignature={setSignature} />
          )}

          <button className="submit-review">
            Submit Review
          </button>

        </form>

      </div>

    </div>
  );
}