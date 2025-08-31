import { useState } from "react";
import { FaArrowTrendUp } from "react-icons/fa6";
function SearchDropdown({ searchValue, onSelect }) {
  const [recent, setRecent] = useState(
    JSON.parse(localStorage.getItem("recentSearches")) || []
  );

  const trending = [
    "  Professional cleaning",
    "  Electricians",
    "  Salon",
    "  Plumbers",
    "  Carpenters",
    "  Washing machine repair",
    "  Ro repair",
    "   repair",
    "   repair"
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
         maxHeight: "300px",  
         overflowY: "auto",  
      }}
    >
      {recent.length > 0 && (
        <>
          <h6 style={{ fontSize: "12px", color: "#000000ff",fontWeight:"bold" }}>Recent searches</h6>
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
            {recent.map((item, i) =>  (
              <span
                key={i}
                onClick={() => handleClick(item)}
                style={{
                  padding: "4px 10px",
                  background: "#fbfbfbff",
                  borderRadius: "5px",
                  fontSize: "12px",
                  border: "1px solid #ddd",
                  cursor: "pointer",
                }}
              ><FaArrowTrendUp />
                {item}
              </span>
            ))}
          </div>
        </>
      )}

      <h6 style={{ fontSize: "12px", color: "#070707ff", marginTop: "10px",fontWeight:"bold" }}>
        Trending searches
      </h6>
      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
        {filtered.map((item, i) => (
          <span
            key={i}
            onClick={() => handleClick(item)}
            style={{
              padding: "7px 12px",
              background: "#fbfbfbff",
              border: "1px solid #ddd",
              borderRadius: "5px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          ><FaArrowTrendUp/>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default SearchDropdown;
