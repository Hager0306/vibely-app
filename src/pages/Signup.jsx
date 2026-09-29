import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as authApi from "../api/auth";
import { extractErrorMessage } from "../api/client";

const initialForm = {
  name: "",
  username: "",
  email: "",
  password: "",
  rePassword: "",
  dateOfBirth: "",
  gender: "male",
};

// Confirmed rules from a working reference build against this same API.
const MAX_BIRTH_DATE = new Date(Date.now() - 20 * 365.25 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10); // must be at least 20 years old

export default function Signup() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.rePassword) {
      setError("Password and confirmation don't match");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await authApi.signup(form);
      // Signup only creates the account — it doesn't return a token, so
      // the next step is always a separate login.
      navigate("/login", { state: { justRegistered: true } });
    } catch (err) {
      setError(extractErrorMessage(err, "Sorry, we couldn't create your account"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card__title">Join Vibely</h1>
        <p className="auth-card__subtitle">Say something worth repeating.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field">
            <span>Name</span>
            <input
              value={form.name}
              onChange={update("name")}
              minLength={3}
              maxLength={10}
              title="3-10 characters"
              required
            />
          </label>

          <label className="field">
            <span>Username</span>
            <input
              value={form.username}
              onChange={update("username")}
              pattern="[a-z0-9_]{3,30}"
              title="3-30 characters: lowercase letters, numbers, and underscores only"
              placeholder="e.g. hager_112"
              required
            />
            <small className="field__hint">
              3-30 characters: lowercase letters, numbers, underscores only
            </small>
          </label>

          <label className="field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={update("email")} required />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Date of birth</span>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={update("dateOfBirth")}
                max={MAX_BIRTH_DATE}
                title="Must be at least 20 years old"
                required
              />
            </label>

            <label className="field">
              <span>Gender</span>
              <select value={form.gender} onChange={update("gender")} required>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
          </div>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={update("password")}
              minLength={4}
              title="At least 4 characters"
              required
            />
          </label>

          <label className="field">
            <span>Confirm password</span>
            <input
              type="password"
              value={form.rePassword}
              onChange={update("rePassword")}
              required
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
            {busy ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="auth-card__footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
