import { Plus, Mail, Trash2, User } from "lucide-react";

import Navbar from "../../components/researcher/Navbar";
import Topbar from "../../components/Topbar";

import "../../styles/researcher.css";

export default function TeamManagement() {
  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <Navbar />

      {/* MAIN */}
      <div className="main">
        <Topbar title="Team Management" />

        <div className="content">

          {/* HEADER */}
          <div className="page-header team-header">
            <div>
              <h2>Team Management</h2>
              <p>Manage project team members and roles</p>
            </div>

            <button className="btn-primary">
              <Plus size={16} /> Add Team Member
            </button>
          </div>

          {/* TABLE CARD */}
          <div className="table-wrapper">

            <h3>Current Team Members</h3>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {/* ROW */}
                  <tr>
                    <td className="name-cell">
                      <div className="avatar"><User size={16} /></div>
                      Dr. Sarah Johnson
                    </td>

                    <td>
                      <Mail size={14} /> sarah.johnson@university.edu
                    </td>

                    <td>Environmental Science</td>

                    <td>
                      <span className="badge leader">Leader</span>
                    </td>

                    <td className="actions">
                      <span className="edit">Edit</span>
                      <Trash2 size={16} className="delete" />
                    </td>
                  </tr>

                  <tr>
                    <td className="name-cell">
                      <div className="avatar"><User size={16} /></div>
                      Dr. Mark Thompson
                    </td>
                    <td><Mail size={14}/> mark.thompson@university.edu</td>
                    <td>Marine Biology</td>
                    <td><span className="badge coleader">Co-Leader</span></td>
                    <td className="actions">
                      <span className="edit">Edit</span>
                      <Trash2 size={16} className="delete" />
                    </td>
                  </tr>

                  <tr>
                    <td className="name-cell">
                      <div className="avatar"><User size={16} /></div>
                      Dr. Rachel Lee
                    </td>
                    <td><Mail size={14}/> rachel.lee@university.edu</td>
                    <td>Environmental Science</td>
                    <td><span className="badge member">Member</span></td>
                    <td className="actions">
                      <span className="edit">Edit</span>
                      <Trash2 size={16} className="delete" />
                    </td>
                  </tr>

                  <tr>
                    <td className="name-cell">
                      <div className="avatar"><User size={16} /></div>
                      John Davis
                    </td>
                    <td><Mail size={14}/> john.davis@university.edu</td>
                    <td>Data Analytics</td>
                    <td><span className="badge member">Member</span></td>
                    <td className="actions">
                      <span className="edit">Edit</span>
                      <Trash2 size={16} className="delete" />
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>

          {/* STATS */}
          <div className="stats-grid">

            <div className="stat-card">
              <h1>4</h1>
              <p>Total Members</p>
            </div>

            <div className="stat-card">
              <h1>1</h1>
              <p>Project Leaders</p>
            </div>

            <div className="stat-card">
              <h1>3</h1>
              <p>Departments</p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}