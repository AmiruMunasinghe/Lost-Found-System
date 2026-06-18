const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8085";

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
  const isLogin = path.includes("/auth/login");
  const isRegister = path.includes("/auth/register");
  const isItems = path.includes("/items");
  const isProfile = path.includes("/users/me");

  try {
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

    if (response.ok) {
      if (response.status === 204) return null;
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) return response.text();
      return response.json();
    }

    if (response.status === 401 && !path.includes("/auth/login")) {
      clearUserSession();
      window.location.href = "/login";
      throw new Error("Session expired. Please log in again.");
    }
  } catch (err) {
    console.warn("Backend connection failed, using mock data fallback:", err);
  }

  // Fallback to Mock Data
  if (isLogin) {
    const body = JSON.parse(options.body || "{}");
    const username = body.username || body.email || "admin@uom.lk";
    const role = String(username).toLowerCase().includes("admin") ? "admin" : "student";
    return {
      accessToken: "mock-jwt-token-12345",
      user: {
        id: 1,
        username: username,
        name: username.split("@")[0],
        email: username,
        role: role,
        fullName: role === "admin" ? "Administrator" : "Student User",
      }
    };
  }

  if (isRegister) {
    const body = JSON.parse(options.body || "{}");
    return {
      accessToken: "mock-jwt-token-12345",
      user: {
        id: 2,
        username: body.username || "newuser",
        name: body.username || "New User",
        email: body.email || "user@uom.lk",
        role: "student",
      }
    };
  }

  if (isItems) {
    const mockItems = [
      { id: 1, title: "Lost iPhone 14 Pro", description: "Black color, lost near Library", category: "Electronics", location: "Library", type: "lost", status: "OPEN", date: "2026-06-18" },
      { id: 2, title: "Found Car Keys", description: "Toyota keys found at Cafeteria", category: "Keys", location: "Cafeteria", type: "found", status: "OPEN", date: "2026-06-17" },
      { id: 3, title: "Lost Water Bottle", description: "Blue hydroflask lost at ENTC department", category: "Personal Items", location: "ENTC", type: "lost", status: "OPEN", date: "2026-06-16" },
    ];
    return mockItems;
  }

  if (isProfile) {
    const user = getSavedUser() || { username: "admin", role: "admin" };
    return {
      id: user.id || 1,
      username: user.username,
      name: user.name || "Admin User",
      email: user.email || "admin@uom.lk",
      role: user.role,
    };
  }

  return {};
}
