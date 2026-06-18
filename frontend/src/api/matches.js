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

// New fixed backend endpoint:
// POST /matches/run?lostItemId=<id>
// Matching can only be run for LOST item IDs.
export async function runMatchingForLostItem(lostItemId) {
  if (!lostItemId) {
    throw new Error("Lost item ID is required to run matching.");
  }

  const data = await apiRequest(`/matches/run?lostItemId=${encodeURIComponent(lostItemId)}`, {
    method: "POST",
  });

  return Array.isArray(data) ? data : [];
}

// New fixed backend endpoint:
// POST /matches/run-filtered
// Body: { lostItemIds: [1, 2, 3] }
export async function runMatchingForLostItems(lostItemIds = []) {
  const cleanIds = lostItemIds.filter((id) => id !== null && id !== undefined);

  if (cleanIds.length === 0) {
    return [];
  }

  const data = await apiRequest("/matches/run-filtered", {
    method: "POST",
    body: JSON.stringify({ lostItemIds: cleanIds }),
  });

  return Array.isArray(data) ? data : [];
}

export async function confirmMatch(matchId) {
  return apiRequest(`/matches/${matchId}/confirm`, { method: "POST" });
}

export async function rejectMatch(matchId) {
  return apiRequest(`/matches/${matchId}/reject`, { method: "POST" });
}

export async function getMyMatches() {
  const data = await apiRequest("/matches/my");
  return Array.isArray(data) ? data : [];
}

export async function getReviewQueue() {
  const data = await apiRequest("/matches/review-queue");
  return Array.isArray(data) ? data : [];
}

export async function approveReviewMatch(matchId) {
  return apiRequest(`/matches/review-queue/${matchId}/approve`, { method: "POST" });
}

export async function rejectReviewMatch(matchId) {
  return apiRequest(`/matches/review-queue/${matchId}/reject`, { method: "POST" });
}
