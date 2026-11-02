import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";

function StudentLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* Common Student Header */}
      <Header
        title="Student Dashboard"
        userName="Gomagan R"
        userId="71"
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