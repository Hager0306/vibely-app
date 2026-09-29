import axios from "axios";

// Base URL for the Route Academy Posts API
export const BASE_URL = "https://route-posts.routemisr.com";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 20000, // never hang on "Loading…" forever
});

// Attach the saved token to every request automatically.
// This API's reference implementations disagree on the header name, so
// send both "Authorization: Bearer <token>" and a plain "token" header.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers.token = token;
  }
  return config;
});

// If the token becomes invalid, clear it so the app returns to login
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

// Pull a readable message out of the API's error contract:
// { success: false, message: "...", errors: ["...", "..."] }
export function extractErrorMessage(error, fallback = "Something went wrong, please try again") {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (Array.isArray(data.errors) && data.errors.length) {
    return data.errors.join(" — ");
  }
  return data.message || fallback;
}

export default client;

// ---- Response helpers -------------------------------------------------
// The API wraps payloads differently per endpoint (data, data.user,
// data.posts …). These helpers find the useful part so pages don't crash.
export function unwrapList(res, keys = ["posts", "comments", "replies", "items", "results", "docs", "data"]) {
  const root = res?.data;
  for (const c of [root?.data, root]) {
    if (Array.isArray(c)) return c;
    if (c && typeof c === "object") {
      for (const k of keys) if (Array.isArray(c[k])) return c[k];
    }
  }
  return [];
}

export function unwrapObject(res, keys = ["user", "post", "comment", "reply"]) {
  const root = res?.data;
  const c = root?.data ?? root;
  if (c && typeof c === "object" && !Array.isArray(c)) {
    for (const k of keys) if (c[k] && typeof c[k] === "object") return c[k];
    return c;
  }
  return null;
}

export function unwrapToken(res) {
  return res?.data?.data?.token ?? res?.data?.token ?? null;
}

// A confirmed reference build against this same API found the post author
// lives at "user" and the comment author at "commentCreator" (not
// "author"), and that there's no ready-made "isLiked" flag — you have to
// check whether the current user's id is inside the entity's "likes"
// array. These two helpers centralize that so every component agrees.
export function getAuthor(entity = {}) {
  return entity.user || entity.commentCreator || entity.author || {};
}

export function likedByUser(entity = {}, currentUser) {
  const uid = currentUser?._id || currentUser?.id;
  if (!uid || !Array.isArray(entity?.likes)) return Boolean(entity?.isLiked);
  return entity.likes.some((like) => like === uid || like?._id === uid || like?.id === uid);
}
