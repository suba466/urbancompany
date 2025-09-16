import { useState, useRef, useEffect } from 'react';
import shine from './assets/shine.webp';
import deepclean from './assets/deepclean.webp';
import rowater from './assets/rowater.webp';
import experts from './assets/experts.webp';
import perfect from './assets/perfect.webp';
import relax from './assets/relax.webp';
import intense from './assets/intense.webp';
import classic from './assets/classic.webp';
import wall from './assets/wall.png';
import drawer from './assets/drawer.webp';
import fan from './assets/fan.png';
import western from './assets/western.png';
import pipe from './assets/pipe.png';
import intenseclean from './assets/intenseclean.png';
import img2 from './assets/2.png';
import microwave from './assets/microwave.webp';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { Carousel, Container, Row, Col, Card} from 'react-bootstrap';

function Shineurban() {
  const [index, setIndex] = useState(0);
  const carouselRef = useRef(null);
  const [isMob, setIsMob] = useState(window.innerWidth <= 425);
  const [isTab, setIsTab] = useState(window.innerWidth > 425 && window.innerWidth <= 786);
  const [thirdIndex, setthirdIndex]=useState(0);
  useEffect(() => {
    const handleResize = () => {
      setIsMob(window.innerWidth <= 425);
      setIsTab(window.innerWidth > 425 && window.innerWidth <= 786);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const mobileSlides = [shine, deepclean, rowater, experts, perfect, relax];
  const tabSlides = [[shine, deepclean], [rowater, experts], [perfect, relax]];
  const desktopSlides = [[shine, deepclean, rowater], [experts, perfect, relax]];
  const thirdCarousel=[
    {img:intense, title:"Intense bathroom cleaning", rating:"4.79(3M)", pay:"₹549"},
    {img:classic, title:"Classic bathroom cleaning", rating:"4.82(1.5M)", pay:"₹469"},
    {img:wall, title:"wall/ceiling light installation", rating:"4.87(77M)", pay:"₹69"},
    {img:drawer, title:"Drawer channel replacement (one set)", rating:"4.84(3M)", pay:"₹149"},
    {img:fan, title:"Fan repair (ceiling/exhaust/wall)", rating:"4.82(96M)", pay:"₹109"},
    {img:microwave, title:"Microwave checkup", rating:"4.84(131K)", pay:"₹299"},
    {img:western, title:"Western toilet repair(floor mounted)", rating:"4.79(6K)", pay:"₹569"},
    {img:pipe, title:"Pipeline leakage repair ", rating:"4.75(17M)", pay:"₹199"},
    {img:intenseclean, title:"Intense bathroom cleaning", rating:"4.79(3M)", pay:"₹549"},
    {img:img2, title:"Intense bathroom cleaning", rating:"4.79(3M)", pay:"₹549"},
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
      setthirdIndex(thirdIndex + 2);}
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
            activeIndex={index}onSelect={(selectedIndex) => setIndex(selectedIndex)}
            interval={null}controls={false}indicators={false}touch={true}>
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
            ref={carouselRef}activeIndex={index}onSelect={(selectedIndex) => setIndex(selectedIndex)}
            controls={false}interval={null}indicators={false}touch={true}>
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
          <Carousel ref={carouselRef}activeIndex={index}onSelect={(selectedIndex) => setIndex(selectedIndex)}
            controls={false}interval={null}touch={true}indicators={false}>
            {desktopSlides.map((group, idx) => (
              <Carousel.Item key={idx}>
                <Row>
                  {group.map((img, i) => (
                    <Col key={i} xs={12} sm={6} md={4} className="d-flex justify-content-center">
                      <Card className="native1img shine" style={{ width: "23rem", margin: "auto" }}>
                        <Card.Img variant="top" src={img} />
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Carousel.Item>
            ))}
          </Carousel>
        </div>
      )} <br /> <br /> <br /><br />
      <h1>Most booked services</h1>
      <div style={{marginTop:"3rem"}}>
        {isMob ?(
          <Carousel interval={null} indicators={false} controls={false} touch={true}>
            {thirdCarousel.map((img,i)=>(
              <Carousel.Item key={i}>
                <Card style={{width:"80%", margin:"auto"}}>
                  <Card.Img variant='top' src={img}></Card.Img>
                </Card>
              </Carousel.Item>
            ))}
          </Carousel>
        ): isTab ? (
        <div style={{ position: "relative" }}>
          {thirdIndex > 0 && <FaArrowLeft onClick={handleThirdprev} className="arrow left" />}
          {thirdIndex < thirdCarousel.length - 2 && <FaArrowRight onClick={handleThirdnext} className="arrow right" />}
          <Row>
              {thirdCarousel.slice(thirdIndex, thirdIndex+2).map((img,i)=>(
                    <Col key={i} xs={12} sm={6} className="d-flex justify-content-center">
                      <Card style={{ width: "17rem", margin: "auto" }}>
                        <Card.Img variant="top" src={img} />
                      </Card>
                    </Col>
                  ))}
                </Row>
        </div>
      ) : (
          <div style={{position:'relative'}}>
            {thirdIndex>0 &&(
              <FaArrowLeft onClick={handleThirdprev} className='arrow left'/>
            )}
            {thirdIndex<thirdCarousel.length-5 && (
              <FaArrowRight onClick={handleThirdnext} className='arrow right'/>
            )}
            <Row>
              {thirdCarousel.slice(thirdIndex, thirdIndex + 5).map((img, i) => (
                <Col key={i} className="d-flex justify-content-center">
                  <Card>
                    <Card.Img variant="top" src={img} />
                  </Card>
                </Col>
              ))}
          </Row>
          </div>
        )}
      </div>
    </Container>
  );
}

export default Shineurban;
