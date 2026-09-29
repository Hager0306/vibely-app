import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PostCard from "../components/PostCard";
import CommentComposer from "../components/CommentComposer";
import CommentItem from "../components/CommentItem";
import * as postsApi from "../api/posts";
import * as commentsApi from "../api/comments";
import { extractErrorMessage, unwrapList, unwrapObject, getAuthor } from "../api/client";

export default function PostDetails() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [postData, commentsRes] = await Promise.all([
          postsApi.getPostById(postId),
          commentsApi.getComments(postId),
        ]);
        if (!cancelled) {
          setPost(postData);
          setComments(unwrapList(commentsRes));
        }
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err, "We couldn't load this post"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  async function handleAddComment(text) {
    const res = await commentsApi.createComment(postId, { text });
    const newComment = unwrapObject(res, ["comment"]) || { content: text };
    setComments((c) => [...c, newComment]);
  }

  function handleCommentDeleted(commentId) {
    setComments((c) => c.filter((item) => (item._id || item.id) !== commentId));
  }

  if (loading) return <p className="page-loading">Loading…</p>;

  if (error && !post) {
    return (
      <div className="empty-state">
        <p>{error}</p>
        <Link to="/">Back to feed</Link>
      </div>
    );
  }

  const postOwnerId = getAuthor(post || {})._id || getAuthor(post || {}).id;

  return (
    <div className="details-page">
      <button className="link-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {post && (
        <PostCard
          post={post}
          linkToDetails={false}
          onDeleted={() => navigate("/")}
          onChanged={(updated) => setPost((p) => ({ ...p, ...updated }))}
        />
      )}

      <section className="comments-section">
        <h2 className="comments-section__title">Thread</h2>
        <CommentComposer onSubmit={handleAddComment} />

        {comments.length === 0 ? (
          <p className="empty-state">No comments yet — be the first to say something.</p>
        ) : (
          <ul className="comment-list">
            {comments.map((comment) => (
              <CommentItem
                key={comment._id || comment.id}
                postId={postId}
                comment={comment}
                postOwnerId={postOwnerId}
                onDeleted={handleCommentDeleted}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
