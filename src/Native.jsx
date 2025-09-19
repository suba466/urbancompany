import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Carousel from 'react-bootstrap/Carousel';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { useState, useRef, useEffect } from 'react';
import { MdVerified } from "react-icons/md";
import { BsDot } from "react-icons/bs";
import native1 from './assets/native1.webp';
import native2 from './assets/native2.webp';
import native3 from './assets/native3.webp';
import native4 from './assets/native4.webp';
import native5 from './assets/native5.webp';
import native6 from './assets/native6.webp';
import native7 from './assets/native7.webp';
import native8 from './assets/native8.webp';
import native9 from './assets/native9.webp';
import native10 from './assets/native10.webp';
import native11 from './assets/native11.png';
import native12 from './assets/native12.png';
import native13 from './assets/native13.png';
import native14 from './assets/native14.png';
import native15 from './assets/native15.png';
import rate from './assets/rate.png';
import ro from './assets/ro.png';
import ro1 from './assets/ro1.png'
import good from './assets/good.png'
import { TfiCheck } from "react-icons/tfi";

function Native() {
  const [show, setShow] = useState(false);
  const [index, setIndex] = useState(0); 
  const carouselRef = useRef(null);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [Tab, setTab] = useState(window.innerWidth > 425 && window.innerWidth <= 786);
  useEffect(() => {
    const handleResize = () => {
      setTab(window.innerWidth > 425 && window.innerWidth <= 786);};
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);}, []);
  const tabSlides = [[native3, native4], [native5, native6], [native7, native8]];
  const desktopSlides = [[native3, native4, native5], [native6, native7, native8]];
  const handlePrev = () => {
    if (index > 0) setIndex(index - 1);};
  const handleNext = () => {
    if (Tab && index < tabSlides.length - 1) {
      setIndex(index + 1);} else if (!Tab && index < desktopSlides.length - 1) {
      setIndex(index + 1);}};
  return (
    <>
      <Container className='nativecomp'>
        <div className='native1' onClick={handleShow}>
          <img src={native1} alt="water purifier" className="native1img w-100" />
        </div>
        <Modal show={show} onHide={handleClose} centered >
          <Button onClick={handleClose} variant="light" className='close-btn'>✕</Button>
          <Modal.Body 
            style={{ padding:"0",height:"80vh",overflowY:"auto",overflowX:"hidden" }}>
            <div style={{height:"50px", marginLeft:"15px", marginTop:"20px"}}>
              <FaArrowLeft/>
            </div>
            <div style={{backgroundColor:"black" , height:"75px",objectFit:"cover"}}>
              <h5 style={{color:"white", textAlign:"center", fontSize:"21px", padding:"18px"}}>
                2-year anniversary sale. Up to ₹3,000 off 
              </h5>
            </div>
            <br /> <br />
            <div style={{padding:"8px"}}>
              <h5 style={{ color: "#5d5f5fff", fontSize:"30px" }}>Native Water Purifiers</h5>
              <h2 style={{ fontSize:"35px" }}>No service for 2 years</h2>
              <img src={native2} className='native2 w-100' alt="Native Details" style={{maxWidth:"100%"}} />
              <img src={native9} className='native2 w-100' alt="Native Details" style={{maxWidth:"100%"}} />
              <img src={native10} className='native2 w-100' alt="Native Details" style={{maxWidth:"100%"}} />
              <br /> <br /> <br />
              <div style={{padding:"6px"}}>
                <h3>Thing's you'll love</h3><br />
                <img src={native11} alt="" style={{maxWidth:"100%"}}/> <br /> <br />
                <img src={native12} alt="" style={{maxWidth:"100%"}}/>
                <Row className='track'>
                  <Col><img src={native13} alt="" style={{width:"100%"}}/></Col>
                  <Col><img src={native14} alt="" style={{width:"100%"}}/></Col>
                </Row>
              </div>
              <img src={native15} alt="" style={{padding:"8px", maxWidth:"100%"}} />
            </div>
            <br />
            <div style={{backgroundColor:"rgba(219, 215, 215, 0.32)", padding:"12px"}}>
              <h2 style={{fontSize:"35px"}}>Highest rated purifier on Amazon</h2>
              <h1 style={{fontSize:"50px"}}>
                4.4
                <span style={{fontSize:"20px"}}>
                  /5 <img src={rate} style={{marginBottom:"15px"}} alt="rating stars"/>
                </span>
              </h1>
              <h5 style={{color:"black",margin:"4px"}}>
                {(79000).toLocaleString()}+ reviews
              </h5> <br />
              <Row className="mb-2 g-2">
                <Col xs={12} sm={4} className='water'><TfiCheck /> Water taste</Col>
                <Col xs={12} sm={3} className='water'><TfiCheck /> 2-year life</Col>
                <Col xs={12} sm={4} className='water'><TfiCheck /> Filtration</Col>
              </Row>
              <Row sclassName="mb-2 g-2" style={{marginLeft:"-3px",marginBottom:"8px"}}>
                <Col xs={12} sm={5} className='water'><TfiCheck /> Value for money</Col>
                <Col xs={12} sm={4} className='water'><TfiCheck /> Smart app</Col>
              </Row> 
               <Row className="mb-2 g-2">
                <Col xs={12} sm={5} className='water' ><TfiCheck /> Service quality</Col>
                <Col xs={12} sm={4} className='water'><TfiCheck /> Design</Col>
              </Row> <br /><br />
              <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "12px", overflowX: "hidden" }}>
                <h5 className='fw-semibold' style={{ fontSize: "25px", whiteSpace: "normal", lineHeight: "1.4" }}>
                "I almost forgot that I have a <br /> RO Installed at my home <br /> 2-year filter life is insane"
              </h5><br />
              <h5 style={{fontSize:"20px"}}>Raman Chaudhary <MdVerified style={{ marginLeft: "5px" }} /></h5>
              <h6 style={{fontSize:"18px"}}>Rated on Amazon<BsDot />21 Feb, 2025</h6><br />
              <img src={ro} alt="" />
            </div><br />
            <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "12px", overflowX: "hidden" }}>
                <h5 className='fw-semibold' style={{ fontSize: "25px", whiteSpace: "normal", lineHeight: "1.4" }}>
                "...looks quite good, smart & minimalistic, black with the LED white light ring on the front..."
              </h5><br />
              <h5 style={{fontSize:"20px"}}>Avirup <MdVerified style={{ marginLeft: "5px" }} /></h5>
              <h6 style={{fontSize:"18px"}}>Rated on Amazon<BsDot />16 June, 2025</h6><br />
              <img src={good} alt="" />
            </div><br />
             <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "12px", overflowX: "hidden" }}>
                <h5 className='fw-semibold' style={{ fontSize: "25px", whiteSpace: "normal", lineHeight: "1.4" }}>
                "Native M2 is the best RO of all segments. Nice display monitoring & water quality"
              </h5><br />
              <h5 style={{fontSize:"20px"}}>Pradeep Pandey <MdVerified style={{ marginLeft: "5px" }} /></h5>
              <h6 style={{fontSize:"18px"}}>Rated on Amazon<BsDot />6 Feb, 2025</h6><br />
            </div><br /><br />
            </div><br />
            <div style={{padding:"8px"}}>
              <h3>Build with <br /> world-class quality</h3><br /><br />
              <h4 style={{fontSize:"25px"}}>Meets the highest standards</h4>
              <h6 style={{fontSize:"20px" ,color:"rgba(44, 44, 44, 0.71)"}}>Every Native purifier goes through rigorous checks, from R&D to final inspection, to meet the highest global standards</h6>
              <img src={ro1} style={{borderRadius:"8px"}}/>
            </div> <br />
            <div style={{backgroundColor:"black", color:"white", padding:"8px"}}> <br />
              <h5 style={{fontSize:"30px"}}>Innovative. <br /> Customer-first products. <br /> Designed in India, for India.</h5><br />
              <h5 style={{fontSize:"20px", color:"rgba(230, 229, 229, 0.86)"}}>At Native, we don't follow trends. <br /> We set new  standards <br /><br /> 
                  Our every product is deeply researched, <br /> built from scratch by industry experts, <br />
                  crafted with precision, and tested  rigorously. <br /> So it works beautifully, every single time.</h5><br /><br /><br />
              <h3 style={{fontFamily:" 'Montserrat', sans-serif"}}>NATIVE</h3>
            </div>
            <div style={{height:"20px", backgroundColor:"white"}}></div>
          </Modal.Body>
        </Modal>
        <h2>Best-in-class features</h2>
        {Tab ? (
          <div style={{ position: "relative" }}>
            {index > 0 && <FaArrowLeft onClick={handlePrev} className="arrow left" />}
            {index < tabSlides.length - 1 && <FaArrowRight onClick={handleNext} className="arrow right" />}
            <Carousel ref={carouselRef}activeIndex={index}onSelect={(selectedIndex) => setIndex(selectedIndex)} controls={false}interval={null}indicators={false}touch={true}>
              {tabSlides.map((group, idx) => (
                <Carousel.Item key={idx}>
                  <Row>
                    {group.map((img, i) => (
                      <Col key={i} xs={12} sm={6} className="d-flex justify-content-center">
                        <Card className="native-card" style={{ width: "17rem", margin: "auto" }}>
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
            <Carousel ref={carouselRef}activeIndex={index}onSelect={(selectedIndex) => setIndex(selectedIndex)}controls={false}interval={null}indicators={false}touch={true}>
              {desktopSlides.map((group, idx) => (
                <Carousel.Item key={idx}>
                  <Row>
                    {group.map((img, i) => (
                      <Col key={i} xs={12} sm={6} md={4} className="d-flex justify-content-center">
                        <Card className="native-card" style={{ width: "23rem", margin: "auto" }}>
                          <Card.Img variant="top" src={img} />
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Carousel.Item>
              ))}
            </Carousel>
          </div>
        )}
      </Container>
    </>
  );
}

export default Native;
