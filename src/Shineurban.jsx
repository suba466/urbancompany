import { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaArrowLeft, FaArrowRight, FaStar } from 'react-icons/fa';
import shine from './assets/shine.webp';
import deepclean from './assets/deepclean.webp';
import rowater from './assets/rowater.webp';
import experts from './assets/experts.webp';
import perfect from './assets/perfect.webp';
import relax from './assets/relax.webp';
import intense from './assets/intense.webp';
import classic from './assets/classic.webp';
import switch1 from './assets/switch.png';
import switchbox from './assets/switch box.webp';
import topload from './assets/topload.webp';
import walldecor from './assets/walldecor.png';
import automatic from './assets/automatic.png';
import intenseclean from './assets/intenseclean.png';
import img2 from './assets/2.png';
import tap from './assets/tap.jpeg';
import waxing from './assets/waxing.png';
import cleanup from './assets/cleanup.png';
import manicure from './assets/manicure.png';
import haircare from './assets/haircare.png';
import smartlocks from './assets/smartlocks.webp';

function Shineurban() {
  const [index, setIndex] = useState(0);
  const [thirdIndex, setThirdIndex] = useState(0);
  const [isMob, setIsMob] = useState(window.innerWidth <= 425);
  const [isTab, setIsTab] = useState(window.innerWidth > 425 && window.innerWidth <= 786);

  useEffect(() => {
    const handleResize = () => {
      setIsMob(window.innerWidth <= 425);
      setIsTab(window.innerWidth > 425 && window.innerWidth <= 786);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mobileSlides = [shine, deepclean, relax, rowater, experts, perfect];
  const tabSlides = [[shine, deepclean], [relax, rowater], [experts, perfect]];
  const desktopSlides = [[shine, deepclean, relax], [rowater, experts, perfect]];

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

  // Main carousel arrows
  const handlePrev = () => { if (index > 0) setIndex(index - 1); };
  const handleNext = () => {
    if (isTab && index < tabSlides.length - 1) setIndex(index + 1);
    else if (!isMob && !isTab && index < desktopSlides.length - 1) setIndex(index + 1);
  };

  // 3rd carousel arrows
  const handleThirdPrev = () => {
    if (isMob || isTab) { if (thirdIndex > 0) setThirdIndex(thirdIndex - 2); }
    else { if (thirdIndex > 0) setThirdIndex(thirdIndex - 1); }
  };

  const handleThirdNext = () => {
    if (isMob || isTab) { if (thirdIndex < thirdCarousel.length - 2) setThirdIndex(thirdIndex + 2); }
    else { if (thirdIndex < thirdCarousel.length - 5) setThirdIndex(thirdIndex + 1); }
  };

  return (
    <Container style={{ overflowX: 'hidden' }}>
      {/* Main Carousel */}
      {isMob ? (
        <div style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', transition: 'transform 0.5s ease', transform: `translateX(-${index * 100}%)` }}>
            {mobileSlides.map((img, idx) => (
              <Card key={idx} className="native1img shine" style={{ width: "90%", margin: "auto" }}>
                <Card.Img variant="top" src={img} />
              </Card>
            ))}
          </div>
        </div>
      ) : isTab ? (
        <div style={{ position: 'relative' }}>
          {index > 0 && <FaArrowLeft onClick={handlePrev} className="arrow left" />}
          {index < tabSlides.length - 1 && <FaArrowRight onClick={handleNext} className="arrow right" />}
          <div style={{ display: 'flex', gap: '15px', overflow: 'hidden' }}>
            {tabSlides[index].map((img, i) => (
              <div key={i} style={{ flex: '0 0 50%' }}>
                <Card style={{ width: '100%', margin: 'auto' }}>
                  <Card.Img variant="top" src={img} />
                </Card>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {index > 0 && <FaArrowLeft onClick={handlePrev} className="arrow left" />}
          {index < desktopSlides.length - 1 && <FaArrowRight onClick={handleNext} className="arrow right" />}
          <div style={{ display: 'flex', gap: '15px', overflow: 'hidden' }}>
            {desktopSlides[index].map((img, i) => (
              <div key={i} style={{ flex: '0 0 33.33%' }}>
                <Card className="native1img shine">
                  <Card.Img variant="top" src={img} style={{ borderRadius: '8px' }} />
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Most Booked Services */}
      <h1 className="mt-5">Most booked services</h1>
      <div style={{ marginTop: '3rem' }}>
        <div style={{ position: 'relative' }}>
          {(isTab || !isMob) && thirdIndex > 0 && <FaArrowLeft onClick={handleThirdPrev} className="arrow left" />}
          {(isTab || !isMob) && thirdIndex < thirdCarousel.length - (isTab ? 2 : 5) && <FaArrowRight onClick={handleThirdNext} className="arrow right" />}
          <div style={{ display: 'flex', gap: '10px', overflow: 'hidden' }}>
            {thirdCarousel.slice(thirdIndex, thirdIndex + (isMob ? 2 : isTab ? 2 : 5)).map((item, i) => (
              <div key={i} style={{ flex: `0 0 ${isMob ? '50%' : isTab ? '50%' : '20%'}` }}>
                <Card className="third card">
                  <Card.Img variant="top" src={item.img} style={{ borderRadius: '8px' }} />
                  <Card.Body className="card-body">
                    <Card.Title className="fw-bold">{item.title}</Card.Title>
                    <Card.Text className="rating"><FaStar /> {item.rating}</Card.Text>
                    <Card.Text className="price">
                      {item.pay}{item.pay1 && <span>{item.pay1}</span>}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Salon for Women */}
      <h1 className="mt-5">Salon for Women</h1>
      <Row className="mt-3">
        {saloncard.map((item, i) => (
          <Col key={i} xs={12} sm={6} md={3} className="d-flex justify-content-center mb-4">
            <Card style={{ width: '15rem', height: '303px', position: 'relative' }}>
              <Card.Title className="fw-semibold" style={{ padding: '20px', fontSize: '15px' }}>{item.title}</Card.Title>
              <Card.Img src={item.img} style={{ marginTop: '75px', overflow: 'hidden' }} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Footer Image */}
      <div>
        <img src={smartlocks} alt="" className="native1img" />
      </div>
    </Container>
  );
}

export default Shineurban;
