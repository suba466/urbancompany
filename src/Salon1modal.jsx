import { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { Button, ModalBody, Form, Row, Col } from "react-bootstrap";
import { IoTime } from "react-icons/io5";
import { TbCirclePercentageFilled } from "react-icons/tb";

function Salon1modal({ show, onHide, selectedItem, refreshCarts}) {
  const [loadingDropdownKey, setLoadingDropdownKey] = useState(null);
  const [dropdownModal, setDropdownModal] = useState({
    show: false,
    label: "",
    options: [],
    selected: "",
    type: "",
  });
  const [totalPrice, setTotalPrice] = useState(2195);
  const [discountedPrice, setDiscountedPrice] = useState(null);

  const initialServices = {
    "waxingOptions:Full arms (including underarms)": {
      title: "Full arms (including underarms)",
      price: 599,
      count: 1,
      content: "Chocolate Roll on",
    },
    "waxingOptions:Full legs": {
      title: "Full legs",
      price: 499,
      count: 1,
      content: "Chocolate Roll on",
    },
    "facialOptions:O3+ shine & glow facial": {
      title: "O3+ shine & glow facial",
      price: 1699,
      count: 1,
      content: "Facial",
    },
    "facialHairOptions:Eyebrow": {
      title: "Eyebrow",
      price: 49,
      count: 1,
      content: "Threading",
    },
    "facialHairOptions:Upper lip": {
      title: "Upper lip",
      price: 49,
      count: 1,
      content: "Threading",
    },
  };

  const [selectedServices, setSelectedServices] = useState(initialServices);

  const waxingOptions = [
    {
      label: "Full arms (including underarms)",
      options: [
        { name: "RICA White Chocolate Wax", price: 499 },
        { name: "Chocolate Roll on", price: 599 },
        { name: "Honey Wax", price: 319 },
        { name: "RICA Roll on", price: 679 },
      ],
    },
    {
      label: "Full legs",
      options: [
        { name: "Honey Wax", price: 319 },
        { name: "RICA White Chocolate Wax", price: 549 },
        { name: "Chocolate Roll on", price: 499 },
        { name: "RICA Roll on", price: 629 },
      ],
    },
    {
      label: "Underarms",
      options: [
        { name: "Honey Wax", price: 49 },
        { name: "RICA peel-off", price: 149 },
      ],
    },
    {
      label: "Bikini line",
      options: [
        { name: "Honey Premium Wax", price: 249 },
        { name: "RICA peel-off", price: 249 },
      ],
    },
    {
      label: "Half arms",
      options: [
        { name: "Honey Wax", price: 219 },
        { name: "RICA White Chocolate Wax", price: 319 },
      ],
    },
    {
      label: "Half legs",
      options: [
        { name: "RICA White Chocolate Wax", price: 369 },
        { name: "Honey Wax", price: 219 },
      ],
    },
    {
      label: "Stomach",
      options: [
        { name: "Chocolate Roll on", price: 569 },
        { name: "Honey Wax", price: 319 },
        { name: "RICA White Chocolate Wax", price: 469 },
        { name: "RICA Roll on", price: 619 },
      ],
    },
    {
      label: "Back",
      options: [
        { name: "RICA Roll on", price: 669 },
        { name: "RICA White Chocolate Wax", price: 519 },
        { name: "Chocolate Roll on", price: 619 },
        { name: "Honey Wax", price: 469 },
      ],
    },
    {
      label: "Bikini",
      options: [
        { name: "RICA peel-off", price: 1299 },
        { name: "Honey Premium Wax", price: 949 },
      ],
    },
    {
      label: "Full body",
      options: [
        { name: "Honey Wax", price: 1369 },
        { name: "RICA White Chocolate Wax", price: 1919 },
        { name: "RICA Roll on", price: 2019 },
        { name: "Chocolate Roll on", price: 1619 },
      ],
    },
    { label: "I don't need anything", options: [] },
  ];

  // ---------------- Facial ----------------
  const facial = [
    { label: "Sara Lightening glow facial", price: 949 },
    { label: "Elysian firming wine glow facial", price: 1049 },
    { label: "O3+ shine & glow facial", price: 1699 },
    { label: "O3+ power brightening facial", price: 1999 },
    { label: "Sara fruit cleanup", price: 699 },
    { label: "O3+ tan clear cleanup", price: 849 },
    { label: "I don't need anything" },
  ];

  // ---------------- Pedicure ----------------
  const pedicure = [
    { label: "Elysian Chocolate & Vanilla pedicure", price: 849 },
    { label: "Elysian Candle Spa pedicure", price: 999 },
    { label: "Elysian British Rose pedicure", price: 759 },
    { label: "I don't need anything" },
  ];

  // ---------------- Manicure ----------------
  const manicure = [
    { label: "Cut,file & polish - Hands", price: 149 },
    { label: "Elysian British Rose manicure", price: 649 },
    { label: "Elysian Chocolate & Vanilla manicure", price: 699 },
    { label: "Elysian Candle Spa manicure", price: 899 },
    { label: "I don't need anything" },
  ];

  // ---------------- Bleach ----------------
  const bleach = [
    {
      label: "Face & neck",
      options: [
        { name: "Bleach", price: 299 },
        { name: "Detan", price: 349 },
      ],
    },
    {
      label: "Full legs",
      options: [
        { name: "Detan", price: 499 },
        { name: "Bleach", price: 499 },
      ],
    },
    {
      label: "Full body",
      options: [
        { name: "Detan", price: 1499 },
        { name: "Bleach", price: 1499 },
      ],
    },
    {
      label: "Full arms",
      options: [
        { name: "Detan", price: 349 },
        { name: "Bleach", price: 349 },
      ],
    },
    {
      label: "Chest",
      options: [
        { name: "Detan", price: 399 },
        { name: "Bleach", price: 399 },
      ],
    },
    {
      label: "Back",
      options: [
        { name: "Detan", price: 399 },
        { name: "Bleach", price: 399 },
      ],
    },
    { label: "I don't need anything", options: [] },
  ];

  // ---------------- Facial Hair ----------------
  const facialHair = [
    {
      label: "Eyebrow",
      options: [{ name: "Threading", price: 49 }],
    },
    {
      label: "Forehead",
      options: [
        { name: "Threading", price: 59 },
        { name: "Face waxing", price: 99 },
      ],
    },
    {
      label: "Face",
      options: [
        { name: "Face waxing", price: 399 },
        { name: "Threading", price: 149 },
      ],
    },
    {
      label: "Sidelocks",
      options: [
        { name: "Threading", price: 49 },
        { name: "Face waxing", price: 99 },
      ],
    },
    {
      label: "Upper lip",
      options: [
        { name: "Face waxing", price: 69 },
        { name: "Threading", price: 49 },
      ],
    },
    {
      label: "Neck",
      options: [
        { name: "Threading", price: 149 },
        { name: "Face waxing", price: 199 },
      ],
    },
    {
      label: "Jawline",
      options: [
        { name: "Face waxing", price: 99 },
        { name: "Threading", price: 99 },
      ],
    },
    {
      label: "Chin",
      options: [
        { name: "Threading", price: 29 },
        { name: "Face waxing", price: 99 },
      ],
    },
    { label: "I don't need anything", options: [] },
  ];

  // ---------------- Hair Care ----------------
  const hair = [
    { label: "Hair color application", price: 249 },
    { label: "Henna mehendi application", price: 399 },
    { label: "Head massage (10 mins)", price: 199 },
    { label: "Head massage (20 mins)", price: 349 },
    { label: "I don't need anything" },
  ];

  // Reset when modal opens
  useEffect(() => {
    if (show) {
      setSelectedServices(initialServices);
      setTotalPrice(2195);
      setDiscountedPrice(null);
      setLoadingDropdownKey(null);
      setDropdownModal({
        show: false,
        label: "",
        options: [],
        selected: "",
        type: "",
      });
    }
  }, [show]);

  // Calculate total and discount
  useEffect(() => {
    const basePrice = 2195;
    const extraPrice = Object.entries(selectedServices)
      .filter(([key]) => !initialServices[key])
      .reduce((sum, [, item]) => {
        // ensure numeric
        const p = Number(item?.price || 0);
        return sum + (isNaN(p) ? 0 : p);
      }, 0);

    const total = basePrice + extraPrice;
    setTotalPrice(total);

    const threshold = basePrice + 905;
    if (total >= threshold) {
      const discount = total * 0.25;
      setDiscountedPrice(total - discount);
    } else {
      setDiscountedPrice(null);
    }
  }, [selectedServices]);

  // Checkbox handler — normalize price to Number
  const handleCheckboxChange = (section, label, option, isChecked) => {
    setSelectedServices((prev) => {
      const updated = { ...prev };
      const key = `${section}:${label}`;
      if (isChecked) {
        // option may be an {name,price} or the item itself with price property
        const rawPrice = option?.price ?? option?.price === 0 ? option.price : option?.price ?? option;
        const price = Number(rawPrice ?? 0);
        updated[key] = {
          title: label,
          price: isNaN(price) ? 0 : price,
          count: 1,
          content: option?.name ?? option?.label ?? option ?? "No option",
        };
      } else {
        delete updated[key];
      }
      return updated;
    });
  };

const handleAdd = async () => {
  const content = Object.entries(selectedServices).map(([key, item]) => ({
    section: key.split(":")[0],
    title: item.title,
    price: item.price,
    count: item.count,
    content: item.content,
  }));

  const payload = {
    title: selectedItem?.title,
    price: discountedPrice || totalPrice,
    content,
  };

  try {
    const response = await fetch("http://localhost:5000/api/addcarts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      alert("Added to cart!");
      if (typeof refreshCarts === "function") refreshCarts(); // 👈 refresh parent cart
      onHide();
    } else {
      console.error("Failed to add to cart");
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
  }
};


  // Render service sections
  const renderSection = (sectionName, items, displayName) => (
    <>
      <h5 className="fw-semibold mt-3">{displayName}</h5>
      <Form>
        {items.map((item, idx) => {
          const key = `${sectionName}:${item.label}`;
          const isChecked = !!selectedServices[key];
          const selectedOption = selectedServices[key]?.content;

          return (
            <Row key={idx} className="mb-3 align-items-center">
              <Col xs={7}>
                <Form.Check
                  type="checkbox"
                  label={item.label}
                  checked={isChecked}
                  onChange={(e) =>
                    handleCheckboxChange(
                      sectionName,
                      item.label,
                      item.options ? item.options[0] : item,
                      e.target.checked
                    )
                  }
                  className="fw-semibold"
                  style={{ fontSize: "14px" }}
                />

                {/* don't show price for "I don't need anything" */}
                {item.label !== "I don't need anything" && (
                  <div
                    style={{
                      fontSize: "12px",
                      marginLeft: "25px",
                      color: "#7d7c7cff",
                    }}
                  >
                    ₹
                    {selectedServices[key]
                      ? selectedServices[key].price
                      : item.options
                      ? Number(item.options[0]?.price ?? 0)
                      : Number(item.price ?? 0)}
                  </div>
                )}
              </Col>

              <Col xs={5} className="d-flex justify-content-end">
                {item.options && item.options.length > 0 && item.label !== "I don't need anything" && (
                  <div
                    className="drop"
                    onClick={() => {
                      const k = `${sectionName}:${item.label}`;
                      setLoadingDropdownKey(k);
                      setDropdownModal({
                        show: true,
                        label: item.label,
                        options: item.options,
                        selected: selectedOption || item.options[0].name,
                        type: sectionName,
                      });
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {loadingDropdownKey === key ? (
                      <div
                        className="spinner-border spinner-border-sm text-secondary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      selectedOption || item.options[0].name
                    )}
                  </div>
                )}
              </Col>
            </Row>
          );
        })}
      </Form>
      <hr />
    </>
  );

  return (
    <>
      {/* MAIN MODAL */}
      <Modal show={show} onHide={onHide} centered contentClassName="custom-modal">
        <Button onClick={onHide} className="closebtn" style={{ padding: "0px" }}>
          X
        </Button>

        {selectedItem && (
          <>
            <div
              className="p-3"
              style={{ backgroundColor: "#ede1d4", borderRadius: "10px" }}
            >
              <h4 className="fw-semibold">{selectedItem.title}</h4>
              <p>
                <IoTime /> Service time: 3 hrs 50 mins
              </p>
            </div>

            <div className="p-3 scroll">
              {renderSection("waxingOptions", waxingOptions, "Waxing")}
              {renderSection("facialOptions", facial, "Facial & cleanup")}
              {renderSection("pedicureOptions", pedicure, "Pedicure")}
              {renderSection("manicureOptions", manicure, "Manicure")}
              {renderSection("facialHairOptions", facialHair, "Facial hair removal")}
              {renderSection("bleachOptions", bleach, "Bleach & detan")}
              {renderSection("hairOptions", hair, "Hair Care")}
            </div>

            {/* DISCOUNT BOX */}
            <div
              style={{
                backgroundColor: "#b3d5b8ff",
                color: "#37503bff",
                fontSize: "12px",
              }}
              className="text-center p-2 fw-semibold"
            >
              {discountedPrice ? (
                <>You saved ₹{(totalPrice - discountedPrice).toFixed(0)}! in this package</>
              ) : (
                <>
                  <TbCirclePercentageFilled /> Add ₹
                  {Math.max(0, 3100 - totalPrice)} more to get 25% discount
                </>
              )}
            </div>

            {/* PRICE + BUTTON */}
            <Row>
              <Col className="p-4 d-flex align-items-center">
                {discountedPrice ? (
                  <>
                    <span className="fw-semibold" style={{ fontSize: "18px" }}>
                      ₹{discountedPrice.toFixed(0)}
                    </span>
                    <span className="text-muted ms-2" style={{ textDecoration: "line-through", fontSize: "14px" }}>
                      ₹{totalPrice}
                    </span>
                  </>
                ) : (
                  <span className="fw-semibold" style={{ fontSize: "18px" }}>
                    ₹{totalPrice}
                  </span>
                )}
              </Col>
              <Col className="p-3 fw-semibold">
                <Button
                  className="fw-semibold"
                  style={{ width: "100%", height: "50px", backgroundColor: "#7330deff" }}
                  onClick={handleAdd}
                >
                  Add to cart
                </Button>
              </Col>
            </Row>
          </>
        )}
      </Modal>

      {/* DROPDOWN MODAL */}
      <Modal
        show={dropdownModal.show}
        onHide={() => {
          setDropdownModal({ ...dropdownModal, show: false });
          setLoadingDropdownKey(null);
        }}
        centered
      >
        <Button
          onClick={() => {
            setDropdownModal({ ...dropdownModal, show: false });
            setLoadingDropdownKey(null);
          }}
          className="closebtn"
          style={{ padding: "0px" }}
        >
          X
        </Button>

        <Modal.Header>
          <Modal.Title className="fw-semibold">{dropdownModal.label}</Modal.Title>
        </Modal.Header>

        <ModalBody>
          <Form>
            {dropdownModal.options?.map((opt, i) => {
              const key = `${dropdownModal.type}:${dropdownModal.label}`;
              const isSelected = selectedServices[key]?.content === opt.name;
              return (
                <div key={i} className="d-flex justify-content-between align-items-center mb-2 px-2">
                  <Form.Check
                    type="radio"
                    name="dropdownOptions"
                    label={opt.name}
                    checked={isSelected}
                    onChange={() => {
                      const currentKey = `${dropdownModal.type}:${dropdownModal.label}`;
                      setDropdownModal({ ...dropdownModal, selected: opt.name, show: false });
                      setLoadingDropdownKey(null);
                      setSelectedServices((prev) => {
                        const updated = { ...prev };
                        if (updated[currentKey]) {
                          updated[currentKey] = {
                            ...updated[currentKey],
                            content: opt.name,
                            price: Number(opt.price || 0),
                          };
                        }
                        return updated;
                      });
                    }}
                  />
                  <div className="fw-semibold" style={{ fontSize: "12px" }}>₹{Number(opt.price || 0)}</div>
                </div>
              );
            })}
          </Form>
        </ModalBody>
      </Modal>
    </>
  );
}

export default Salon1modal;
