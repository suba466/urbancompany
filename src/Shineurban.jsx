import { useState, useRef, useEffect } from 'react';
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
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { Carousel, Container, Row, Col, Card } from 'react-bootstrap';
import waxing from './assets/waxing.png';
import cleanup from './assets/cleanup.png';
import manicure from './assets/manicure.png';
import haircare from './assets/haircare.png';
import { FaStar } from "react-icons/fa";
import smartlocks from './assets/smartlocks.webp'
function Shineurban() {
  const [index, setIndex] = useState(0);
  const carouselRef = useRef(null);
  const [isMob, setIsMob] = useState(window.innerWidth <= 425);
  const [isTab, setIsTab] = useState(window.innerWidth > 425 && window.innerWidth <= 786);
  const [thirdIndex, setthirdIndex] = useState(0);
  useEffect(() => {
    const handleResize = () => {
      setIsMob(window.innerWidth <= 425);
      setIsTab(window.innerWidth > 425 && window.innerWidth <= 786);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const mobileSlides = [shine, deepclean, relax,rowater, experts, perfect, ];
  const tabSlides = [[shine, deepclean], [relax, rowater], [experts, perfect]];
  const desktopSlides = [[shine, deepclean,relax], [rowater, experts, perfect]];
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
  const saloncard=[{img:waxing, title:"Waxing"},
                   {img:cleanup, title:"Cleanup"},
                   {img:manicure, title:"Manicure"},
                   {img:haircare, title:"Haircare"},
  ]
  const handlePrev = () => {
    if (index > 0) setIndex(index - 1);
  };
  const handleNext = () => {
    if (isTab && index < tabSlides.length - 1) {
      setIndex(index + 1);
    } else if (!isMob && !isTab && index < desktopSlides.length - 1) {
      setIndex(index + 1);
    }
  };
  const handleThirdprev = () => {
    if (isTab) {
      if (thirdIndex > 0) setthirdIndex(thirdIndex - 2);
    } else {
      if (thirdIndex > 0) setthirdIndex(thirdIndex - 1);
    }
  };
  const handleThirdnext = () => {
    if (isTab) {
      if (thirdIndex < thirdCarousel.length - 2) {
        setthirdIndex(thirdIndex + 2);
      }
    } else {
      if (thirdIndex < thirdCarousel.length - 5) {
        setthirdIndex(thirdIndex + 1);
      }
    }
  };
  return (
    <Container>
      {isMob ? (
        <div>
          <Carousel
            activeIndex={index} onSelect={(selectedIndex) => setIndex(selectedIndex)} interval={null} controls={false} indicators={false} touch={true}>
            {mobileSlides.map((img, idx) => (
              <Carousel.Item key={idx}>
                <Card className="native1img shine" style={{ width: "90%", margin: "auto" }}>
                  <Card.Img variant="top" src={img} />
                </Card>
              </Carousel.Item>
            ))}
          </Carousel>
          <div className="mobile-indicator">
            <div
              className="mobile-indicator-inner"
              style={{ transform: `translateX(${(100 / mobileSlides.length) * index}%)` }}
            ></div>
          </div>
        </div>
      ) : isTab ? (
        <div style={{ position: "relative" }}>
          {index > 0 && <FaArrowLeft onClick={handlePrev} className="arrow left" />}
          {index < tabSlides.length - 1 && <FaArrowRight onClick={handleNext} className="arrow right" />}
          <Carousel
            ref={carouselRef} activeIndex={index} onSelect={(selectedIndex) => setIndex(selectedIndex)}controls={false} interval={null} indicators={false} touch={true}>
            {tabSlides.map((group, idx) => (
              <Carousel.Item key={idx}>
                <Row>
                  {group.map((img, i) => (
                    <Col key={i} xs={12} sm={6} className="d-flex justify-content-center">
                      <Card style={{ width: "17rem", margin: "auto" }}>
                        <Card.Img variant="top" src={img} />
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Carousel.Item>
            ))}
          </Carousel>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          {index > 0 && <FaArrowLeft onClick={handlePrev} className="arrow left" />}
          {index < desktopSlides.length - 1 && <FaArrowRight onClick={handleNext} className="arrow right" />}
          <Carousel
            ref={carouselRef} activeIndex={index} onSelect={(selectedIndex) => setIndex(selectedIndex)} controls={false} interval={null}touch={true}indicators={false}>
            {desktopSlides.map((group, idx) => (
              <Carousel.Item key={idx}>
                <Row>
                  {group.map((img, i) => (
                    <Col key={i} xs={12} sm={6} md={4} >
                      <Card className="native1img shine">
                        <Card.Img variant="top" src={img} style={{borderRadius:"8px"}}/>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Carousel.Item>
            ))}
          </Carousel>
        </div>
      )}
      <br /> <br /> <br /><br />
      <h1>Most booked services</h1>
      <div style={{ marginTop: "3rem" }}>
        {isMob ? (
          <Carousel interval={null} indicators={false} controls={false} touch={true}>
            {thirdCarousel.map((item, i) => (
              <Carousel.Item key={i}>
                <Card style={{ width: "80%", margin: "auto",border:"none"  }}>
                  <Card.Img variant='top' src={item.img}></Card.Img>
                  <Card.Body >
                    <Card.Title className='fw-bold'>{item.title}</Card.Title>
                    <Card.Text><FaStar /> {item.rating}</Card.Text>
                    <Card.Text className='fw-semibold'>
                      {item.pay}{" "}
                      {item.pay1 && (
                        <span style={{ textDecoration: "line-through", color: "gray", marginLeft: "6px" }}>
                          {item.pay1}
                        </span>
                      )}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Carousel.Item>
            ))}
          </Carousel>
        ) : isTab ? (
          <div style={{ position: "relative" }}>
            {thirdIndex > 0 && <FaArrowLeft onClick={handleThirdprev} className="arrow left" />}
            {thirdIndex < thirdCarousel.length - 2 && <FaArrowRight onClick={handleThirdnext} className="arrow right" />}
            <Row>
              {thirdCarousel.slice(thirdIndex, thirdIndex + 2).map((item, i) => (
                <Col key={i} xs={12} sm={6} className="d-flex justify-content-center">
                  <Card style={{ width: "17rem", margin: "auto",border:"none"  }}>
                    <Card.Img variant="top" src={item.img} />
                    <Card.Body >
                      <Card.Title className='fw-bold' style={{fontSize:"15px"}}>{item.title}</Card.Title>
                      <Card.Text><FaStar /> {item.rating}</Card.Text>
                      <Card.Text className='fw-semibold' >
                        {item.pay}{" "}
                        {item.pay1 && (
                          <span style={{ textDecoration: "line-through", color: "gray", marginLeft: "6px" }}>
                            {item.pay1}
                          </span>
                        )}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            {thirdIndex > 0 && <FaArrowLeft onClick={handleThirdprev} className='arrow left' />}
            {thirdIndex < thirdCarousel.length - 5 && <FaArrowRight onClick={handleThirdnext} className='arrow right' />}
            <Row style={{ display: "flex", gap: "10px", justifyContent: "space-between" }}>
              {thirdCarousel.slice(thirdIndex, thirdIndex + 5).map((item, i) => (
                <div key={i} style={{ flex: "1 1 calc(20% - 8px)" }}>
                  <Card className='third'>
                    <Card.Img variant="top" src={item.img} style={{ borderRadius:"8px" }}/> 
                    <Card.Body className='card-body'>
                      <Card.Title className='fw-bold'>{item.title}</Card.Title>
                      <Card.Text className='rating'><FaStar /> {item.rating}</Card.Text>
                      <Card.Text className='price'>
                        {item.pay}{item.pay1 && <span>{item.pay1}</span>}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </Row>

          </div>
        )}
      </div><br /><br /><br /><br /><br /><br />
      <div >
        <h1>Salon for Women</h1>
         <Row className='mt-3'>
          {saloncard.map((item,i)=>(
            <Col key={i} xs={12} sm={6} md={3} className="d-flex justify-content-center mb-4">
                <Card style={{ width: "15rem", height:"303px",position: "relative" }}>
                  <Card.Title className='fw-semibold ' style={{padding:"20px", fontSize:"15px"}}>{item.title}</Card.Title>
                  <Card.Img  src={item.img} style={{marginTop:"75px", overflow:"hidden"}}/> 
                </Card>
            </Col>
          ))}
         </Row>
      </div><br /><br /><br />

      <div >
        <img src={smartlocks} alt="" className="native1img " />
      </div>
    </Container>
  );
}

export default Shineurban;
