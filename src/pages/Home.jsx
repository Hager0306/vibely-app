import { useEffect, useState } from "react";
import PostComposer from "../components/PostComposer";
import PostCard from "../components/PostCard";
import * as postsApi from "../api/posts";
import { extractErrorMessage, unwrapList, unwrapObject } from "../api/client";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  async function loadPage(nextPage) {
    setLoading(true);
    setError("");
    try {
      const res = await postsApi.getPosts(nextPage, 10);
      const list = unwrapList(res);
      setPosts((prev) => (nextPage === 1 ? list : [...prev, ...list]));
      setHasMore(list.length > 0);
      setPage(nextPage);
    } catch (err) {
      setError(extractErrorMessage(err, "Sorry, we couldn't load the feed right now"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPage(1);
  }, []);

  async function handleCreate({ body, image }) {
    const res = await postsApi.createPost({ body, image });
    const newPost = unwrapObject(res, ["post"]);
    if (newPost) setPosts((p) => [newPost, ...p]);
  }

  function handleDeleted(postId) {
    setPosts((p) => p.filter((post) => (post._id || post.id) !== postId));
  }

  return (
    <div className="feed-page">
      <section className="feed-page__composer">
        <PostComposer onSubmit={handleCreate} submitLabel="Post" />
      </section>

      {error && (
        <p className="form-error">
          {error}{" "}
          <button className="link-btn" onClick={() => { setError(""); loadPage(1); }}>
            Retry
          </button>
        </p>
      )}

      <section className="feed-page__list">
        {posts.map((post) => (
          <PostCard
            key={post._id || post.id}
            post={post}
            onDeleted={handleDeleted}
            onChanged={(updated) =>
              setPosts((p) =>
                p.map((item) =>
                  (item._id || item.id) === (updated._id || updated.id)
                    ? { ...item, ...updated }
                    : item
                )
              )
            }
          />
        ))}

        {!loading && posts.length === 0 && (
          <p className="empty-state">Nothing here yet — start the conversation above.</p>
        )}

        {loading && <p className="page-loading">Loading…</p>}

        {!loading && hasMore && posts.length > 0 && (
          <button className="btn btn--ghost btn--block" onClick={() => loadPage(page + 1)}>
            Load more
          </button>
        )}
      </section>
    </div>
  );
}
