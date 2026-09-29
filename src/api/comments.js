import client from "./client";

// Confirmed against a working reference project on this same API: the
// comment body field is "content", not "text".
export function getComments(postId, page = 1, limit = 20) {
  return client.get(`/posts/${postId}/comments`, { params: { page, limit } });
}

export function createComment(postId, payload) {
  if (payload.image) {
    const formData = new FormData();
    formData.append("content", payload.text || "");
    formData.append("image", payload.image);
    return client.post(`/posts/${postId}/comments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return client.post(`/posts/${postId}/comments`, { content: payload.text });
}

export function updateComment(postId, commentId, payload) {
  return client.put(`/posts/${postId}/comments/${commentId}`, { content: payload.text });
}

export function deleteComment(postId, commentId) {
  return client.delete(`/posts/${postId}/comments/${commentId}`);
}

export function toggleCommentLike(postId, commentId) {
  return client.put(`/posts/${postId}/comments/${commentId}/like`);
}

export function getReplies(postId, commentId, page = 1, limit = 20) {
  return client.get(`/posts/${postId}/comments/${commentId}/replies`, {
    params: { page, limit },
  });
}

export function createReply(postId, commentId, payload) {
  return client.post(`/posts/${postId}/comments/${commentId}/replies`, {
    content: payload.text,
  });
}
