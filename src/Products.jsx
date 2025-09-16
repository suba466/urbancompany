import { Link } from "react-router-dom";

function Products() {
  const items = [
    { id: 1, name: "Laptop" },
    { id: 2, name: "Headphones" },
    { id: 3, name: "Phone" }
  ];

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Products List</h2>
      {items.map((item) => (
        <p key={item.id}>
          <Link to={`/product/${item.id}`}>{item.name}</Link>
        </p>
      ))}
    </div>
  );
}

export default Products;
