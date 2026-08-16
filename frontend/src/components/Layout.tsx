import { NavLink, Outlet, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/projects", label: "Projects" },
  { to: "/defects", label: "Defects (all)" },
];

const ADMIN_NAV = [
  { to: "/admin/users", label: "Users" },
  { to: "/admin/roles", label: "Roles & Permissions" },
];

export function Layout() {
  const { user, logout } = useAuth();
  const { projectId } = useParams();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="mark" />
          <span className="name">TestHub</span>
        </div>
        <span className="tag" style={{ padding: "0 10px 14px" }}>
          QA TEST MANAGEMENT
        </span>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            <span className="dot" />
            {item.label}
          </NavLink>
        ))}
        {projectId && (
          <>
            <div className="section-title" style={{ marginTop: 16, padding: "0 10px" }}>
              Current project
            </div>
            <NavLink to={`/projects/${projectId}`} end className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              <span className="dot" />
              Overview
            </NavLink>
            <NavLink to={`/projects/${projectId}/suites`} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              <span className="dot" />
              Test Suites
            </NavLink>
            <NavLink to={`/projects/${projectId}/runs`} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              <span className="dot" />
              Test Runs
            </NavLink>
            <NavLink to={`/projects/${projectId}/defects`} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              <span className="dot" />
              Defects
            </NavLink>
            <NavLink to={`/projects/${projectId}/reports`} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              <span className="dot" />
              Reports
            </NavLink>
          </>
        )}
        {user?.role.name === "Admin" && (
          <>
            <div className="section-title" style={{ marginTop: 16, padding: "0 10px" }}>
              Administration
            </div>
            {ADMIN_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
              >
                <span className="dot" />
                {item.label}
              </NavLink>
            ))}
          </>
        )}
        <div className="sidebar-footer">
          <div style={{ fontWeight: 600, color: "var(--ink)" }}>{user?.name}</div>
          <div>{user?.role.name}</div>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 10, width: "100%" }} onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>
      <div className="main-area">
        <Outlet />
      </div>
    </div>
  );
}
