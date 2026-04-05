import Navbar from "../components/Navbar";

function ProposalPage() {
  return (
    <>
      <Navbar role="student" />

      <div className="container">
        <h2>Submit Thesis Proposal</h2>
        <p>Fill in the details below to submit your proposal for review</p>

        <ProposalForm />
      </div>
    </>
  );
}

export default ProposalPage;