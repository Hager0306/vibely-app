import { useState } from "react";
import Avatar from "./Avatar";
import CommentComposer from "./CommentComposer";
import { useAuth } from "../context/AuthContext";
import * as commentsApi from "../api/comments";
import { extractErrorMessage, unwrapList, unwrapObject, getAuthor, likedByUser } from "../api/client";

export default function CommentItem({ postId, comment, onDeleted, postOwnerId }) {
  const { user } = useAuth();
  const [current, setCurrent] = useState(comment);
  const [editing, setEditing] = useState(false);
  const [replying, setReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [error, setError] = useState("");
  const [likeOverride, setLikeOverride] = useState(null);

  const commentId = current._id || current.id;
  const author = getAuthor(current);
  const canManage =
    user && (author._id === user._id || author.id === user.id || user._id === postOwnerId);
  const isLiked = likeOverride ?? likedByUser(current, user);
  const commentText = current.content || current.text || current.body || "";

  async function handleLike() {
    const next = !isLiked;
    setLikeOverride(next);
    try {
      const res = await commentsApi.toggleCommentLike(postId, commentId);
      const confirmed = res?.data?.data?.liked;
      if (typeof confirmed === "boolean") setLikeOverride(confirmed);
    } catch (err) {
      setLikeOverride(!next);
      setError(extractErrorMessage(err));
    }
  }

  async function handleEdit(text) {
    const res = await commentsApi.updateComment(postId, commentId, { text });
    setCurrent((c) => ({ ...c, ...(unwrapObject(res, ["comment"]) || { content: text }) }));
    setEditing(false);
  }

  async function handleDelete() {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await commentsApi.deleteComment(postId, commentId);
      onDeleted?.(commentId);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function loadReplies() {
    setShowReplies((v) => !v);
    if (repliesLoaded) return;
    try {
      const res = await commentsApi.getReplies(postId, commentId);
      setReplies(unwrapList(res, ["replies", "comments", "items", "data"]));
      setRepliesLoaded(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function handleReply(text) {
    const res = await commentsApi.createReply(postId, commentId, { text });
    const newReply = unwrapObject(res, ["reply", "comment"]) || { content: text, user };
    setReplies((r) => [...r, newReply]);
    setShowReplies(true);
    setRepliesLoaded(true);
    setReplying(false);
  }

  return (
    <li className="comment">
      <Avatar name={author.name || author.username || "User"} photo={author.photo} size={32} />
      <div className="comment__body">
        <div className="comment__bubble">
          <p className="comment__name">{author.name || author.username || "User"}</p>
          {editing ? (
            <CommentComposer
              initialText={commentText}
              submitLabel="Save"
              onSubmit={handleEdit}
              onCancel={() => setEditing(false)}
              small
            />
          ) : (
            <p className="comment__text">{commentText}</p>
          )}
        </div>

        {error && <p className="form-error">{error}</p>}

        {!editing && (
          <div className="comment__actions">
            <button className={`link-btn ${isLiked ? "link-btn--active" : ""}`} onClick={handleLike}>
              ♥ Like
            </button>
            <button className="link-btn" onClick={() => setReplying((v) => !v)}>
              Reply
            </button>
            <button className="link-btn" onClick={loadReplies}>
              {showReplies ? "Hide replies" : "Replies"}
            </button>
            {canManage && (
              <>
                <button className="link-btn" onClick={() => setEditing(true)}>
                  Edit
                </button>
                <button className="link-btn link-btn--danger" onClick={handleDelete}>
                  Delete
                </button>
              </>
            )}
          </div>
        )}

        {replying && (
          <CommentComposer
            placeholder="Write a reply…"
            submitLabel="Reply"
            onSubmit={handleReply}
            onCancel={() => setReplying(false)}
            small
          />
        )}

        {showReplies && (
          <ul className="comment__replies">
            {replies.map((reply) => {
              const rAuthor = getAuthor(reply);
              return (
                <li key={reply._id || reply.id} className="comment comment--reply">
                  <Avatar name={rAuthor.name || rAuthor.username || "User"} photo={rAuthor.photo} size={26} />
                  <div className="comment__bubble">
                    <p className="comment__name">{rAuthor.name || rAuthor.username || "User"}</p>
                    <p className="comment__text">{reply.content || reply.text || reply.body}</p>
                  </div>
                </li>
              );
            })}
            {repliesLoaded && replies.length === 0 && (
              <p className="comment__empty">No replies yet</p>
            )}
          </ul>
        )}
      </div>
    </li>
  );
}
