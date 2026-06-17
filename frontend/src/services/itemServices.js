// src/services/itemService.js

const BASE_URL = "http://localhost:8080/items";

export const getAllItems = async () => {
    const response = await fetch(BASE_URL);

    if (!response.ok) {
        throw new Error("Failed to fetch items");
    }

    return response.json();
};

export const getItemById = async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`);

    if (!response.ok) {
        throw new Error("Item not found");
    }

    return response.json();
};

export const searchItems = async (searchTerm) => {
    const response = await fetch(
        `${BASE_URL}/search?q=${searchTerm}`
    );

    return response.json();
};

export const getItemsByType = async (type) => {
    const response = await fetch(
        `${BASE_URL}/type/${type}`
    );

    return response.json();
};

export const createItem = async (itemData, token) => {
    console.log("🔥 createItem ENTERED");
    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(itemData)
    });

    return response.json();
};

export const deleteItem = async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE"
    });

    return response;
};