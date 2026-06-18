import { apiRequest, saveUserSession, clearUserSession, getSavedUser } from "./client";

function normalizeFrontendRole(value, loginId = "") {
  const roleText = String(value || "").trim().toLowerCase();
  const loginText = String(loginId || "").trim().toLowerCase();

  if (
    roleText === "admin" ||
    roleText === "role_admin" ||
    roleText === "administrator" ||
    loginText === "admin" ||
    loginText === "admin@uom.lk"
  ) {
    return "admin";
  }

  return "student";
}

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

  const backendUser = response?.user || {};
  const frontendRole = normalizeFrontendRole(backendUser.role || role, preferredUsername);

  return saveUserSession(response, {
    username: preferredUsername,
    name: preferredUsername,
    email,
    role: frontendRole,
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

  const backendUser = response?.user || {};
  const role = normalizeFrontendRole(backendUser.role, loginId);

  const user = saveUserSession(response, {
    username: backendUser.username || loginId,
    name: backendUser.username || loginId,
    email: backendUser.email || loginId,
    role,
  });

  // Force the normalized frontend role because backend returns USER/ADMIN, while the frontend routes use student/admin.
  user.role = role;
  localStorage.setItem("lost_found_user", JSON.stringify(user));

  if (role === "admin") {
    localStorage.setItem("adminToken", user.accessToken || user.token || "");
    localStorage.setItem("adminUser", JSON.stringify({
      id: user.id || "A-09",
      name: user.fullName || user.name || user.username || "Admin",
      email: user.email || "admin@uom.lk",
      role: "ADMIN",
    }));
  } else {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
  }

  return user;
}

export function logoutUser() {
  clearUserSession();
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
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
