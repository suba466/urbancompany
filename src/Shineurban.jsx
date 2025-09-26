import { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaStar, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
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
import cleaning1 from './assets/cleaning.png';
import sofa from './assets/sofa.png';
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
  const tabletSlides = [[shine, deepclean], [relax, rowater], [experts, perfect]];
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
  const cleaning=[{img:cleaning1, title:"Bathroom & Kitchen Cleaning"},
                  {img:sofa, title:"Sofa & Carpet Cleaning"}
  ];
  const handlePrev = () => { if (index > 0) setIndex(index - 1); };
  const handleNext = () => {
    if (isMob && index < mobileSlides.length - 1) setIndex(index + 1);
    else if (isTab && index < tabletSlides.length - 1) setIndex(index + 1);
    else if (!isMob && !isTab && index < desktopSlides.length - 1) setIndex(index + 1);
  };

  const handleThirdPrev = () => {
    if (isMob) { if (thirdIndex > 0) setThirdIndex(thirdIndex - 1); }
    else if (isTab) { if (thirdIndex > 0) setThirdIndex(thirdIndex - 2); }
    else { if (thirdIndex > 0) setThirdIndex(thirdIndex - 5); }
  };

  const handleThirdNext = () => {
    if (isMob) { if (thirdIndex < thirdCarousel.length - 1) setThirdIndex(thirdIndex + 1); }
    else if (isTab) { if (thirdIndex < thirdCarousel.length - 2) setThirdIndex(thirdIndex + 2); }
    else { if (thirdIndex < thirdCarousel.length - 5) setThirdIndex(thirdIndex + 5); }
  };
  return (
    <Container style={{ overflowX: 'hidden' }}>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {!isMob && index > 0 && <FaArrowLeft onClick={handlePrev} className="arrow left" />}
        {!isMob && ((isTab && index < tabletSlides.length - 1) || (!isTab && index < desktopSlides.length - 1)) &&
          <FaArrowRight onClick={handleNext} className="arrow right" />}
        {isMob ? (
          <div style={{display: 'flex', overflowX: 'auto', gap: '10px',scrollSnapType: 'x mandatory', padding: '10px 0' }}>
            {mobileSlides.map((img, i) => (
              <Card key={i} style={{ flex: '0 0 80%', scrollSnapAlign: 'start', borderRadius: '8px', border: 'none' }}>
                <Card.Img src={img} style={{ width: '100%', borderRadius: '8px' }} />
              </Card>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', transition: 'transform 0.5s ease', transform: `translateX(-${index * 100}%)` }}>
            {(isTab ? tabletSlides : desktopSlides).map((group, gIdx) => {
              const flexWidth = `${100 / group.length}%`;
              return (
                <div key={gIdx} style={{ display: 'flex', flex: '0 0 100%', gap: '0px' }}>
                  {group.map((img, i) => (
                    <Card key={i} style={{ flex: `0 0 ${flexWidth}`, border: 'none', width: "100%" }}>
                      <Card.Img variant="top" src={img} style={{ borderRadius: '8px', width: "90%" }} />
                    </Card>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <h1 className="mt-5">Most booked services</h1>
      <div style={{ marginTop: '3rem', position: 'relative' }}>
        {(isTab || !isMob) && thirdIndex > 0 && <FaArrowLeft onClick={handleThirdPrev} className="arrow left" />}
        {(isTab || !isMob) && thirdIndex < thirdCarousel.length - (isTab ? 2 : 5) && <FaArrowRight onClick={handleThirdNext} className="arrow right" />}
        {isMob ? (
          <div style={{ display: 'flex', overflowX: 'auto', gap: '10px', scrollSnapType: 'x mandatory', padding: '10px 0' }}>
            {thirdCarousel.map((item, i) => (
              <Card key={i} style={{ flex: '0 0 80%', scrollSnapAlign: 'start', borderRadius: '8px', border: 'none' }}>
                <Card.Img src={item.img} style={{ width: '100%', borderRadius: '8px' }} />
                <Card.Body>
                  <Card.Title className="fw-bold">{item.title}</Card.Title>
                  <Card.Text className="rating"><FaStar /> {item.rating}</Card.Text>
                  <Card.Text className="price">{item.pay}{item.pay1 && <span>{item.pay1}</span>}</Card.Text>
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '5px', overflow: 'hidden', width: "95%" }}>
            {thirdCarousel.slice(thirdIndex, thirdIndex + (isTab ? 2 : 5)).map((item, i) => (
              <div key={i} style={{ flex: `0 0 ${isTab ? '50%' : '20%'}` }}>
                <Card className="third card" style={{ border: 'none' }}>
                  <Card.Img variant="top" src={item.img} style={{ borderRadius: '8px', width: "90%" }} />
                  <Card.Body>
                    <Card.Title className="fw-bold">{item.title}</Card.Title>
                    <Card.Text className="rating"><FaStar /> {item.rating}</Card.Text>
                    <Card.Text className="price">{item.pay}{item.pay1 && <span>{item.pay1}</span>}</Card.Text>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
      <h1 className="mt-3">Salon for Women</h1><br />
      {isMob ? (
        <div style={{ display: 'flex',overflowX: 'auto', gap: '10px', scrollSnapType: 'x mandatory',padding: '10px 0'}}>
          {saloncard.map((item, i) => (
            <Card key={i} style={{
              flex: '0 0 80%',scrollSnapAlign: 'start', borderRadius: '8px', border: 'none'}}>
              <Card.Title className="fw-semibold" style={{ padding: '20px', fontSize: '15px' }}>{item.title}</Card.Title>
              <Card.Img src={item.img} style={{ marginTop: '20px', borderRadius: '8px' }} />
            </Card>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {saloncard.map((item, i) => (
          <Card key={i} style={{flex: '0 0 23%', borderRadius: '8px', marginBottom: '20px',display: 'flex',flexDirection: 'column',overflow: 'hidden'  }}>
            <Card.Title className="fw-semibold" style={{ padding: '20px', fontSize: '15px' }}>
              {item.title}
            </Card.Title>
            <Card.Img 
              src={item.img} 
              style={{  borderRadius: '0 0 8px 8px', flexGrow: 1,  objectFit: 'cover',  }}  />
          </Card>
        ))}
        </div>
      )}
      <br />
      <div  style={{ border: '1px solid darkblue' }} className='native1 mt-3'>
        <img src={smartlocks} alt='' className='native1img' />
      </div>
      <div className='mt-5'>
         <h1>Cleaning & pest control</h1><br />
          <Card style={{ width: '18rem' }}>
            <Card.Body>
              <h3>Bathroom & Kitchen Cleaning</h3>
            </Card.Body>
            <Card.Img variant="top" src={cleaning1} />
            
          </Card>
      </div>


    </Container>
  );
}

export default Shineurban;
