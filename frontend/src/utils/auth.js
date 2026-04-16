// ── Auth Helpers ─────────────────────────────────────────────────────────────
// Stores users array and current session in localStorage

const USERS_KEY   = "pms_users";
const SESSION_KEY = "pms_session";

// ── User registry ─────────────────────────────────────────────────────────────
export function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveUser(user) {
  const users = getUsers();
  const existing = users.findIndex((u) => u.email === user.email);
  if (existing >= 0) {
    users[existing] = user; // update
  } else {
    users.push(user);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function findUser(email) {
  return getUsers().find((u) => u.email === email) || null;
}

// ── Session ───────────────────────────────────────────────────────────────────
export function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  // keep legacy "role" key so ProtectedRoute still works
  localStorage.setItem("role", user.role);
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("role");
}

// ── Role → route ──────────────────────────────────────────────────────────────
export function dashboardRoute(role) {
  const routes = {
    researcher: "/researcher/dashboard",
    evaluator:  "/evaluator/dashboard",
  };
  return routes[role] || "/login";
}