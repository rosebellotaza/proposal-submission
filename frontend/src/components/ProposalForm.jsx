import { useState, useRef } from 'react'
import axios from 'axios'
import SignatureCanvas from 'react-signature-canvas'
import './css/ProposalForm.css'

export default function ProposalForm() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const sigRef = useRef()

  const handleSubmit = async () => {
    if (!title || !content) return alert('Please fill in all fields!')
    const signature = sigRef.current.toDataURL()
    await axios.post('http://localhost:5000/api/proposals', { title, content, signature })
    alert('✅ Proposal saved!')
    setTitle('')
    setContent('')
    sigRef.current.clear()
  }

  return (
    <div className="proposal-form">
      <h2>📝 Write Proposal</h2>
      <input
        placeholder="Proposal Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Proposal Content"
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={6}
      />
      <h4>✍️ Signature</h4>
      <SignatureCanvas
        ref={sigRef}
        canvasProps={{ width: 500, height: 150, className: 'signature-box' }}
      />
      <div className="form-buttons">
        <button className="clear-btn" onClick={() => sigRef.current.clear()}>Clear</button>
        <button className="submit-btn" onClick={handleSubmit}>Submit Proposal</button>
      </div>
    </div>
  )
}