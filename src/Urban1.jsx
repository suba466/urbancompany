import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import urban1 from './assets/urban1.webp';
import salon from './assets/salon.webp';
import ac from './assets/ac.webp';
import clean from './assets/clean.webp';
import electric from './assets/electric.webp';
import water from './assets/water.webp';
import rating from './assets/rating.webp';
import people from './assets/people.webp';
function Urban1() {
  return (
    <Container style={{paddingTop: "50px", paddingBottom: "50px"}}>
      <Row className='align-items-center'>
        <Col  lg={6} md={12}>
          <h1 style={{margin:"20px 0"}}>Home services at your <br />doorstep</h1>
          <div style={{border:"1px solid rgb(171,171,171"}}>
            <p style={{fontWeight:"600",fontSize:"20px",color:"rgb(84,84,84)",margin:"20px "}}>
              What are you looking for?
            </p>
            <Row className='g-2 px-3 mb-3' >
              <Col xs={12} sm={6} className="css2">
                <p>Salon for women <img src={salon} alt="" /></p>
              </Col>
              <Col xs={12} sm={6} className="css2">
                <p>AC & Appliance Repair <img src={ac} alt="" /></p>
              </Col>
            </Row>
            <Row className='g-3 px-3 pb-3'>
                <Col xs={12} sm={4} className="css3">
                <div className="css2 d-flex justify-content-center">
                  <img src={clean} alt="" />
                </div>
                <p className="label">Bathroom & Kitchen Cleaning</p>
              </Col>
                <Col xs={12} sm={4} className="css3">
                <div className="css2 d-flex justify-content-center">
                  <img src={electric} alt="" />
                </div>
                <p className="label">Electrician, Plumber & Carpenters</p>
              </Col>
                <Col xs={12} sm={4} className="css3">
                <div className="css2 d-flex justify-content-center">
                  <img src={water} alt="" />
                </div>
                <p className="label">Native Water Purifier</p>
              </Col>
            </Row>
          </div>
        <Row className='mt-4'>
        <Col xs={6}><Row><Col xs={3}> <img src={rating} alt=""className="img-fluid"  /></Col>
            <Col><p style={{color:"rgb(84,84,84)"}}><span style={{fontSize:"20px",fontWeight:"bold",color:"black"}}>4.8</span> <br /> Service Rating*</p></Col>
          </Row>
        </Col>
        <Col xs={6}><Row><Col xs={3}> <img src={people} alt="" className="img-fluid"/></Col>
            <Col><p style={{color:"rgb(84,84,84)"}}><span style={{fontSize:"20px",fontWeight:"bold",color:"black"}}>12M+</span> <br /> Costumers Globally*</p></Col>
          </Row></Col>
      </Row>
        </Col>
        <Col lg={6} md={12} className="text-center mt-4 mt-lg-0">
          <img 
            src={urban1} 
            className="img-fluid" 
            style={{ maxHeight: "650px" }} 
            alt="Urban Services"
          />
        </Col>
      </Row>
      
    </Container>
  );
}

export default Urban1;
