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
import Shineurban from './Shineurban.jsx';
function Urban1() {
  return (
    <div className='saloncomp'>
      <Container  style={{marginTop:"80px"}}>
        <Row className="align-items-center g-5 desktop">
          <Col lg={6} md={12} style={{marginBottom:"0px"}} className='tab'>
            <h1 >Home services at your doorstep</h1>
            <br /><div style={{ border: "1px solid rgb(171,171,171)", width:"85%" }} className='tabwidth'>
              <p style={{fontWeight: "600",fontSize: "20px",color: "rgb(84,84,84)",margin: "20px",}}>
                What are you looking for?</p>
              <Row className="px-4 mb-3 ">
                <Col xs={5} sm={5} className="css2 ms-2">
                  <p>Salon for women</p>
                  <img src={salon} alt="Salon" />
                </Col>
                <Col xs={6} sm={6} className="css2  ac">
                  <p>AC & Appliance Repair</p>
                  <img src={ac} alt="AC" />
                </Col>
              </Row>

              <Row className="g-3 px-3 pb-3">
                <Col xs={4} sm={4} className="css3">
                  <div className="css2 d-flex justify-content-center">
                    <img src={clean} alt="Cleaning" />
                  </div>
                  <p className="label">Bathroom & Kitchen Cleaning</p>
                </Col>
                <Col xs={4} sm={4} className="css3">
                  <div className="css2 d-flex justify-content-center">
                    <img src={electric} alt="Electric" />
                  </div>
                  <p className="label">Electrician, Plumber & Carpenters</p>
                </Col>
                <Col xs={4} sm={4} className="css3">
                  <div className="css2 d-flex justify-content-center">
                    <img src={water} alt="Water" />
                  </div>
                  <p className="label">Native Water Purifier</p>
                </Col>
              </Row>
            </div><br />

            <Row className="mt-4">
              <Col xs={6}>
                <Row>
                  <Col xs={3}>
                    <img src={rating} alt="Rating" className="img-fluid" />
                  </Col>
                  <Col>
                    <p style={{ color: "rgb(84,84,84)" }}>
                      <span style={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          color: "black"}}>4.8</span><br /> Service Rating*</p></Col></Row></Col>
              <Col xs={6}>
                <Row>
                  <Col xs={3}>
                    <img src={people} alt="People" className="img-fluid" />
                  </Col>
                  <Col>
                    <p style={{ color: "rgb(84,84,84)" }}>
                      <span
                        style={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          color: "black",
                        }}
                      >
                        12M+
                      </span>
                      <br /> Customers Globally*
                    </p>
                  </Col>
                </Row>
              </Col>
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
      <Container fluid className="mobile px-2 pb-3">
        <Row className="px-2 mb-2 g-2">
          <Col xs={5} className="css2">
            <p>Salon for women</p>
            <img src={salon} alt="Salon" className="img-fluid" />
          </Col>
          <Col xs={6} className="css2">
            <p>AC & Appliance Repair</p>
            <img src={ac} alt="AC" className="img-fluid" />
          </Col>
        </Row>

        <Row className="px-2 mb-2 g-2">
          <Col xs={5} className="css2">
            <p>Cleaning</p>
            <img src={clean} alt="Cleaning" className="img-fluid" />
          </Col>
          <Col xs={6} className="css2">
            <p>Electrician Plumber & Carpenters</p>
            <img src={electric} alt="Electric" className="img-fluid" />
          </Col>
        </Row>
      </Container><br /> <br /> <br />
      <Shineurban/>
    </div>
  );
}

export default Urban1;
