import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { Button, ModalBody, Form, Row, Col, Dropdown } from 'react-bootstrap';
import { IoTime } from "react-icons/io5";
import { TbCirclePercentageFilled } from "react-icons/tb";

function Salon1modal({ show, onHide, selectedItem }) {
  const [loading, setLoading] = useState(false);
  const [dropdownModal, setDropdownModal] = useState({
    show: false,
    label: "",
    options: [],
    selected: "",
    type: ""
  });
  const [selectedServices, setSelectedServices] = useState({
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
  });


  // Waxing 
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
    {label: "Full legs",
      options: [
        { name: "Honey Wax", price: 319 },
        { name: "RICA White Chocolate Wax", price: 549 },
        { name: "Chocolate Roll on", price: 499 },
        { name: "RICA Roll on", price: 629 },
      ],
    },
    { label: "Underarms", 
      options: [ { name: "Honey Wax", price: 49 }, 
                 { name: "RICA peel-off", price: 149 }]},
    { label: "Bikini line", 
      options: [ { name: "Honey Premium Wax", price: 249 }, 
                 { name: "RICA peel-off", price: 249 }]},
    { label: "Half arms", options: [ { name: "Honey Wax", price: 219 },
                                     { name: "RICA White Chocolate Wax", price: 319 }]}, 
    { label: "Half legs", options: [ { name: "RICA White Chocolate Wax", price: 369 }, 
                                     { name: "Honey Wax", price: 219 }] }, 
    { label: "Stomach", options: [ { name: "Chocolate Roll on", price: 569 }, 
                                   { name: "Honey Wax", price: 319 }, 
                                   { name: "RICA White Chocolate Wax", price: 469 }, 
                                   { name: "RICA Roll on", price: 619 }]}, 
    { label: "Back", options: [ { name: "RICA Roll on", price: 669 }, 
                                { name: "RICA White Chocolate Wax", price: 519 }, 
                                { name: "Chocolate Roll on", price: 619 }, 
                                { name: "Honey Wax", price: 469 }]}, 
    { label: "Bikini", options: [ { name: "RICA peel-off", price: 1299 }, 
                                  { name: "Honey Premium Wax", price: 949 }] }, 
    { label: "Full body", options: [ { name: "Honey Wax", price: 1369 }, 
                                     { name: "RICA White Chocolate Wax", price: 1919 }, 
                                     { name: "RICA Roll on", price: 2019 }, 
                                     { name: "Chocolate Roll on", price: 1619 }]},
    { label: "I don't need anything", options: [] },
  ];

  // ---------------- Facial ----------------
  const facial = [
    { label: "Sara Lightening glow facial", price: "949" },
    { label: "Elysian firming wine glow facial", price: "1049" },
    { label: "O3+ shine & glow facial", price: "1699" },
    { label: "O3+ power brightening facial", price: "1999" },
    { label: "Sara fruit cleanup", price: "699" },
    { label: "O3+ tan clear cleanup", price: "849" },
    { label: "I don't need anything" },
  ];

  // ---------------- Pedicure ----------------
  const pedicure = [
    { label: "Elysian Chocolate & Vanilla pedicure", price: "849" },
    { label: "Elysian Candle Spa pedicure", price: "999" },
    { label: "Elysian British Rose pedicure", price: "759" },
    { label: "I don't need anything" },
  ];

  // ---------------- Manicure ----------------
  const manicure = [
    { label: "Cut,file & polish - Hands", price: "149" },
    { label: "Elysian British Rose manicure", price: "649" },
    { label: "Elysian Chocolate & Vanilla manicure", price: "699" },
    { label: "Elysian Candle Spa manicure", price: "899" },
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
    { label: "Full legs", options: [ {name:"Detan",price:499}, 
                                     { name: "Bleach", price:499 },]}, 
    { label: "Full body", options: [ {name:"Detan",price:1499}, 
                                     { name: "Bleach", price:1499 },]}, 
    { label: "Full arms", options: [ {name:"Detan",price:349}, 
                                     { name: "Bleach", price:349 },]}, 
    { label: "Chest", options: [ {name:"Detan",price:399}, 
                                 { name: "Bleach", price:399 },]}, 
    { label: "Back", options: [ {name:"Detan",price:399}, 
                                { name: "Bleach", price:399 },]}, 
    { label: "I don't need anything", options: [] } ];

  // ---------------- Facial Hair ----------------
  const facialHair = [
    {
      label: "Eyebrow",
      options: [{ name: "Threading", price: 49 }],
    },
    { label: "Forehead", options: [ { name: "Threading", price: 59 }, 
                                    {name:"Face waxing",price:99}]}, 
    { label: "Face", options: [ {name:"Face waxing",price:399}, 
                                { name: "Threading", price: 149 },]}, 
    { label: "Sidelocks", options: [ { name: "Threading", price: 49 }, 
                                     {name:"Face waxing",price:99}]}, 
    { label: "Upper lip", options: [ {name:"Face waxing",price:69}, 
                                     { name: "Threading", price:49 },]}, 
    { label: "Neck", options: [ { name: "Threading", price: 149 }, 
                                {name:"Face waxing",price:199}]}, 
    { label: "Jawline", options: [ {name:"Face waxing",price:99}, 
                                   { name: "Threading", price:99 },]}, 
    { label: "Chin", options: [ { name: "Threading", price: 29 }, 
                                {name:"Face waxing",price:99}]}, 
    { label: "I don't need anything", options: [] } ];
  ;
  // ---------------- Hair Care ----------------
  const hair = [
    { label: "Hair color application", price: "249" },
    { label: "Henna mehendi application", price: "399" },
    { label: "Head massage (10 mins)", price: "199" },
    { label: "Head massage (20 mins)", price: "349" },
    { label: "I don't need anything" },
  ];
  const handleCheckboxChange = (section, label, option, isChecked) => {
    setSelectedServices((prev) => {
      const updated = { ...prev };
      const key = `${section}:${label}`;
      if (isChecked) {
        updated[key] = {
          title: label,
          price: option?.price || 0,
          count: 1,
          content: option?.name || option || "No option",
        };
      } else {
        delete updated[key];
      }
      return updated;
    });
  };

  // -------- Handle Add to Cart --------
  const handleAdd = async () => {
    if (!selectedItem) return;

    const content = Object.entries(selectedServices).map(([key, item]) => ({
      section: key.split(":")[0],
      title: item.title,
      price: item.price,
      count: item.count,
      content: item.content,
    }));

    const payload = {
      title: selectedItem.title,
      price: selectedItem.price || "2920",
      originalPrice: selectedItem.originalPrice || "3894",
      content,
    };

    try {
      const res = await fetch("http://localhost:5000/api/addcarts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log("Cart updated:", data);
      alert("Added to cart!");
      onHide();
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  // -------- Render Section Helper --------
  const renderSection = (sectionName, items) => (
    <>
      <h5 className="fw-semibold mt-3">{sectionName.replace("Options", "")}</h5>
      <Form>
        {items.map((item, idx) => (
          <Row key={idx} className="mb-3 align-items-center">
            <Col xs={7}>
              <Form.Check
                type="checkbox"
                label={item.label}
                checked={!!selectedServices[`${sectionName}:${item.label}`]}
                onChange={(e) =>
                  handleCheckboxChange(
                    sectionName,
                    item.label,
                    item.options ? item.options[0] : item,
                    e.target.checked
                  )
                }
              />
              {item.price && <div style={{ fontSize: "10px", marginLeft: "25px" }}>₹{item.price}</div>}
            </Col>
            <Col xs={5} className="d-flex justify-content-end">
              {item.options && item.options.length > 0 && (
                <div
                  className="drop"
                  onClick={() =>
                    setDropdownModal({
                      show: true,
                      label: item.label,
                      options: item.options,
                      selected: item.options[0].name,
                      type: sectionName,
                    })
                  }>
                  {dropdownModal.label === item.label
                    ? dropdownModal.selected
                    : item.options[0].name}
                </div>
              )}
            </Col>
          </Row>
        ))}
      </Form>
      <hr />
    </>
  );

  // -------- JSX --------
  // -------- JSX --------
return (
  <>
    <Modal show={show} onHide={onHide} centered contentClassName="custom-modal">
      <Button onClick={onHide} className="closebtn" style={{ padding: "0px" }}>X</Button>
      {selectedItem && (
        <>
          <div className="p-3" style={{ backgroundColor: "#ede1d4", borderRadius: "10px" }}>
            <h4 className="fw-semibold">{selectedItem.title}</h4>
            <p><IoTime /> Service time: 3 hrs 50 mins</p>
          </div>

          <div className="p-3 scroll">
            {renderSection("waxingOptions", waxingOptions)}
            {renderSection("facialOptions", facial)}
            {renderSection("pedicureOptions", pedicure)}
            {renderSection("bleachOptions", bleach)}
            {renderSection("facialHairOptions", facialHair)}
            {renderSection("hairOptions", hair)}
          </div>

          <div>
            <div style={{ backgroundColor: "#2a7d35ff", color: "#fff", fontSize: "16px" }}
              className="fw-semibold text-center">
              <TbCirclePercentageFilled /> You are saving ₹974 in this package
            </div>
            <Row>
              <Col className='p-4'>
                <span className='fw-semibold'>₹2,920</span>
                <span style={{ fontSize: "13px", color: "#6c6c6cff", textDecoration: "line-through" }}>₹3,894</span>
              </Col>
              <Col className='p-3 fw-semibold'>
                <Button className='fw-semibold' style={{ width: "100%", height: "50px", backgroundColor: "#7330deff" }}
                  onClick={handleAdd}>
                  Add to cart
                </Button>
              </Col>
            </Row>
          </div>
        </>
      )}
    </Modal>

   
    {/* ---------- Dropdown Modal ---------- */}
    {/* ---------- Dropdown Modal ---------- */}
<Modal
  show={dropdownModal.show}
  onHide={() => setDropdownModal({ ...dropdownModal, show: false })}
  centered
>
  <Button
    onClick={() => setDropdownModal({ ...dropdownModal, show: false })}
    className="closebtn"
    style={{ padding: "0px" }}
  >
    X
  </Button>

  <Modal.Header>
    <Modal.Title className="fw-semibold">
      {dropdownModal.type.includes("waxing")
        ? "Choose the type of Waxing"
        : dropdownModal.type.includes("facial")
        ? "Choose the type of Facial"
        : dropdownModal.type.includes("pedicure")
        ? "Choose the type of Pedicure"
        : dropdownModal.type.includes("bleach")
        ? "Choose the type of Bleach or Detan"
        : dropdownModal.type.includes("hair")
        ? "Choose the type of Hair Care"
        : "Choose the type of Service"}
    </Modal.Title>
  </Modal.Header>

  <ModalBody>
    <Form>
      {dropdownModal.options.map((opt, i) => {
        const key = `${dropdownModal.type}:${dropdownModal.label}`;
        const isSelected = selectedServices[key]?.content === opt.name; 

        return (
          <div
            key={i}
            className="d-flex justify-content-between align-items-center mb-2 px-2"
            style={{ paddingBottom: "6px" }}>
            <Form.Check
              type="radio"
              name="dropdownOptions"
              id={`option-${i}`}
              label={opt.name}
              checked={isSelected} 
              onChange={() => {
                setDropdownModal({
                  ...dropdownModal,
                  selected: opt.name,
                  show: false,
                });

                setSelectedServices((prev) => {
                  const updated = { ...prev };
                  if (updated[key]) {
                    updated[key] = {
                      ...updated[key],
                      content: opt.name,
                      price: opt.price,
                    };
                  }
                  return updated;
                });
              }}
            />
            <div className="fw-semibold">₹{opt.price}</div>
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
