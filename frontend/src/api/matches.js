import { apiRequest } from "./client";

export async function getMatches(filters = {}) {
  const params = new URLSearchParams();

  if (filters.itemId) params.set("itemId", filters.itemId);
  if (filters.lostItemId) params.set("lostItemId", filters.lostItemId);
  if (filters.foundItemId) params.set("foundItemId", filters.foundItemId);
  if (filters.status) params.set("status", filters.status);

  const query = params.toString();
  const data = await apiRequest(`/matches${query ? `?${query}` : ""}`);
  return Array.isArray(data) ? data : [];
}

export async function getMatchesForItem(itemId) {
  return getMatches({ itemId });
}

export async function getMatchesForLostItem(lostItemId) {
  return getMatches({ lostItemId });
}

export async function getMatchesForFoundItem(foundItemId) {
  return getMatches({ foundItemId });
}

export async function confirmMatch(matchId) {
  return apiRequest(`/matches/${matchId}/confirm`, { method: "POST" });
}

export async function rejectMatch(matchId) {
  return apiRequest(`/matches/${matchId}/reject`, { method: "POST" });
}

export async function getReviewQueue() {
  return apiRequest("/matches/review-queue");
}
