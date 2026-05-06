const KEY = "lost_found_items";

// 🔹 Get all items
export function getItems() {
  return JSON.parse(localStorage.getItem(KEY)) || [];
}

// 🔹 Save new item
export function createItem(item) {
  const items = getItems();

  const newItem = {
    id: Date.now(),
    ...item,
  };

  items.push(newItem);
  localStorage.setItem(KEY, JSON.stringify(items));

  return newItem;
}

// 🔹 Clear all (optional for testing)
export function clearItems() {
  localStorage.removeItem(KEY);
}