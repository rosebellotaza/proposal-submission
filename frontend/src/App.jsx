import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import StudentDashboard from "./pages/StudentDashboard";
import AdviserDashboard from "./pages/AdviserDashboard";
import SubmitProposal from "./pages/SubmitProposal";
import ReviewProposal from "./pages/ReviewProposal";


function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/adviser-dashboard" element={<AdviserDashboard />} />

        <Route path="/submit-proposal" element={<SubmitProposal />} />
        <Route path="/review/:id" element={<ReviewProposal />} />

      </Routes>
    </Router>
  );
}

export default App;