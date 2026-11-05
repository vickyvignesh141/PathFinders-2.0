import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";

function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header
        role="admin"
        userName={localStorage.getItem("name")}
        userRole={localStorage.getItem("username")}
      />
      <div className="flex flex-1">

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

    </div>
  );
}

export default AdminLayout;