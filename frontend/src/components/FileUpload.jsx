import { useState, useEffect } from 'react'
import axios from 'axios'
import './css/FileUpload.css'

export default function FileUpload() {
  const [files, setFiles] = useState([])

  const fetchFiles = async () => {
    const res = await axios.get('http://localhost:5000/api/files')
    setFiles(res.data)
  }

  useEffect(() => { fetchFiles() }, [])

  const handleUpload = async (e) => {
    const formData = new FormData()
    formData.append('file', e.target.files[0])
    await axios.post('http://localhost:5000/api/files/upload', formData)
    fetchFiles()
  }

  const handleSync = async (id) => {
    await axios.put(`http://localhost:5000/api/files/sync/${id}`)
    fetchFiles()
  }

  return (
    <div className="file-upload">
      <h2>📁 File Upload</h2>
      <input type="file" onChange={handleUpload} />
      <ul className="file-list">
        {files.map(f => (
          <li key={f.id}>
            <span>{f.original_name}</span>
            <span className={`status ${f.synced ? 'synced' : 'not-synced'}`}>
              {f.synced ? '✅ Synced' : '❌ Not Synced'}
            </span>
            {!f.synced && (
              <button className="sync-btn" onClick={() => handleSync(f.id)}>
                Sync
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}