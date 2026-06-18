import { apiRequest } from "./client";

export async function getMatches(filters = {}) {
  const qs = Object.keys(filters || {}).length
    ? `?${new URLSearchParams(filters).toString()}`
    : "";
  const data = await apiRequest(`/matches${qs}`);
  return data;
}

export async function getMyMatches() {
  const data = await apiRequest("/matches/my");
  return Array.isArray(data) ? data : [];
}

export async function getMatchesForFoundItem(foundItemId) {
  return getMatches({ foundItemId });
}

export async function runMatchingForLostItem(lostItemId) {
  if (!lostItemId) throw new Error("Lost item ID is required to run matching.");
  const data = await apiRequest(`/matches/run?lostItemId=${encodeURIComponent(lostItemId)}`, { method: "POST" });
  return Array.isArray(data) ? data : [];
}

export async function runMatchingForLostItems(lostItemIds = []) {
  const cleanIds = (lostItemIds || []).filter((id) => id !== null && id !== undefined);
  if (cleanIds.length === 0) return [];
  const data = await apiRequest("/matches/run-filtered", { method: "POST", body: JSON.stringify({ lostItemIds: cleanIds }) });
  return Array.isArray(data) ? data : [];
}

export async function runMatchingForFilteredLostItems(lostItemIds = []) {
  return runMatchingForLostItems(lostItemIds);
}

export async function confirmMatch(matchId) {
  return apiRequest(`/matches/${matchId}/confirm`, { method: "POST" });
}

export async function rejectMatch(matchId) {
  return apiRequest(`/matches/${matchId}/reject`, { method: "POST" });
}

export async function getReviewQueue() {
  const data = await apiRequest("/matches/review-queue");
  return Array.isArray(data) ? data : [];
}

export async function approveReviewMatch(matchId) {
  return apiRequest(`/matches/review-queue/${matchId}/approve`, { method: "POST" });
}

export async function rejectReviewMatchReview(matchId) {
  return apiRequest(`/matches/review-queue/${matchId}/reject`, { method: "POST" });
}

export default { getMatches, getMyMatches, getMatchesForFoundItem, runMatchingForLostItem, runMatchingForLostItems, confirmMatch, rejectMatch };
