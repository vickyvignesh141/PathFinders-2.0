import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";

function StudentLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* Common Student Header */}
      <Header
        role={localStorage.getItem("role")}
        userName={localStorage.getItem("name")}
        userRole={localStorage.getItem("username")}
      />

      {/* Student Pages */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Common Student Footer */}

    </div>
  );
}

export default StudentLayout;