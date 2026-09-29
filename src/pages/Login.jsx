import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as authApi from "../api/auth";
import { extractErrorMessage, unwrapObject, unwrapToken } from "../api/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.justRegistered) {
      setNotice("Account created — log in to continue.");
    }
  }, [location.state]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      // Confirmed: this API signs in by email + password only.
      const res = await authApi.signin({ email: email.trim().toLowerCase(), password });
      const token = unwrapToken(res);
      const user = unwrapObject(res, ["user"]);
      login(token, user);
      const dest = location.state?.from?.pathname || "/";
      navigate(dest, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, "Incorrect email or password"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card__title">Welcome back</h1>
        <p className="auth-card__subtitle">Your feed missed you.</p>

        {notice && <p className="form-success" style={{ marginBottom: 14 }}>{notice}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field">
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>

          <label className="field">
            <span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="auth-card__footer">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
