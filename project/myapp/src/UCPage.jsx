import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import API_URL from "./config";

function UCPage() {
    const navigate = useNavigate();

    return (
        <Container className="p-4">
            <Button variant="link" className="p-0 mb-3 text-dark" onClick={() => navigate(-1)}>
                <MdArrowBack size={24} />
            </Button>
            <div className="text-center mt-5">
                <h1 className="fw-bold mb-4">Urban Company</h1>
                <img
                    src={`${API_URL}/assets/urban.png`}
                    alt="Urban Company"
                    style={{ width: "150px", marginBottom: "30px" }}
                    onError={(e) => e.target.style.display = 'none'}
                />
                <p className="lead text-muted">
                    Empowering millions of service professionals worldwide to deliver services at home like never before.
                </p>
                <div className="mt-5 p-4 bg-light rounded">
                    <h5>Our Mission</h5>
                    <p>To empower 100 million service professionals to become entrepreneurs and help customers get great services at home.</p>
                </div>
            </div>
        </Container>
    );
}

export default UCPage;
