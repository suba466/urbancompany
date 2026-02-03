import React from 'react';
import { Container, Button, Accordion } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdHelpOutline } from 'react-icons/md';

function HelpPage() {
    const navigate = useNavigate();

    return (
        <Container className="p-4">
            <Button variant="link" className="p-0 mb-3 text-dark" onClick={() => navigate(-1)}>
                <MdArrowBack size={24} /> 
            </Button>
            <div className="mt-2">
                <div className="d-flex align-items-center mb-4">
                    <MdHelpOutline size={32} className="me-2 text-primary" />
                    <h2 className="fw-bold m-0">Help & Support</h2>
                </div>

                <p className="text-muted mb-4">Find answers to frequently asked questions.</p>

                <Accordion defaultActiveKey="0">
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>How do I book a service?</Accordion.Header>
                        <Accordion.Body>
                            Select the service you need, choose a convenient date and time, and confirm your booking.
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="1">
                        <Accordion.Header>How do I cancel a booking?</Accordion.Header>
                        <Accordion.Body>
                            Go to your bookings page, select the active booking, and click on Cancel. Cancellation charges may apply.
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="2">
                        <Accordion.Header>Is payment secure?</Accordion.Header>
                        <Accordion.Body>
                            Yes, we use secure payment gateways (Razorpay) to process all transactions.
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="3">
                        <Accordion.Header>Customer Support</Accordion.Header>
                        <Accordion.Body>
                            Email us at help@urbancompany.com or call 1800-123-4567.
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </div>
        </Container>
    );
}

export default HelpPage;
