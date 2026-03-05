import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import UploadPage from './pages/UploadPage'
import ProposalPage from './pages/ProposalPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/proposal" element={<ProposalPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App