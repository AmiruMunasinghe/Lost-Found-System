import { apiRequest } from "./client";

function normalizeReportType(value) {
  const text = String(value || "").toUpperCase();
  if (text === "FOUND") return "FOUND";
  return "LOST";
}

export function toFrontendItem(item) {
  const reportType = normalizeReportType(item.reportType || item.type);

  return {
    ...item,
    id: item.id,
    title: item.title || "Untitled item",
    desc: item.description || item.desc || "",
    description: item.description || item.desc || "",
    category: item.category || "Other",
    location: item.location || item.venue || "",
    venue: item.location || item.venue || "",
    type: reportType.toLowerCase(),
    reportType,
    status: item.status || "OPEN",
    date: item.createdAt ? String(item.createdAt).slice(0, 10) : item.date || "",
    imageUrls: item.imageUrls || [],
  };
}

export function toBackendItem(itemData, forcedType) {
  const reportType = normalizeReportType(forcedType || itemData.reportType || itemData.type);

  const extraDetails = [
    itemData.color ? `Color: ${itemData.color}` : "",
    itemData.time ? `Time: ${itemData.time}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const description = [itemData.description || itemData.desc || "", extraDetails]
    .filter(Boolean)
    .join("\n");

  return {
    title: itemData.title,
    description,
    category: itemData.category || "Other",
    location: itemData.location || itemData.venue,
    reportType,
    imageUrls: itemData.imageUrls || [],
  };
}

export async function getAllItems() {
  const data = await apiRequest("/items");
  return Array.isArray(data) ? data.map(toFrontendItem) : [];
}

// Backward-compatible name used by old components
export async function getItems() {
  return getAllItems();
}

export async function getItemById(id) {
  const data = await apiRequest(`/items/${id}`);
  return toFrontendItem(data);
}

export async function searchItems(searchTerm) {
  const q = encodeURIComponent(searchTerm || "");
  const data = await apiRequest(`/items/search?q=${q}`);
  return Array.isArray(data) ? data.map(toFrontendItem) : [];
}

export async function getItemsByType(type) {
  const reportType = normalizeReportType(type);
  const data = await apiRequest(`/items/filter?type=${reportType}`);
  return Array.isArray(data) ? data.map(toFrontendItem) : [];
}

export async function getItemsByTypeAndStatus(type, status = "OPEN") {
  const reportType = normalizeReportType(type);
  const data = await apiRequest(`/items/filter?type=${reportType}&status=${status}`);
  return Array.isArray(data) ? data.map(toFrontendItem) : [];
}

export async function createItem(itemData, forcedType) {
  const payload = toBackendItem(itemData, forcedType);
  const data = await apiRequest("/items", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return toFrontendItem(data);
}

export async function deleteItem(id) {
  return apiRequest(`/items/${id}`, { method: "DELETE" });
}
