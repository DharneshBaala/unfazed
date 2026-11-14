import "./ClientLayout.css";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  UserRound,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ClientLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };


  const navigationItems = [
    {
      name: "My Portal",
      path: "/client/portal",
      icon: LayoutDashboard, 
    },
    
  
    {
      name: "Appointments",
      path: "/client/appointments",
      icon: CalendarDays,
    },
    {
      name: "My Profile",
      path: "/client/profile",
      icon: UserRound,
    },
  ];

  return (
    <div className="client-layout">
      <aside className="client-sidebar">
        <div className="client-brand">
          Unfazed<span>.</span>
        </div>

        <p className="client-sidebar-label">MY SPACE</p>

        <nav className="client-navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `client-nav-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="client-sidebar-bottom">
          <div className="client-user">
            <div className="client-avatar">
              {user?.name?.charAt(0).toUpperCase() || "C"}
            </div>

            <div className="client-user-info">
              <strong>{user?.name || "Client"}</strong>
              <span>Client</span>
            </div>
          </div>

          <button
            className="client-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="client-main">
        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout;