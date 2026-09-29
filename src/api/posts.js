import client, { unwrapList, unwrapObject } from "./client";

export function getPosts(page = 1, limit = 10) {
  return client.get("/posts", { params: { page, limit } });
}

export function getFeed({ only = "all", page = 1, limit = 10 } = {}) {
  return client.get("/posts/feed", { params: { only, page, limit } });
}

export function createPost(payload) {
  // payload: { body, image? } — send as FormData when an image is attached
  if (payload.image) {
    const formData = new FormData();
    formData.append("body", payload.body || "");
    formData.append("image", payload.image);
    return client.post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return client.post("/posts", { body: payload.body });
}

export function updatePost(postId, payload) {
  if (payload.image) {
    const formData = new FormData();
    if (payload.body !== undefined) formData.append("body", payload.body);
    formData.append("image", payload.image);
    return client.put(`/posts/${postId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return client.put(`/posts/${postId}`, payload);
}

export function deletePost(postId) {
  return client.delete(`/posts/${postId}`);
}

export function toggleLike(postId) {
  return client.put(`/posts/${postId}/like`);
}

export function toggleBookmark(postId) {
  return client.put(`/posts/${postId}/bookmark`);
}

export function sharePost(postId) {
  return client.post(`/posts/${postId}/share`);
}

export function getPostLikes(postId, page = 1, limit = 20) {
  return client.get(`/posts/${postId}/likes`, { params: { page, limit } });
}

// Confirmed against a working reference project: a user's own posts are
// GET /users/:userId/posts, not a query param on /posts.
export function getUserPosts(userId, page = 1, limit = 20) {
  return client.get(`/users/${userId}/posts`, { params: { page, limit } });
}

// The docs don't list a single-post endpoint, so try the natural
// /posts/:id route first and fall back to scanning the feed if it 404s.
export async function getPostById(postId) {
  try {
    const res = await client.get(`/posts/${postId}`);
    return unwrapObject(res, ["post"]);
  } catch (err) {
    const res = await client.get("/posts", { params: { page: 1, limit: 50 } });
    const list = unwrapList(res);
    const found = list.find((p) => p._id === postId || p.id === postId);
    if (!found) throw err;
    return found;
  }
}
