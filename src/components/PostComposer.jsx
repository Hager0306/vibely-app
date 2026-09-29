import { useRef, useState } from "react";

export default function PostComposer({
  initialBody = "",
  submitLabel = "Post",
  placeholder = "Share your vibe...",
  onSubmit,
  onCancel,
}) {
  const [body, setBody] = useState(initialBody);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setImage(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!body.trim() && !image) {
      setError("Write something or attach an image first");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await onSubmit({ body: body.trim(), image });
      setBody("");
      clearImage();
    } catch (err) {
      setError(err?.message || "Something went wrong while posting");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <textarea
        className="composer__textarea"
        placeholder={placeholder}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
      />

      {preview && (
        <div className="composer__preview">
          <img src={preview} alt="Preview" />
          <button type="button" className="composer__remove-img" onClick={clearImage}>
            Remove
          </button>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}

      <div className="composer__footer">
        <label className="composer__attach">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} hidden />
          + Photo
        </label>

        <div className="composer__buttons">
          {onCancel && (
            <button type="button" className="btn btn--ghost btn--small" onClick={onCancel} disabled={busy}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn--primary btn--small" disabled={busy}>
            {busy ? "Saving…" : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
