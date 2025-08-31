import Container from 'react-bootstrap/Container';
import native1 from './assets/native1.webp';
import native2 from './assets/native2.webp';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import { FaArrowLeft } from "react-icons/fa6";
import Modal from 'react-bootstrap/Modal';
function Native() {
  const [show,setShow]=useState(false);
  const handleClose=()=>setShow(false);
  const handleShow=()=>setShow(true);
  return (
    <>
    <Container>
      <div className='native1 ' onClick={handleShow}>
        <img src={native1} alt="water purifier" className="native1img w-100" />
    </div>
     <div
      className="modal show"
      style={{ display: 'block', position: 'initial' }}
    >
      <Modal show={show} onHide={handleClose} centered>
      <Button onClick={handleClose} variant="light" className='close-btn'>✕</Button>
      
        <Modal.Body>
          <FaArrowLeft onClick={handleClose} /><br /> <br />
          <h6 style={{color:"#5d5f5fff"}}>Native Water Purifiers</h6>
          <h2 style={{fontWeight:"bold"}}>No service for 2 years</h2>
          <div >
            <img src={native2} className='native2 w-100' />
          </div>
        </Modal.Body>

       
      </Modal>
    </div>
    </Container>
    </>
  )
}
export default Native;
