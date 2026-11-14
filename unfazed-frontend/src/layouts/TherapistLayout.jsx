
import "./TherapistLayout.css";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ChartNoAxesCombined,
  NotebookPen,
  UserRound,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const TherapistLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/therapist/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Clients",
      path: "/therapist/clients",
      icon: Users,
    },
    {
      name: "Schedule",
      path: "/therapist/schedule",
      icon: CalendarDays,
    },
    {
      name: "Analytics",
      path: "/therapist/analytics",
      icon: ChartNoAxesCombined,
    },
    {
      name: "Notes",
      path: "/therapist/notes",
      icon: NotebookPen,
    },
    {
      name: "Profile",
      path: "/therapist/profile",
      icon: UserRound,
    },
  ];

  return (
    <div className="therapist-layout">
      <aside className="therapist-sidebar">
        <div className="therapist-brand">
          Unfazed<span>.</span>
        </div>

        <p className="therapist-sidebar-label">WORKSPACE</p>

        <nav className="therapist-navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `therapist-nav-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="therapist-sidebar-bottom">
          <div className="therapist-user">
            <div className="therapist-avatar">
              {user?.name?.charAt(0).toUpperCase() || "T"}
            </div>

            <div className="therapist-user-info">
              <strong>{user?.name || "Therapist"}</strong>
              <span>Therapist</span>
            </div>
          </div>

          <button
            className="therapist-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="therapist-main">
        <Outlet />
      </main>
    </div>
  );
};

export default TherapistLayout;
