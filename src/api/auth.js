import client from "./client";

// Adjust the payload keys here if your Postman collection uses different
// field names (e.g. "userName" instead of "username") — the API's
// validation "errors" array (surfaced by extractErrorMessage) will tell
// you exactly which field it's complaining about while you're testing.
export function signup(payload) {
  return client.post("/users/signup", payload);
}

export function signin(payload) {
  return client.post("/users/signin", payload);
}

export function changePassword(payload) {
  return client.patch("/users/change-password", payload);
}

export function uploadPhoto(file) {
  const formData = new FormData();
  formData.append("photo", file);
  return client.put("/users/upload-photo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function getProfile() {
  return client.get("/users/profile-data");
}
