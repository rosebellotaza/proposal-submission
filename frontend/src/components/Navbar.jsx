import { NavLink } from 'react-router-dom'
import './css/Navbar.css'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">📋 Proposal Submission System</div>
      <ul className="navbar-links">
        <li><NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>🏠 Home</NavLink></li>
        <li><NavLink to="/upload" className={({ isActive }) => isActive ? 'active' : ''}>📁 File Upload</NavLink></li>
        <li><NavLink to="/proposal" className={({ isActive }) => isActive ? 'active' : ''}>📝 Proposal</NavLink></li>
      </ul>
    </nav>
  )
}