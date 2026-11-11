import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login.jsx";
import Dashboard from "../pages/Dashboard/Dashboard.jsx";

import StudentDashboard from "../pages/Student/StudentDashboard.jsx";
import StudentEvent from "../pages/Student/StudentEvent.jsx";
import StudentEventdetails from "../pages/Student/StudentEventdetails.jsx";
import StudentProfile from "../pages/Student/studentProfile.jsx";
// import StudentLeaderboard from "../pages/Student/StudentLeaderboard.jsx";
import StudentHistory from "../pages/Student/StudentHistory.jsx";
import StudentCertificate from "../pages/Student/StudentCertificate.jsx";
import StudentLayout from "../layouts/StudentLayout.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";


import AlumniDashboard from "../pages/Alumni/AlumniDashboard.jsx";
import AdminDashboard from "../pages/Admin/AdminDashboard.jsx";
import DirectorDashboard from "../pages/Director/DirectorDashboard.jsx";
import EventCreation from "../pages/Admin/CreateEvents.jsx";
import Leaderboard from "../pages/Admin/Leaderboard.jsx";
import EventHistory from "../pages/Admin/EventHistory.jsx";
import ManageEvent from "../pages/Admin/EventManage.jsx";
import StudentStatus from "../pages/Admin/StudentStatus.jsx"
import Adminprofile from "../pages/Admin/Adminprofile.jsx"
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />

        <Route path="/directordashboard" element={<DirectorDashboard />} />



        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="createevent" element={<EventCreation />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="eventhistory" element={<EventHistory />} />
          <Route path="manageevent/:eventId" element={<ManageEvent />} />
          <Route path="studentstatus" element={<StudentStatus />} />
          <Route path="profile" element={<Adminprofile />} />
        </Route>



        {/* Alumni Routes */}
        <Route path="/alumnidashboard" element={<AlumniDashboard />} />

        {/* Student Routes */}
        <Route path="/student" element={<StudentLayout />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="event" element={<StudentEvent />} />
          <Route path="eventdetails/:eventId" element={<StudentEventdetails />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="history" element={<StudentHistory />} />
          <Route path="certificate" element={<StudentCertificate />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;