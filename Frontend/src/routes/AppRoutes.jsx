import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login/Login.jsx";
import Dashboard from "../pages/Dashboard/Dashboard.jsx";
import StudentDashboard from "../pages/Student/StudentDashboard.jsx";
import StudentEvent from "../pages/Student/StudentEvent.jsx";
import StudentEventdetails from "../pages/Student/StudentEventdetails.jsx";
import StudentProfile from "../pages/Student/StudentProfile.jsx";
// import StudentLeaderboard from "../pages/Student/StudentLeaderboard.jsx";
import StudentHistory from "../pages/Student/StudentHistory.jsx";
import StudentCertificate from "../pages/Student/StudentCertificate.jsx";
import AlumniDashboard from "../pages/Alumni/AlumniDashboard.jsx";
import AdminDashboard from "../pages/Admin/AdminDashboard.jsx";
import DirectorDashboard from "../pages/Director/DirectorDashboard.jsx";
import EventCreation from "../pages/Admin/CreateEvents.jsx"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />

        <Route path="/directordashboard" element={<DirectorDashboard />} />
        //Admin Routes
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/createevent" element={<EventCreation />} />

        //Alumni Routes
        <Route path="/alumnidashboard" element={<AlumniDashboard />} />

        //Student Routes
        <Route path="/studentdashboard" element={<StudentDashboard />} />
        <Route path="/studentevent" element={<StudentEvent />} />
        <Route path="/studenteventdetails" element={<StudentEventdetails />} />
        <Route path="/studentprofile" element={<StudentProfile />} />
        {/* <Route path="/studentleaderboard" element={<StudentLeaderboard />} /> */}
        <Route path="/studenthistory" element={<StudentHistory />} />
        <Route path="/studentcertificate" element={<StudentCertificate />} />

        
      </Routes>
    </BrowserRouter>
  );
}

export default App;