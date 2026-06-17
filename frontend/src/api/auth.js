import { apiRequest, saveUserSession, clearUserSession, getSavedUser } from "./client";

export async function registerUser({ name, username, email, password, role = "student" }) {
  const preferredUsername = username || name || email?.split("@")[0];

  const response = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      username: preferredUsername,
      email,
      password,
    }),
  });

  return saveUserSession(response, {
    username: preferredUsername,
    name: preferredUsername,
    email,
    role,
  });
}

export async function loginUser({ identifier, email, username, password }) {
  const loginId = identifier || email || username;

  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      username: loginId,
      email: loginId,
      password,
    }),
  });

  const role = String(loginId || "").toLowerCase().includes("admin") ? "admin" : "student";

  return saveUserSession(response, {
    username: loginId,
    name: loginId,
    email: loginId,
    role,
  });
}

export function logoutUser() {
  clearUserSession();
}

export function getCurrentUserFromStorage() {
  return getSavedUser();
}

export async function updateProfile(profileData) {
  const response = await apiRequest("/users/me", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
  
  const currentUser = getSavedUser();
  return saveUserSession({ user: response, token: currentUser?.token || currentUser?.accessToken }, currentUser);
}

export async function uploadProfilePhoto(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiRequest("/users/me/photo", {
    method: "POST",
    body: formData,
  });

  const currentUser = getSavedUser();
  return saveUserSession({ user: response, token: currentUser?.token || currentUser?.accessToken }, currentUser);
}

export async function requestPasswordReset(email) {
  return await apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function confirmPasswordReset(token, newPassword) {
  return await apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function changePassword(currentPassword, newPassword) {
  return await apiRequest("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
