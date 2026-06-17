import React, { useEffect, useMemo, useState } from "react";

const API_BASE_URL = "http://localhost:8080/items";

export default function SearchCatalogue({ goHome }) {
  const [allItems, setAllItems] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [reportType, setReportType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [location, setLocation] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const getHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const loadAllItems = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_BASE_URL, {
        method: "GET",
        headers: getHeaders(),
      });

      if (!response.ok) throw new Error("Failed to load items");

      const data = await response.json();
      const items = Array.isArray(data) ? data : [];

      setAllItems(items);
      setSearchResults(items);
    } catch (err) {
      setError("Could not load catalogue. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllItems();
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();

    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setSearchResults(allItems);
      return;
    }

    try {
      setSearching(true);

      const response = await fetch(
        `${API_BASE_URL}/search?q=${encodeURIComponent(trimmed)}`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data = await response.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Search failed.");
    } finally {
      setSearching(false);
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setReportType("ALL");
    setStatus("ALL");
    setCategory("ALL");
    setLocation("ALL");
    setSortBy("NEWEST");
    setSearchResults(allItems);
    setSelectedItem(null);
    setError("");
  };

  const filteredItems = useMemo(() => {
    const filtered = searchResults.filter((item) => {
      const itemReportType = String(item.reportType || "").toUpperCase();
      const itemStatus = String(item.status || "").toUpperCase();

      return (
        (reportType === "ALL" || itemReportType === reportType) &&
        (status === "ALL" || itemStatus === status)
      );
    });

    return filtered;
  }, [searchResults, reportType, status]);

  return (
    <div className="catalogue-page">
      <style>{catalogueStyles}</style>

      {/* HEADER */}
      <header className="catalogue-header">
        <div className="header-content">
          <button
            onClick={goHome}
            style={{
              marginBottom: 12,
              padding: "8px 14px",
              border: "none",
              background: "#155fa5",
              color: "white",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            ← Back to Dashboard
          </button>

          <span className="header-label">University of Moratuwa</span>
          <h1>Lost & Found Catalogue</h1>
          <p>Search reported lost and found items.</p>
        </div>
      </header>

      {/* BODY */}
      <main className="catalogue-container">
        <section className="search-panel">
          <form onSubmit={handleSearch}>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search items..."
            />

            <button type="submit" disabled={searching}>
              Search
            </button>

            <button type="button" onClick={handleReset}>
              Reset
            </button>
          </form>
        </section>

        {/* ERROR */}
        {error && <div className="error-message">{error}</div>}

        {/* LOADING */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="item-grid">
            {filteredItems.map((item, i) => (
              <div key={i} className="item-card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <button onClick={() => setSelectedItem(item)}>
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedItem.title}</h2>
            <p>{selectedItem.description}</p>
            <button onClick={() => setSelectedItem(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* keep your existing CSS */
const catalogueStyles = `
/* your existing styles remain unchanged */
`;