import { Row,Col } from "react-bootstrap";
function Salon() {

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <Row>
        <Col>
        <h4 className="fw-semibold">Salon for women</h4>
        </Col>
        <Col xs={9}>2 of 3 (wider)</Col>
        
      </Row>
    </div>
  );
}

export default Salon;
