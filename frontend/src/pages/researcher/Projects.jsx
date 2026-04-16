import { useState } from "react";
import { Search, Filter } from "lucide-react";

import Navbar from "../../components/researcher/Navbar";
import Topbar from "../../components/Topbar";

import "../../styles/researcher.css";

export default function ResearchProjects() {
  const [query, setQuery] = useState("");

  return (
    <div className="dashboard-layout">

      <Navbar />

      <div className="main">
        <Topbar title="Research Projects" />

        <div className="content">

          {/* SEARCH BAR */}
          <div className="search-filter-bar">
            <div className="search-left">
              <Search size={18} className="icon" />
              <input
                type="text"
                placeholder="Search by title, department, or leader..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

          </div>

          {/* TABLE */}
          <div className="table-wrapper">
            <h4>Projects (5)</h4>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Project ID</th>
                    <th>Title</th>
                    <th>Department</th>
                    <th>Leader</th>
                    <th>Budget</th>
                    <th>Duration</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  <tr>
                    <td>PRJ-001</td>
                    <td>
                      <strong>Climate Change Impact on Coastal Ecosystems</strong>
                      <div className="sub">Basic Research</div>
                    </td>
                    <td>Environmental Science</td>
                    <td>Dr. Sarah Johnson</td>
                    <td>$450,000</td>
                    <td>24 months</td>
                    <td className="action">View</td>
                  </tr>

                  <tr>
                    <td>PRJ-002</td>
                    <td>
                      <strong>AI-Driven Healthcare Diagnosis System</strong>
                      <div className="sub">Applied Research</div>
                    </td>
                    <td>Computer Science</td>
                    <td>Prof. Michael Chen</td>
                    <td>$320,000</td>
                    <td>18 months</td>
                    <td className="action">View</td>
                  </tr>

                  <tr>
                    <td>PRJ-003</td>
                    <td>
                      <strong>Sustainable Agriculture Practices in Arid Regions</strong>
                      <div className="sub">Applied Research</div>
                    </td>
                    <td>Agriculture</td>
                    <td>Dr. Emily Rodriguez</td>
                    <td>$280,000</td>
                    <td>36 months</td>
                    <td className="action">View</td>
                  </tr>

                  <tr>
                    <td>PRJ-004</td>
                    <td>
                      <strong>Quantum Computing for Cryptography</strong>
                      <div className="sub">Basic Research</div>
                    </td>
                    <td>Physics</td>
                    <td>Dr. James Anderson</td>
                    <td>$580,000</td>
                    <td>30 months</td>
                    <td className="action">View</td>
                  </tr>

                  <tr>
                    <td>PRJ-005</td>
                    <td>
                      <strong>Urban Planning and Smart City Infrastructure</strong>
                      <div className="sub">Development</div>
                    </td>
                    <td>Civil Engineering</td>
                    <td>Prof. Lisa Martinez</td>
                    <td>$750,000</td>
                    <td>48 months</td>
                    <td className="action">View</td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}