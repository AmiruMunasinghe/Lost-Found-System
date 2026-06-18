const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export function getSavedUser() {
  const saved = localStorage.getItem("lost_found_user");
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    localStorage.removeItem("lost_found_user");
    return null;
  }
}

export function saveUserSession(authResponse, fallback = {}) {
  const token = authResponse?.accessToken || authResponse?.token || authResponse?.jwt || "";
  const backendUser = authResponse?.user || authResponse || {};

  const user = {
    id: backendUser.id ?? fallback.id ?? null,
    username: backendUser.username || fallback.username || fallback.name || "User",
    name: backendUser.name || backendUser.username || fallback.name || "User",
    email: backendUser.email || fallback.email || "",
    role: backendUser.role || fallback.role || "student",
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
  return user;
}

export function clearUserSession() {
  localStorage.removeItem("lost_found_user");
}

export function getToken() {
  const user = getSavedUser();
  return user?.accessToken || user?.token || null;
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
    if (response.status === 401) {
      // Don't redirect if we're actually trying to log in (wrong password)
      if (!path.includes("/auth/login")) {
        clearUserSession();
        window.location.href = "/login";
        throw new Error("Session expired. Please log in again.");
      }
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
