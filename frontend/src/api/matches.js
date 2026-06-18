const BASE_URL = "http://localhost:8080/matches";

export const getMyMatches = async (token) => {
  const response = await fetch(`${BASE_URL}/my`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error("Failed to fetch matches");
  }

  return response.json();
};

export const runMatchingForFilteredLostItems = async (lostItemIds, token) => {
  const response = await fetch(`${BASE_URL}/run-filtered`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ lostItemIds }),
  });

  if (!response.ok) {
    throw new Error("Failed to run matching");
  }

  return response.json();
};
