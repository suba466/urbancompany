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
    <Container style={{margin:"50px auto",marginLeft:"100px"}}>
      <Row>
        <Col style={{position:"relative"}}>
          <h1 style={{margin:"45px auto"}}>Home services at your <br />doorstep</h1>
          <div style={{border:"1px solid rgb(171,171,171"}}>
            <p style={{fontWeight:"600",fontSize:"20px",color:"rgb(84,84,84)",margin:"20px "}}>
              What are you looking for?
            </p>
            <Row style={{margin:"5px"}} >
              <Col xs={4} className="css2" style={{marginLeft:"17px"}}>
                <p>Salon for women <img src={salon} alt="" /></p>
              </Col>
              <Col xs={6} className="css2" style={{width:"307px"}}>
                <p>AC & Appliance Repair <img src={ac} alt="" /></p>
              </Col>
            </Row>
            <Row style={{margin:"5px",marginBottom:"20px"}}>
                <Col xs={3} className='css3'style={{width:"170px"}}>
                    <Col className="css2 " style={{justifyContent:"center"}}>
                    <img src={clean} className='img1'/></Col>
                    <Col><p className='label '>Bathroom & Kitchen Cleaning</p>
                    </Col>
                </Col>
                <Col xs={4} className='css3' style={{width:"180px"}}>
                    <Col className="css2 " style={{justifyContent:"center"}}>
                    <img src={electric} alt="" /></Col>
                    <Col><p className='label'>Electrician, Plumber & Carpenters</p>
                    </Col>
                </Col>
                <Col xs={3} className='css3' style={{width:"180px"}}>
                    <Col className="css2 " style={{justifyContent:"center"}}>
                    <img src={water} alt="" /></Col>
                    <Col><p className='label'>Native Water Purifier</p>
                    </Col>
                </Col>
            </Row>
          </div>
        <Row style={{ marginTop:"80px"}}>
        <Col><Row><Col xs={3}> <img src={rating} alt="" /></Col>
            <Col><p style={{color:"rgb(84,84,84)"}}><span style={{fontSize:"20px",fontWeight:"bold",color:"black"}}>4.8</span> <br /> Service Rating*</p></Col>
          </Row>
        </Col>
        <Col><Row><Col xs={3}> <img src={people} alt="" /></Col>
            <Col><p style={{color:"rgb(84,84,84)"}}><span style={{fontSize:"20px",fontWeight:"bold",color:"black"}}>12M+</span> <br /> Costumers Globally*</p></Col>
          </Row></Col>
      </Row>
        </Col>
        <Col>
          <img src={urban1} style={{width:"100%",height:"650px",marginLeft:"50px"}} alt="" />
        </Col>
      </Row>
      
    </Container>
  );
}

export default Urban1;
