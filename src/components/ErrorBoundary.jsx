import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-card__title">Something broke</h1>
          <p className="auth-card__subtitle">The page hit an unexpected error.</p>
          <pre className="error-details">{String(this.state.error?.message || this.state.error)}</pre>
          <button className="btn btn--primary btn--block" onClick={() => window.location.assign("/")}>
            Reload
          </button>
        </div>
      </div>
    );
  }
}
