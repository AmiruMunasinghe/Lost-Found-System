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
