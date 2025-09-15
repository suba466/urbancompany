import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Uc from './assets/Uc.png';
import Urbloc from './Urbloc'; 
import { Link } from "react-router-dom";  

function Urbanav() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary py-3" style={{ borderBottom: "1px solid gray" }}>
      <Container>
        <Navbar.Brand as={Link} to="/" style={{ color: "black" }}>
          <img src={Uc} className="img" alt="Urban Logo" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="desktop-toggler" />
        <Navbar.Collapse id="basic-navbar-nav" className="mobile-collapse">
          <Nav className="ms-0">
            <Nav.Link as={Link} to="/native" className="native">Native</Nav.Link>
          </Nav>
          <Urbloc />
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Urbanav;
