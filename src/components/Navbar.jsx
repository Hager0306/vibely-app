import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__brand">
          <span className="navbar__brand-mark">Vibely</span>
          <span className="navbar__brand-pulse" />
        </NavLink>

        {isAuthenticated && (
          <nav className="navbar__links">
            <NavLink to="/" end className="navbar__link">
              Feed
            </NavLink>
            <NavLink to="/profile" className="navbar__link">
              Profile
            </NavLink>
          </nav>
        )}

        <div className="navbar__actions">
          {isAuthenticated ? (
            <>
              <Avatar name={user?.name || user?.username || "?"} photo={user?.photo} size={32} />
              <button className="btn btn--ghost btn--small" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn btn--ghost btn--small">
                Log in
              </NavLink>
              <NavLink to="/signup" className="btn btn--primary btn--small">
                Sign up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
