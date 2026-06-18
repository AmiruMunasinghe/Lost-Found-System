const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8085";

export function normalizeRole(role, fallback = "student") {
  const value = String(role || fallback || "student").toLowerCase();
  if (value === "admin" || value === "role_admin") return "admin";
  if (value === "user" || value === "student" || value === "role_user") return "student";
  return fallback === "admin" ? "admin" : "student";
}

export function getSavedUser() {
  const saved = localStorage.getItem("lost_found_user") || localStorage.getItem("lostFoundUser");
  if (!saved) return null;
  try {
    const user = JSON.parse(saved);
    return { ...user, role: normalizeRole(user.role) };
  } catch {
    localStorage.removeItem("lost_found_user");
    localStorage.removeItem("lostFoundUser");
    return null;
  }
}

export function saveUserSession(authResponse, fallback = {}) {
  const token = authResponse?.accessToken || authResponse?.token || authResponse?.jwt || fallback.accessToken || fallback.token || "";
  const backendUser = authResponse?.user || authResponse || {};
  const role = normalizeRole(backendUser.role || fallback.role, fallback.role || "student");

  const user = {
    id: backendUser.id ?? fallback.id ?? null,
    username: backendUser.username || fallback.username || fallback.name || "User",
    name: backendUser.name || backendUser.fullName || backendUser.username || fallback.name || "User",
    email: backendUser.email || fallback.email || "",
    role,
    backendRole: backendUser.role || fallback.backendRole || (role === "admin" ? "ADMIN" : "USER"),
    fullName: backendUser.fullName || fallback.fullName || "",
    phone: backendUser.phone || fallback.phone || "",
    studentId: backendUser.studentId || fallback.studentId || "",
    faculty: backendUser.faculty || fallback.faculty || "",
    department: backendUser.department || fallback.department || "",
    yearOfStudy: backendUser.yearOfStudy || fallback.yearOfStudy || "",
    profileImageUrl: backendUser.profileImageUrl || fallback.profileImageUrl || "",
    accessToken: token,
    token,
  };

  localStorage.setItem("lost_found_user", JSON.stringify(user));
  localStorage.setItem("lostFoundUser", JSON.stringify(user));
  return user;
}

export function clearUserSession() {
  localStorage.removeItem("lost_found_user");
  localStorage.removeItem("lostFoundUser");
}

export function getToken() {
  const user = getSavedUser();
  return user?.accessToken || user?.token || localStorage.getItem("adminToken") || null;
}

export async function apiRequest(path, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    if (response.status === 401 && !path.includes("/auth/login")) {
      clearUserSession();
      window.location.href = "/login";
      throw new Error("Session expired. Please log in again.");
    }

    const contentType = response.headers.get("content-type") || "";
    let message = `Request failed with status ${response.status}`;

    try {
      if (contentType.includes("application/json")) {
        const errorJson = await response.json();
        message = errorJson.message || errorJson.error || JSON.stringify(errorJson);
      } else {
        const text = await response.text();
        if (text) message = text;
      }
    } catch {
      // Keep default message
    }

    throw new Error(message);
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return response.text();

  return response.json();
}
