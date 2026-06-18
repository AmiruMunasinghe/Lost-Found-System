import { apiRequest } from "./client";

function normalizeMatch(match) {
  return {
    ...match,
    id: match.id,
    lostItem: match.lostItem || match.lost || null,
    foundItem: match.foundItem || match.found || null,
    confidenceScore: match.confidenceScore ?? match.score ?? null,
    status: match.status || "SUGGESTED",
  };
}

export async function getMatches(filters = {}) {
  const params = new URLSearchParams();

  if (filters.itemId) params.set("itemId", filters.itemId);
  if (filters.lostItemId) params.set("lostItemId", filters.lostItemId);
  if (filters.foundItemId) params.set("foundItemId", filters.foundItemId);
  if (filters.status) params.set("status", filters.status);

  const query = params.toString();
  const data = await apiRequest(`/matches${query ? `?${query}` : ""}`);
  return Array.isArray(data) ? data.map(normalizeMatch) : [];
}

export async function getMyMatches() {
  const data = await apiRequest("/matches/my");
  return Array.isArray(data) ? data.map(normalizeMatch) : [];
}

export async function getMatchesForItem(itemId) {
  const all = await getMyMatches();
  return all.filter((m) => String(m.lostItem?.id) === String(itemId) || String(m.foundItem?.id) === String(itemId));
}

export async function getMatchesForLostItem(lostItemId) {
  return getMatches({ lostItemId });
}

export async function getMatchesForFoundItem(foundItemId) {
  return getMatches({ foundItemId });
}

export async function runMatchingForLostItem(lostItemId) {
  if (!lostItemId) throw new Error("Lost item ID is required to run matching.");
  const data = await apiRequest(`/matches/run?lostItemId=${encodeURIComponent(lostItemId)}`, { method: "POST" });
  return Array.isArray(data) ? data.map(normalizeMatch) : [];
}

export async function runMatchingForLostItems(lostItemIds = []) {
  const cleanIds = lostItemIds.filter((id) => id !== null && id !== undefined);
  if (cleanIds.length === 0) return [];
  const data = await apiRequest("/matches/run-filtered", {
    method: "POST",
    body: JSON.stringify({ lostItemIds: cleanIds }),
  });
  return Array.isArray(data) ? data.map(normalizeMatch) : [];
}

export async function confirmMatch(matchId) {
  return normalizeMatch(await apiRequest(`/matches/${matchId}/confirm`, { method: "POST" }));
}

export async function rejectMatch(matchId) {
  return normalizeMatch(await apiRequest(`/matches/${matchId}/reject`, { method: "POST" }));
}

export async function getReviewQueue() {
  const data = await apiRequest("/matches/review-queue");
  return Array.isArray(data) ? data.map(normalizeMatch) : [];
}

export async function approveReviewMatch(matchId) {
  return normalizeMatch(await apiRequest(`/matches/review-queue/${matchId}/approve`, { method: "POST" }));
}

export async function rejectReviewMatch(matchId) {
  return normalizeMatch(await apiRequest(`/matches/review-queue/${matchId}/reject`, { method: "POST" }));
}
