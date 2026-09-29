import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../components/Avatar";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";
import * as authApi from "../api/auth";
import * as postsApi from "../api/posts";
import { extractErrorMessage, unwrapList, unwrapObject, getAuthor } from "../api/client";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const userId = user?._id || user?.id;
    async function load() {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        // Confirmed endpoint for a user's own posts.
        const res = await postsApi.getUserPosts(userId, 1, 50);
        const mine = unwrapList(res);
        if (!cancelled) setMyPosts(mine);
      } catch (err) {
        try {
          const res = await postsApi.getPosts(1, 50);
          const all = unwrapList(res);
          const mine = all.filter((p) => {
            const authorId = getAuthor(p)._id || getAuthor(p).id;
            return authorId === userId;
          });
          if (!cancelled) setMyPosts(mine);
        } catch (fallbackErr) {
          if (!cancelled) setError(extractErrorMessage(fallbackErr));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoBusy(true);
    try {
      const res = await authApi.uploadPhoto(file);
      const updated = unwrapObject(res, ["user"]);
      if (updated) updateUser({ ...user, ...updated });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setPhotoBusy(false);
    }
  }

  return (
    <div className="profile-page">
      <section className="profile-header">
        <label className="profile-header__avatar" title="Change photo">
          <Avatar name={user?.name || user?.username} photo={user?.photo} size={84} />
          <input type="file" accept="image/*" hidden onChange={handlePhotoChange} />
          <span className="profile-header__avatar-hint">
            {photoBusy ? "Uploading…" : "Change photo"}
          </span>
        </label>

        <div>
          <h1>{user?.name || user?.username}</h1>
          <p className="profile-header__handle">@{user?.username}</p>
          <p className="profile-header__email">{user?.email}</p>
          <Link to="/change-password" className="btn btn--ghost btn--small">
            Change password
          </Link>
        </div>
      </section>

      {error && <p className="form-error">{error}</p>}

      <section className="feed-page__list">
        <h2 className="comments-section__title">Your posts</h2>
        {loading && <p className="page-loading">Loading…</p>}
        {!loading && myPosts.length === 0 && (
          <p className="empty-state">You haven't posted anything yet</p>
        )}
        {myPosts.map((post) => (
          <PostCard
            key={post._id || post.id}
            post={post}
            onDeleted={(id) => setMyPosts((p) => p.filter((x) => (x._id || x.id) !== id))}
            onChanged={(updated) =>
              setMyPosts((p) =>
                p.map((x) => ((x._id || x.id) === (updated._id || updated.id) ? { ...x, ...updated } : x))
              )
            }
          />
        ))}
      </section>
    </div>
  );
}
