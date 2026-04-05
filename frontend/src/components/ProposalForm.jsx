import { useState } from "react";

export default function ProposalForm(){

  const [title,setTitle] = useState("");
  const [area,setArea] = useState("");
  const [problem,setProblem] = useState("");
  const [gap,setGap] = useState("");
  const [file,setFile] = useState(null);

  const handleSubmit = (e)=>{
    e.preventDefault();

    const proposalData = {
      title,
      area,
      problem,
      gap,
      file
    };

    console.log("Proposal submitted:",proposalData);

    alert("Proposal submitted successfully!");

    setTitle("");
    setArea("");
    setProblem ("");
    setGap("");
    setFile(null);
  };

  return(
    <div className="proposal-form">

      <h3>Submit Thesis Proposal</h3>

      <form onSubmit={handleSubmit}>

        <label>Thesis Title</label>
        <input
          type="text"
          placeholder="Enter thesis title"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          required
        />

        <label>Research Area</label>
        <input
          type="text"
          placeholder="Artificial Intelligence / Data Science / etc."
          value={area}
          onChange={(e)=>setArea(e.target.value)}
          required
        />

        <label>Problem Identification</label>
        <input
          type="text"
          placeholder="Write the problem."
          value={problem}
          onChange={(e)=>setProblem(e.target.value)}
          required
        />

        <label>Gap Details</label>
        <input
          type="text"
          placeholder="Artificial Intelligence / Data Science / etc."
          value={gap}
          onChange={(e)=>setGap(e.target.value)}
          required
        />

        <label>Upload Proposal (PDF)</label>
        <input
          type="file"
          accept=".pdf"
          onChange={(e)=>setFile(e.target.files[0])}
          required
        />

        <button className="primary-btn">
          Submit Proposal
        </button>

      </form>

    </div>
  );
}