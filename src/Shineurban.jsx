import { useState, useRef, useEffect } from "react";
import { Carousel, Container, Row, Col, Card } from "react-bootstrap";
import { FaArrowLeft, FaArrowRight, FaStar } from "react-icons/fa";
import shine from "./assets/shine.webp";
import deepclean from "./assets/deepclean.webp";
import rowater from "./assets/rowater.webp";
import experts from "./assets/experts.webp";
import perfect from "./assets/perfect.webp";
import relax from "./assets/relax.webp";
import intense from "./assets/intense.webp";
import classic from "./assets/classic.webp";
import switch1 from "./assets/switch.png";
import switchbox from "./assets/switch box.webp";
import topload from "./assets/topload.webp";
import walldecor from "./assets/walldecor.png";
import automatic from "./assets/automatic.png";
import intenseclean from "./assets/intenseclean.png";
import img2 from "./assets/2.png";
import tap from "./assets/tap.jpeg";
import waxing from "./assets/waxing.png";
import cleanup from "./assets/cleanup.png";
import manicure from "./assets/manicure.png";
import haircare from "./assets/haircare.png";
import smartlocks from "./assets/smartlocks.webp";
function Shineurban() {
  const [index, setIndex] = useState(0);
  const [thirdIndex, setThirdIndex] = useState(0);
  const [isMob, setIsMob] = useState(window.innerWidth <= 576);
  const [isTab, setIsTab] = useState(window.innerWidth > 576 && window.innerWidth <= 1024);
  useEffect(() => {
    const handleResize = () => {
      setIsMob(window.innerWidth <= 576);
      setIsTab(window.innerWidth > 576 && window.innerWidth <= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const mobileSlides = [shine, deepclean, relax, rowater, experts, perfect, intense, classic, switch1];
  const tabSlides = [
    [shine, deepclean],
    [relax, rowater],
    [experts, perfect],
    [intense, classic],
    [switch1],
  ];
  const desktopSlides = [
    [shine, deepclean, relax],
    [rowater, experts, perfect],
    [intense, classic, switch1],
  ];
  const thirdCarousel = [
    { img: intense, title: "Intense bathroom cleaning", rating: "4.79 (3M)", pay: "₹549" },
    { img: classic, title: "Classic bathroom cleaning", rating: "4.82 (1.5M)", pay: "₹469" },
    { img: switch1, title: "Switch/socket replacement", rating: "4.87 (71M)", pay: "₹49" },
    { img: switchbox, title: "Switch board/switchbox repair", rating: "4.85 (70M)", pay: "₹79" },
    { img: topload, title: "Automatic top load machine check-up", rating: "4.79 (324M)", pay: "₹299" },
    { img: walldecor, title: "Drill & hang (wall decor)", rating: "4.86 (100K)", pay: "₹49" },
    { img: tap, title: "Tap repair", rating: "4.82 (124K)", pay: "₹49" },
    { img: automatic, title: "Automatic front load machine check-up", rating: "4.76 (147k)", pay: "₹299" },
    { img: intenseclean, title: "Intense cleaning (2 bathrooms)", rating: "4.79 (3M)", pay: "₹1,016", pay1: "₹1,098" },
    { img: img2, title: "Classic cleaning (2 bathrooms)", rating: "4.82 (1.5M)", pay: "₹868", pay1: "₹938" },
  ];
  const saloncard = [
    { img: waxing, title: "Waxing" },
    { img: cleanup, title: "Cleanup" },
    { img: manicure, title: "Manicure" },
    { img: haircare, title: "Haircare" },
  ];
  const handlePrev = () => { if (index > 0) setIndex(index - 1); };
  const handleNext = () => {
    if (isTab && index < tabSlides.length - 1) setIndex(index + 1);
    else if (!isMob && !isTab && index < desktopSlides.length - 1) setIndex(index + 1);
  };
  const handleThirdPrev = () => { if (thirdIndex > 0) setThirdIndex(thirdIndex - (isTab ? 2 : 1)); };
  const handleThirdNext = () => {
    if (isTab && thirdIndex < thirdCarousel.length - 2) setThirdIndex(thirdIndex + 2);
    else if (!isMob && !isTab && thirdIndex < thirdCarousel.length - 5) setThirdIndex(thirdIndex + 1);
    else if (isMob && thirdIndex < thirdCarousel.length - 1) setThirdIndex(thirdIndex + 1);
  };

  return (
    <Container>
      <div style={{ position: "relative", marginTop: "2rem" }}>
        {(!isMob && index > 0) && <FaArrowLeft onClick={handlePrev} className="arrow left" />}
        {(!isMob && ((isTab && index < tabSlides.length - 1) || (!isTab && index < desktopSlides.length - 1))) && <FaArrowRight onClick={handleNext} className="arrow right" />}
        <Carousel
          activeIndex={index} onSelect={(selectedIndex) => setIndex(selectedIndex)} interval={3000} controls={false} indicators={false} touch={true}>
          {isMob ? mobileSlides.map((img, idx) => (
                <Carousel.Item key={idx}>
                  <Card className="mb-3"  style={{width:"85%", alignContent:"center"}}><Card.Img src={img} className="d-block w-100 rounded" /></Card>
                </Carousel.Item>
              )): isTab ? tabSlides.map((group, idx) => (
                <Carousel.Item key={idx}>
                  <div className="d-flex justify-content-center gap-3">
                    {group.map((img, i) => <img key={i} src={img} alt="" style={{ width: "48%" }} className="rounded" />)}
                  </div>
                </Carousel.Item>
              ))
            : desktopSlides.map((group, idx) => (
                <Carousel.Item key={idx}>
                  <div className="d-flex justify-content-center gap-3">
                    {group.map((img, i) => <img key={i} src={img} alt="" style={{ width: "32%" }} className="rounded" />)}
                  </div>
                </Carousel.Item>
              ))}
        </Carousel>
      </div>
      <h1 className="mt-5">Most Booked Services</h1>
      <div style={{ position: "relative", marginTop: "2rem" }}>
        {(!isMob && thirdIndex > 0) && <FaArrowLeft onClick={handleThirdPrev} className="arrow left" />}
        {(!isMob && thirdIndex < thirdCarousel.length - (isTab ? 2 : 5)) && <FaArrowRight onClick={handleThirdNext} className="arrow right" />}
        <Row className="justify-content-center">
          {(isMob ? thirdCarousel.slice(thirdIndex, thirdIndex + 1): isTab ? thirdCarousel.slice(thirdIndex, thirdIndex + 2) : thirdCarousel.slice(thirdIndex, thirdIndex + 5)
          ).map((item, i) => (
            <Col key={i} xs={12} sm={6} md={3} className="d-flex justify-content-center mb-4">
              <Card style={{ width: "17rem", border: "none" }}>
                <Card.Img src={item.img} />
                <Card.Body>
                  <Card.Title className="fw-bold" style={{ fontSize: "15px" }}>{item.title}</Card.Title>
                  <Card.Text><FaStar /> {item.rating}</Card.Text>
                  <Card.Text className="fw-semibold">
                    {item.pay} {item.pay1 && <span style={{ textDecoration: "line-through", color: "gray", marginLeft: "6px" }}>{item.pay1}</span>}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
      <h1 className="mt-5">Salon for Women</h1>
      <Row className="mt-3">
        {saloncard.map((item, i) => (
          <Col key={i} xs={12} sm={6} md={3} className="d-flex justify-content-center mb-4">
            <Card style={{ width: "15rem", height: "303px", position: "relative" }}>
              <Card.Title className="fw-semibold" style={{ padding: "20px", fontSize: "15px" }}>{item.title}</Card.Title>
              <Card.Img src={item.img} style={{ marginTop: "75px", overflow: "hidden" }} />
            </Card>
          </Col>
        ))}
      </Row>
      <div className="mt-5">
        <img src={smartlocks} alt="banner" className="d-block w-100 rounded" />
      </div>
    </Container>
  );
}

export default Shineurban;
