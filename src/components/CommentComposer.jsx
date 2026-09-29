import { useState } from "react";

export default function CommentComposer({
  onSubmit,
  placeholder = "Add to the thread…",
  submitLabel = "Reply",
  initialText = "",
  onCancel,
  small = false,
}) {
  const [text, setText] = useState(initialText);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    setError("");
    try {
      await onSubmit(text.trim());
      setText("");
    } catch (err) {
      setError(err?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={`comment-composer ${small ? "comment-composer--small" : ""}`} onSubmit={handleSubmit}>
      <input
        className="comment-composer__input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
      />
      {onCancel && (
        <button type="button" className="link-btn" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      )}
      <button type="submit" className="btn btn--primary btn--small" disabled={busy || !text.trim()}>
        {busy ? "…" : submitLabel}
      </button>
      {error && <p className="form-error">{error}</p>}
    </form>
  );
}
