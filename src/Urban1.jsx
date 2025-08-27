import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import urban1 from './assets/urban1.webp';
import salon from './assets/salon.webp';
import ac from './assets/ac.webp';
import clean from './assets/clean.webp';
import electric from './assets/electric.webp';
import water from './assets/water.webp';

function Urban1() {
  return (
    <Container style={{margin:"50px auto"}}>
      <Row>
        <Col style={{position:"relative"}}>
          <h1 style={{margin:"45px auto"}}>Home services at your <br />doorstep</h1>
          <div className="css1">
            <p style={{fontWeight:"600",fontSize:"20px",color:"rgb(84, 84, 84)",margin:"20px auto"}}>
              What are you looking for?
            </p>
            <Row >
              <Col xs={4} className="css2">
                <p>Salon for women <img src={salon} alt="" /></p>
              </Col>
              <Col xs={6} className="css2">
                <p>AC & Appliance Repair <img src={ac} alt="" /></p>
              </Col>
            </Row>
            <Row >
                <Col xs={3} className='css3'>
                    <Col className="css2 " style={{justifyContent:"center",width:"100%"}}>
                    <img src={clean} className='img1'/></Col>
                    <Col><p className='label '>Bathroom & Kitchen Cleaning</p>
                    </Col>
                </Col>
                <Col xs={4} className='css3'>
                    <Col className="css2 " style={{justifyContent:"center",width:"100%"}}>
                    <img src={electric} alt="" /></Col>
                    <Col><p className='label'>Electrician, Plumber & Carpenters</p>
                    </Col>
                </Col>
                <Col xs={3} className='css3'>
                    <Col className="css2 " style={{justifyContent:"center",width:"100%"}}>
                    <img src={water} alt="" /></Col>
                    <Col><p className='label'>Native Water Purifier</p>
                    </Col>
                </Col>
            
            </Row>
            
          </div>
        </Col>
        <Col>
          <img src={urban1} style={{width:"100%"}} alt="" />
        </Col>
      </Row>
    </Container>
  );
}

export default Urban1;
