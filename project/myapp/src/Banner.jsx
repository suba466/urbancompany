import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { CiStar } from "react-icons/ci";
import { TiGroup } from "react-icons/ti";
import { Alert, Spinner } from "react-bootstrap";
import API_URL, { getAssetPath } from "./config";

function Banner() {
  const [banner, setBanner] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchBanner = async () => {
    try {
      setError(null);
      const res = await fetch(`${API_URL}/api/banner`);
      if (!res.ok) throw new Error("Failed to fetch banner");
      const data = await res.json();
      setBanner(data.banner);
    } catch (err) {
      console.warn("API banner fetch failed, falling back to local data");
      try {
        const basePath = import.meta.env.BASE_URL || '/';
        const res = await fetch(`${basePath}data.json`);
        const data = await res.json();
        setBanner(data.banner);
      } catch (fallbackErr) {
        setError("Failed to load banner");
      }
    }
  };

  const fetchCategories = async () => {
    try {
      setError(null);
      setLoading(true);

      let data;
      try {
        const response = await fetch(`${API_URL}/api/categories`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        data = await response.json();
      } catch (apiErr) {
        console.warn("API categories fetch failed, falling back to local data");
        try {
          const basePath = import.meta.env.BASE_URL || '/';
          const res = await fetch(`${basePath}data.json`);
          const staticData = await res.json();
          data = { categories: staticData.categories };
        } catch (e) {
          // If fallback fails
        }
      }

      if (data.categories && Array.isArray(data.categories)) {
        setCategories(data.categories);
      } else {
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

  const handleCategoryClick = (category) => {
    if (!category.name) return;
    const nameLower = category.name.toLowerCase();
    if (nameLower.includes('salon')) {
      navigate('/salon');
    } else {
      navigate('/');
    }
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

  const renderCategoryImage = (category) => {
    let imageUrl = getAssetPath(category.img || '/assets/default-category.png');
    return (
      <div>
        <img
          src={imageUrl}
          alt={category.name}
          style={{ width: '60px', height: '60px', objectFit: 'cover' }}
          onError={(e) => { e.target.src = getAssetPath('/assets/default-category.png'); }}
        />
      </div>
    );
  };

  const renderThreeColumnRow = (rowCategories, rowIndex) => {
    const items = [];
    for (let i = 0; i < 3; i++) {
      items.push(i < rowCategories.length ? rowCategories[i] : null);
    }

    return (
      <div key={`row-${rowIndex}`} className="first-row d-flex">
        {items.map((category, index) => {
          if (!category) return <div key={`empty-${rowIndex}-${index}`} className="second-row-item"></div>;
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

  const renderCategoriesGrid = () => {
    const totalCategories = categories.length;
    if (totalCategories === 0) return <Alert variant="info" className="text-center">No categories available.</Alert>;

    if (totalCategories <= 2) {
      return (
        <>
          <div className="first-row d-flex">
            {categories.map((c, index) => (
              <div key={index} className="first-row-item d-flex align-items-center justify-content-between" onClick={() => handleCategoryClick(c)}>
                <p className="first-row-text text-center mb-0">{c.name}</p>
                {renderCategoryImage(c)}
              </div>
            ))}
          </div>
          {renderThreeColumnRow([], 1)}
        </>
      );
    }

    // Logic for 3+ categories (same as before)
    const firstRow = categories.slice(0, 2);
    const remaining = categories.slice(2);
    const rows = [];

    // Calculate remainder rows
    for (let i = 0; i < Math.ceil(remaining.length / 3); i++) {
      rows.push(renderThreeColumnRow(remaining.slice(i * 3, (i + 1) * 3), i + 1));
    }

    return (
      <>
        <div className="first-row d-flex">
          {firstRow.map((c, index) => (
            <div key={index} className="first-row-item d-flex align-items-center justify-content-between" onClick={() => handleCategoryClick(c)}>
              <p className="first-row-text text-center mb-0">{c.name}</p>
              {renderCategoryImage(c)}
            </div>
          ))}
        </div>
        {rows}
      </>
    );
  };

  return (
    <Container className="contain" style={{ marginTop: "50px" }}>
      {error && <Alert variant="warning" className="mb-3">{error}</Alert>}
      <Row>
        <Col md={6}>
          <h3 className="home fw-bold">Home services at your <br /> doorstep</h3>
          <div className="service-box">
            <p className="service-heading home">What are you looking for?</p>
            {renderCategoriesGrid()}
          </div>
          {/* Ratings part omitted for brevity but logic remains same, just pure JSX */}
          <Row className="mt-4 img-fluid">
            <Col xs={6}>
              <Row>
                <Col xs={3} style={{ width: "40px", marginTop: "10px" }}>
                  <CiStar style={{ fontSize: "32px" }} />
                </Col>
                <Col className="font">
                  <p style={{ color: "rgb(84,84,84)" }}>
                    <span className="fw-bold" style={{ fontSize: "20px", color: "black" }}>4.8</span>
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
                    <span className="fw-bold" style={{ fontSize: "20px", color: "black" }}>12M+</span>
                    <br /> Customers Globally*
                  </p>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
        <Col md={6} className="text-center">
          {banner ? (
            <img
              src={banner.img.startsWith('http') ? banner.img : getAssetPath(banner.img)}
              alt="Banner"
              className="banner-img w-100"
              style={{ maxHeight: "400px", objectFit: "cover", borderRadius: "10px" }}
              onError={(e) => { e.target.src = getAssetPath('/assets/default.png'); }}
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