import { useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "./Avatar";
import PostComposer from "./PostComposer";
import { useAuth } from "../context/AuthContext";
import * as postsApi from "../api/posts";
import { extractErrorMessage, unwrapObject, getAuthor, likedByUser } from "../api/client";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function PostCard({ post, onChanged, onDeleted, linkToDetails = true }) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState(post);
  const [likeOverride, setLikeOverride] = useState(null);

  const author = getAuthor(current);
  const isOwner = user && (author._id === user._id || author.id === user.id);
  const postId = current._id || current.id;
  const originalLiked = likedByUser(current, user);
  const isLiked = likeOverride ?? originalLiked;
  const baseLikesCount =
    (Array.isArray(current.likes) ? current.likes.length : current.likesCount) || 0;
  const displayedLikesCount =
    baseLikesCount + (isLiked && !originalLiked ? 1 : !isLiked && originalLiked ? -1 : 0);

  async function handleLike() {
    const next = !isLiked;
    setLikeOverride(next); // optimistic, in case the response is slow
    try {
      const res = await postsApi.toggleLike(postId);
      // The API confirms the new state back as { data: { liked: bool } }
      const confirmed = res?.data?.data?.liked;
      if (typeof confirmed === "boolean") setLikeOverride(confirmed);
    } catch (err) {
      setLikeOverride(!next);
      setError(extractErrorMessage(err));
    }
  }

  async function handleUpdate({ body, image }) {
    setBusy(true);
    try {
      const res = await postsApi.updatePost(postId, { body, image });
      const updated = unwrapObject(res, ["post"]) || { ...current, body };
      setCurrent((c) => ({ ...c, ...updated }));
      setEditing(false);
      onChanged?.(updated);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this post? This can't be undone.")) return;
    setBusy(true);
    try {
      await postsApi.deletePost(postId);
      onDeleted?.(postId);
    } catch (err) {
      setError(extractErrorMessage(err));
      setBusy(false);
    }
  }

  const bodyText = current.body || current.text || "";
  const image = current.image?.secure_url || current.image?.url || current.image;

  return (
    <article className="post-card">
      <div className="post-card__head">
        <Avatar name={author.name || author.username || "User"} photo={author.photo} />
        <div>
          <p className="post-card__name">{author.name || author.username || "User"}</p>
          <p className="post-card__meta">{timeAgo(current.createdAt)}</p>
        </div>

        {isOwner && !editing && (
          <div className="post-card__owner-actions">
            <button className="link-btn" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button className="link-btn link-btn--danger" onClick={handleDelete} disabled={busy}>
              Delete
            </button>
          </div>
        )}
      </div>

      {error && <p className="form-error">{error}</p>}

      {editing ? (
        <PostComposer
          initialBody={bodyText}
          submitLabel="Save"
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          {linkToDetails ? (
            <Link to={`/posts/${postId}`} className="post-card__body">
              <p>{bodyText}</p>
            </Link>
          ) : (
            <p className="post-card__body">{bodyText}</p>
          )}

          {image && (
            <div className="post-card__image">
              <img src={image} alt="" />
            </div>
          )}

          <div className="post-card__actions">
            <button className={`chip ${isLiked ? "chip--active" : ""}`} onClick={handleLike}>
              ♥ {displayedLikesCount || 0}
            </button>
            {linkToDetails && (
              <Link className="chip" to={`/posts/${postId}`}>
                💬 {current.commentsCount || 0}
              </Link>
            )}
          </div>
        </>
      )}
    </article>
  );
}
