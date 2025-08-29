import { useState } from "react";

function SearchDropdown({ searchValue, onSelect }) {
  const [recent, setRecent] = useState(
    JSON.parse(localStorage.getItem("recentSearches")) || []
  );

  const trending = [
    "Professional cleaning",
    "Electricians",
    "Salon",
    "Plumbers",
    "Carpenters",
    "Washing machine repair",
    "Ro repair",
    "Refrigerator repair",
    "Microwave repair"
  ];

  const filtered = searchValue
    ? trending.filter((t) =>
        t.toLowerCase().includes(searchValue.toLowerCase())
      )
    : trending;

  const handleClick = (item) => {
    let updated = [item, ...recent.filter((r) => r !== item)];
    if (updated.length > 5) updated = updated.slice(0, 5);

    setRecent(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
    onSelect(item);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        width: "100%",
        background: "#fff",
        border: "1px solid #ccc",
        borderRadius: "8px",
        marginTop: "5px",
        padding: "10px",
        boxShadow: "0 4px rgba(0,0,0,0.1)",
        zIndex: "1000",
      }}
    >
      {recent.length > 0 && (
        <>
          <h6 style={{ fontSize: "13px", color: "#666" }}>Recent searches</h6>
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
            {recent.map((item, i) => (
              <span
                key={i}
                onClick={() => handleClick(item)}
                style={{
                  padding: "4px 10px",
                  background: "#f1f3f4",
                  borderRadius: "15px",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </>
      )}

      <h6 style={{ fontSize: "13px", color: "#666", marginTop: "10px" }}>
        Trending searches
      </h6>
      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
        {filtered.map((item, i) => (
          <span
            key={i}
            onClick={() => handleClick(item)}
            style={{
              padding: "6px 12px",
              background: "#f8f9fa",
              border: "1px solid #ddd",
              borderRadius: "20px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default SearchDropdown;
