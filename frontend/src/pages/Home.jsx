import { useNavigate } from 'react-router-dom'
import './css/Home.css'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="home">
      <div className="home-hero">
        <h1>Welcome to the Proposal Submission System</h1>
        <p>Upload your files, write proposals, and sign them digitally — all in one place.</p>
      </div>
      <div className="home-cards">
        <div className="card" onClick={() => navigate('/upload')}>
          <span className="card-icon">📁</span>
          <h3>File Upload</h3>
          <p>Upload and sync your files securely.</p>
        </div>
        <div className="card" onClick={() => navigate('/proposal')}>
          <span className="card-icon">📝</span>
          <h3>Write Proposal</h3>
          <p>Create proposals and add your signature</p>
        </div>
      </div>
    </div>
  )
}