import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { CiStar } from "react-icons/ci";
import { TiGroup } from "react-icons/ti";
import { Alert, Spinner } from "react-bootstrap";

function Banner() {
  const [banner, setBanner] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchBanner = async () => {
    try {
      setError(null);
      const res = await fetch("http://localhost:5000/api/banner");
      if (!res.ok) throw new Error("Failed to fetch banner");
      const data = await res.json();
      setBanner(data.banner);
    } catch (err) {
      console.error("Error fetching banner:", err);
      setError("Failed to load banner");
    }
  };

  const fetchCategories = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log("Fetching categories from API...");
      const response = await fetch("http://localhost:5000/api/categories");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch categories`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      // Check if data has categories array
      if (data.categories && Array.isArray(data.categories)) {
        // Debug: Log each category
        data.categories.forEach(category => {
          console.log(`Category: ${category.name}`);
        });

        console.log(`Found ${data.categories.length} categories`);

        // Sort by creation date (oldest/first created first)
        const sortedCategories = data.categories.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(a.createdAt) - new Date(b.createdAt);
          }
          // Fallback to name if date missing
          return a.name?.localeCompare(b.name) || 0;
        });

        setCategories(sortedCategories);
      } else {
        console.warn("No categories array in response:", data);
        setCategories([]);
        setError("No categories available");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanner();
    fetchCategories();
  }, []);

  // Handle category click and route to respective page
  const handleCategoryClick = (category) => {
    console.log("Category clicked:", { name: category.name });

    if (!category.name) {
      return;
    }

    const nameLower = category.name.toLowerCase();

    // Only "Salon for Women" navigates to /salon
    if (nameLower.includes('salon') && nameLower.includes('women')) {
      navigate('/salon');
      return;
    }

    // For all other categories, route to home page (banner page)
    navigate('/');
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  // Render category image with fallback
  const renderCategoryImage = (category) => {
    const imageUrl = category.img
      ? `http://localhost:5000${category.img}`
      : 'http://localhost:5000/assets/default-category.png';

    return (
      <div>
        <img
          src={imageUrl}
          alt={category.name}
          style={{ width: '60px', height: '60px', objectFit: 'cover' }}
        />
      </div>
    );
  };

  // Helper function to render a row with exactly 3 items
  const renderThreeColumnRow = (rowCategories, rowIndex) => {
    // Create array with 3 items, filling empty slots with null
    const items = [];
    for (let i = 0; i < 3; i++) {
      if (i < rowCategories.length) {
        items.push(rowCategories[i]);
      } else {
        items.push(null); // Empty slot
      }
    }

    return (
      <div key={`row-${rowIndex}`} className="first-row d-flex">
        {items.map((category, index) => {
          // If category is null (empty slot), render empty div
          if (!category) {
            return (
              <div
                key={`empty-${rowIndex}-${index}`}
                className=" second-row-item"

              >
                {/* Empty placeholder */}
              </div>
            );
          }

          return (
            <div
              key={category._id || `category-${rowIndex}-${index}`}
              className="second-row-item d-flex flex-column align-items-center position-relative"
              onClick={() => handleCategoryClick(category)}
            >
              <div className="img-box w-100 d-flex justify-content-center align-items-center ">
                {renderCategoryImage(category)}
              </div>
              <p className="first-row-text text-center mb-0 mt-2">{category.name}</p>
            </div>
          );
        })}
      </div>
    );
  };

  // Dynamic layout based on number of categories
  const renderCategoriesGrid = () => {
    const totalCategories = categories.length;

    if (totalCategories === 0) {
      return (
        <Alert variant="info" className="text-center">
          No categories available. Add categories in the admin panel.
        </Alert>
      );
    }

    // For 1-2 categories: show in first row only
    if (totalCategories <= 2) {
      return (
        <>
          <div className="first-row d-flex">
            {categories.map((c, index) => (
              <div
                key={c._id || index}
                className="first-row-item d-flex align-items-center justify-content-between"
                onClick={() => handleCategoryClick(c)}>
                <p className="first-row-text text-center mb-0">{c.name}</p>
                {renderCategoryImage(c)}
              </div>
            ))}
          </div>
          {/* Empty second row with 3 invisible items */}
          {renderThreeColumnRow([], 1)}
        </>
      );
    }

    // For 3 categories: show 2 in first row, 1 in second row (with 2 empty spaces)
    if (totalCategories === 3) {
      const firstRow = categories.slice(0, 2);
      const secondRow = categories.slice(2, 3); // Just 1 item

      return (
        <>
          <div className="first-row d-flex">
            {firstRow.map((c, index) => (
              <div
                key={c._id || index}
                className="first-row-item d-flex align-items-center justify-content-between"
                onClick={() => handleCategoryClick(c)}>
                <p className="first-row-text text-center mb-0">{c.name}</p>
                {renderCategoryImage(c)}
              </div>
            ))}
          </div>
          {/* Second row with 1 item and 2 empty spaces */}
          {renderThreeColumnRow(secondRow, 1)}
        </>
      );
    }

    // For 4 categories: show 2 in first row, 2 in second row (with 1 empty space)
    if (totalCategories === 4) {
      const firstRow = categories.slice(0, 2);
      const secondRow = categories.slice(2, 4); // 2 items

      return (
        <>
          <div className="first-row d-flex">
            {firstRow.map((c, index) => (
              <div
                key={c._id || index}
                className="first-row-item d-flex align-items-center justify-content-between"
                onClick={() => handleCategoryClick(c)}
              >
                <p className="first-row-text text-center mb-0">{c.name}</p>
                {renderCategoryImage(c)}
              </div>
            ))}
          </div>
          {/* Second row with 2 items and 1 empty space */}
          {renderThreeColumnRow(secondRow, 1)}
        </>
      );
    }

    // For 5 categories: show 2 in first row, 3 in second row (full row)
    if (totalCategories === 5) {
      const firstRow = categories.slice(0, 2);
      const secondRow = categories.slice(2, 5); // 3 items

      return (
        <>
          <div className="first-row d-flex">
            {firstRow.map((c, index) => (
              <div
                key={c._id || index}
                className="categories first-row-item d-flex align-items-center justify-content-between"
                onClick={() => handleCategoryClick(c)}
              >
                <p className="first-row-text text-center mb-0">{c.name}</p>
                {renderCategoryImage(c)}
              </div>
            ))}
          </div>
          {/* Second row with all 3 items (no empty spaces) */}
          {renderThreeColumnRow(secondRow, 1)}
        </>
      );
    }

    // For 6 or more categories
    if (totalCategories >= 6) {
      const firstRow = categories.slice(0, 2);
      const secondRow = categories.slice(2, 5);
      const remainingCategories = categories.slice(5);

      // Calculate how many additional rows we need
      const totalAdditionalRows = Math.ceil(remainingCategories.length / 3);
      const additionalRows = [];

      // Create additional rows
      for (let i = 0; i < totalAdditionalRows; i++) {
        const startIndex = i * 3;
        const endIndex = startIndex + 3;
        const rowCategories = remainingCategories.slice(startIndex, endIndex);
        additionalRows.push(renderThreeColumnRow(rowCategories, i + 2));
      }

      return (
        <>
          <div className="first-row d-flex">
            {firstRow.map((c, index) => (
              <div
                key={c._id || index}
                className="first-row-item d-flex align-items-center justify-content-between"
                onClick={() => handleCategoryClick(c)}
              >
                <p className="first-row-text text-center mb-0">{c.name}</p>
                {renderCategoryImage(c)}
              </div>
            ))}
          </div>

          {/* Second row */}
          {renderThreeColumnRow(secondRow, 1)}

          {/* Additional rows */}
          {additionalRows}
        </>
      );
    }
  };

  return (
    <Container className="contain" style={{ marginTop: "50px" }}>
      {error && (
        <Alert variant="warning" className="mb-3">
          {error}
        </Alert>
      )}

      <Row>
        <Col md={6}>
          <h3 className="home fw-bold">
            Home services at your <br /> doorstep
          </h3>

          <div className="service-box" >
            <p className="service-heading home">What are you looking for?</p>

            {/* Dynamic categories grid with exact same layout logic */}
            {renderCategoriesGrid()}
          </div>

          {/* Ratings Row */}
          <Row className="mt-4 img-fluid">
            <Col xs={6}>
              <Row>
                <Col xs={3} style={{ width: "40px", marginTop: "10px" }}>
                  <CiStar style={{ fontSize: "32px" }} />
                </Col>
                <Col className="font">
                  <p style={{ color: "rgb(84,84,84)" }}>
                    <span
                      className="fw-bold"
                      style={{
                        fontSize: "20px",
                        color: "black",
                      }}
                    >
                      4.8
                    </span>
                    <br /> Service Rating*
                  </p>
                </Col>
              </Row>
            </Col>

            <Col xs={6}>
              <Row>
                <Col xs={3} style={{ width: "40px", marginTop: "10px" }}>
                  <TiGroup style={{ fontSize: "32px" }} />
                </Col>
                <Col className="font">
                  <p style={{ color: "rgb(84,84,84)" }}>
                    <span
                      className="fw-bold"
                      style={{
                        fontSize: "20px",
                        color: "black",
                      }}
                    >
                      12M+
                    </span>
                    <br /> Customers Globally*
                  </p>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>

        {/* Banner Image */}
        <Col md={6} className="text-center">
          {banner ? (
            <img
              src={`http://localhost:5000${banner.img}`}
              alt="Banner"
              className="banner-img w-100"
              style={{ maxHeight: "400px", objectFit: "cover", borderRadius: "10px" }}
              onError={(e) => {
                e.target.src = 'http://localhost:5000/assets/default.png';
              }}
            />
          ) : (
            <div className="text-muted">No banner available</div>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Banner;