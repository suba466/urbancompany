import { useState, useRef, useEffect } from 'react';
import shine from './assets/shine.webp';
import deepclean from './assets/deepclean.webp';
import rowater from './assets/rowater.webp';
import experts from './assets/experts.webp';
import perfect from './assets/perfect.webp';
import relax from './assets/relax.webp';
import intense from './assets/intense.webp';
import img from './assets/2.png';
import socket from './assets/switch.webp';
import wall from './assets/wall.png';
import topload from './assets/topload.webp';
import acinstall from './assets/acinstall.png';
import walldecor from './assets/walldecor.png';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import {  Carousel,Container,Row,Col,Card } from 'react-bootstrap';

function Shineurban() {
  const [index, setIndex] = useState(0);
  const carouselRef = useRef(null);
  const [isMob, setIsMob]=useState(window.innerWidth <=425);
  const desktopSlides=[
    [shine, deepclean, rowater],[experts, perfect,relax]];
  const mobileSlides=[shine,deepclean,rowater,experts,perfect,relax]
  useEffect(()=>{
    const handleResize=()=>setIsMob(window.innerWidth<=425);
    window.addEventListener("resize",handleResize);
    return ()=>window.removeEventListener("resize",handleResize);
  },[]);
  const handlePrev = () => {
    if (index > 0) {setIndex(index - 1);}};
   const handleNext = () => { if (index < desktopSlides.length - 1) setIndex(index + 1); };

  return (
    <Container >
      {isMob ?(
        <div>
         <Carousel activeIndex={index} onSelect={(selectedIndex)=>setIndex(selectedIndex)} interval={null} controls={false}indicators={false} touch={true}>
          {mobileSlides.map((img, idx)=>(
            <Carousel.Item key={idx}>
              <Card className='native1img shine'
                    style={{width:"90%", margin:"auto"}}>
              <Card.Img variant='top' src={img}/>
              </Card>
            </Carousel.Item>
          ))}
         </Carousel>
         <div className='mobile-indicator'>
          <div className='mobile-indicator-inner'  style={{ transform: `translateX(${(100 / mobileSlides.length) * index}%)` }}></div>
         </div></div>
      ):(
        <div style={{position:"relative"}}>
          {index >0 &&(
            <FaArrowLeft onClick={handlePrev} className='arrow left'/>
          )}
          {index<desktopSlides.length-1 &&(
            < FaArrowRight onClick={handleNext}  className='arrow right'/>
          )}
          <Carousel ref={carouselRef} activeIndex={index} onSelect={(selectedIndex)=>setIndex(selectedIndex)}
            controls={false} interval={null} touch={true}>
            {desktopSlides.map((group,idx)=>(
              <Carousel.Item key={idx}>
                <Row>
                  {group.map((img,i)=>(
                    <Col key={i} xs={12} sm={6} md={4} className="d-flex justify-content-center">
                      <Card className='native1img shine' style={{ width: "23rem", margin: "auto" }}>
                        <Card.Img variant="top" src={img}/>
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
  );
}

export default Shineurban;
