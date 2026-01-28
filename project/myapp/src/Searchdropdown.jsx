import { useState } from "react";
import { FaArrowTrendUp } from "react-icons/fa6";

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
    "Refrigerator repair",
    "RO repair",
    "Microwave repair",
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
    <div className="w-100 start-0 position-absolute overflow-y-auto"
      style={{
        top: "100%",
        background: "#fff",
        border: "1px solid #ccc",
        borderRadius: "8px",
        marginTop: "5px",
        padding: "10px",
        boxShadow: "0 4px rgba(0,0,0,0.1)",
        zIndex: "1000",
        maxHeight: "300px"
      }}
    >
      {recent.length > 0 && (
        <>
          <h6 className="fw-bold"
            style={{
              fontSize: "12px",
              color: "#000000",
              marginBottom: "8px",
            }}
          >
            Recent searches
          </h6>
          <div className="d-flex flex-wrap" style={{ gap: "5px" }}>
            {recent.map((item, i) => (
              <span
                key={i}
                onClick={() => handleClick(item)} className="d-flex align-items-center"
                style={{
                  padding: "4px 10px",
                  background: "#fbfbfb",
                  borderRadius: "5px",
                  fontSize: "12px",
                  border: "1px solid #ddd",
                  cursor: "pointer",
                  gap: "4px",
                }}
              >
                <FaArrowTrendUp size={12} /> {item}
              </span>
            ))}
          </div>
        </>
      )}

      <h6 className="fw-bold"
        style={{
          fontSize: "12px",
          color: "#070707",
          marginTop: "10px",
        }}
      >
        Trending searches
      </h6>
      <div className="d-flex flex-wrap" style={{  gap: "5px"}}>
        {filtered.map((item, i) => (
          <span
            key={i}
            onClick={() => handleClick(item)}
            style={{
              padding: "7px 12px",
              background: "#fbfbfb",
              border: "1px solid #ddd",
              borderRadius: "5px",
              fontSize: "12px",
              cursor: "pointer",
              gap: "4px",
            }} className="d-flex align-items-center"
          >
            <FaArrowTrendUp size={12} /> {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default SearchDropdown;
