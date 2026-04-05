export default function Navbar({ name, role }) {

  return (
    <div className="navbar">

      <div className="logo-section">
        <div className="logo">🎓</div>

        <div>
          <h3>Thesis Proposal System</h3>
          <p>Academic Research Portal</p>
        </div>
      </div>

      <div className="user-section">

        <div>
          <strong>{name}</strong>
          <p>{role}</p>
        </div>

        <button className="logout-btn">
          Logout
        </button>

      </div>

    </div>
  );
}