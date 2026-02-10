import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Button, Card } from 'react-bootstrap';
import { FaCheckCircle } from 'react-icons/fa';

function OrderSuccess() {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId, amount, serviceName, paymentId } = location.state || {}; // Get data passed from navigate

    if (!orderId) {
        // Fallback if accessed directly without state
        return (
            <Container className="d-flex flex-column align-items-center justify-content-center mt-5">
                <h2>No Order Details Found</h2>
                <Button variant="primary" onClick={() => navigate('/')}>Go Home</Button>
            </Container>
        );
    }

    return (
        <Container className="d-flex flex-column align-items-center justify-content-center mt-5" style={{ minHeight: '60vh' }}>
            <Card className="text-center p-5 shadow-sm" style={{ maxWidth: '600px', width: '100%', borderRadius: '15px' }}>
                <div className="mb-4">
                    <FaCheckCircle className="text-success" style={{ fontSize: '80px' }} />
                </div>

                <h2 className="mb-3 fw-bold">Order Placed Successfully!</h2>
                <p className="text-muted mb-4">Thank you for your booking. We have received your order.</p>

                <div className="bg-light p-3 rounded mb-4 text-start">
                    <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Order ID:</span>
                        <span className="fw-bold">{orderId}</span>
                    </div>
                    {paymentId && (
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Payment ID:</span>
                            <span className="fw-bold" style={{ fontSize: '12px' }}>{paymentId}</span>
                        </div>
                    )}
                    <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Services:</span>
                        <span className="fw-bold text-end" style={{ maxWidth: '200px' }}>{serviceName || 'Multiple Services'}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                        <span className="text-muted">Amount Paid:</span>
                        <span className="fw-bold text-success">₹{amount}</span>
                    </div>
                </div>

                <Button
                    variant="black"
                    className="w-100 py-2 fw-bold"
                    style={{ backgroundColor: 'black', color: 'white', border: 'none' }}
                    onClick={() => navigate('/')}
                >
                    Continue Shopping
                </Button>
            </Card>
        </Container>
    );
}

export default OrderSuccess;
