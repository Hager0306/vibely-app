import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as authApi from "../api/auth";
import { extractErrorMessage, unwrapToken } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: "", password: "", rePassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.rePassword) {
      setError("New password and confirmation don't match");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const res = await authApi.changePassword(form);
      const newToken = unwrapToken(res);
      if (newToken) login(newToken);
      setSuccess(true);
      setTimeout(() => navigate("/profile"), 1200);
    } catch (err) {
      setError(extractErrorMessage(err, "Sorry, we couldn't change your password"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card__title">Change password</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field">
            <span>Current password</span>
            <input
              type="password"
              value={form.currentPassword}
              onChange={update("currentPassword")}
              required
            />
          </label>

          <label className="field">
            <span>New password</span>
            <input
              type="password"
              value={form.password}
              onChange={update("password")}
              minLength={4}
              required
            />
          </label>

          <label className="field">
            <span>Confirm new password</span>
            <input
              type="password"
              value={form.rePassword}
              onChange={update("rePassword")}
              required
            />
          </label>

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">Password changed successfully ✅</p>}

          <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
