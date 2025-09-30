import { Outlet, NavLink, useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/campaigns", label: "Campaigns", icon: "✉️" },
  { to: "/templates", label: "Templates", icon: "🧩" },
  { to: "/users", label: "Users", icon: "👥" },
  { to: "/reports", label: "Reports", icon: "📑" },
  { to: "/training", label: "Training", icon: "🎓" },
  { to: "/analytics", label: "Analytics", icon: "📈" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Layout() {
  const loc = useLocation();
  const nav = useNavigate();
  const { user, profile, loading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

   const handleLogout = async () => {
      try {
        setLoggingOut(true);
        const { error } = await supabase.auth.signOut();   // clears local session
        if (error) throw error;

        // Safety: also nuke any stale sb-* tokens (rare, but avoids “sticky” sessions)
        Object.keys(localStorage)
          .filter(k => k.startsWith("sb-"))
          .forEach(k => localStorage.removeItem(k));

        nav("/login", { replace: true });
      } catch (e) {
        console.error(e);
        alert(e.message || "Logout failed");
      } finally {
        setLoggingOut(false);
      }
    };

  return (
    <div className="drawer lg:drawer-open min-h-screen">
      <input id="nav-drawer" type="checkbox" className="drawer-toggle" />

      {/* Main */}
      <div className="drawer-content flex flex-col">
        {/* Topbar */}
        <div className="navbar bg-base-100 border-b sticky top-0 z-20">
          <div className="flex-none lg:hidden">
            <label htmlFor="nav-drawer" className="btn btn-ghost btn-square">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </label>
          </div>
          <div className="flex-1">
            <span className="text-xl font-bold">Security Awareness Admin</span>
          </div>
          
          <div className="flex-none">
            <ThemeToggle />
            {user ? (
                    <>
                      <span className="text-sm opacity-70">{profile?.full_name || user.email}</span>
                      <button className="btn btn-sm" onClick={handleLogout} disabled={loggingOut}>
                        {loggingOut ? "Logging out…" : "Logout"}
                      </button>
                    </>
                  ) : (
                    <Link to="/login" className="btn btn-sm">Login</Link>
                  )}
          </div>
        </div>

        {/* Routed content */}
        <main className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet key={loc.pathname} />
          </div>
        </main>
      </div>

      {/* Sidebar */}
      <div className="drawer-side">
        <label htmlFor="nav-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <aside className="menu p-4 w-72 min-h-full bg-base-100 border-r">
          <div className="px-2 py-3">
            <h2 className="text-sm font-semibold uppercase opacity-70">Navigation</h2>
          </div>
          <ul className="menu">
            {navItems.map((n) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  className={({ isActive }) =>
                    `flex items-center ${isActive ? "active font-semibold" : ""}`
                  }
                >
                  <span className="mr-2">{n.icon}</span>
                  {n.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </aside>
      </div>
      <label htmlFor="nav-drawer" aria-label="close sidebar" className="drawer-overlay lg:hidden"></label>
    </div>
    
  );
}
