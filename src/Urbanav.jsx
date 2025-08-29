
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Uc from './assets/Uc.png';
import Urbloc from './Urbloc'; 
function Urbanav(){
    return(
        <Navbar expand="lg" className="bg-body-tertiary py-3" style={{borderBottom:"1px solid gray"}}>
      <Container>
        <Navbar.Brand href="#home" style={{color:"black"}}>
            <img src={Uc} className='img img-fluid logo-img' />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="#home" className='native'>Native</Nav.Link>
            
            <Urbloc />
            
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    );
}export default Urbanav;