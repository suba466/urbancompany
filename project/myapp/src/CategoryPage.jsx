import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { BiLeftArrowAlt } from 'react-icons/bi';

function CategoryPage() {
    const { categorySlug } = useParams();
    const navigate = useNavigate();

    // Convert slug back to readable name
    // "/salon-for-men" -> "Salon for Men"
    const categoryName = categorySlug
        ? categorySlug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        : 'Category';

    return (
        <Container className="my-5">
            <Row>
                <Col>
                    {/* Back Button */}
                    <Button
                        variant="link"
                        className="p-0 mb-4 text-dark"
                        onClick={() => navigate('/')}
                        style={{ textDecoration: 'none', fontSize: '16px' }}
                    >
                        <BiLeftArrowAlt size={24} className="me-2" />
                        Back to Home
                    </Button>

                    {/* Category Header */}
                    <div className="mb-4">
                        <h2 className="fw-bold">{categoryName}</h2>
                        <p className="text-muted">Explore our {categoryName.toLowerCase()} services</p>
                    </div>

                    {/* Coming Soon Message */}
                    <Alert variant="info" className="text-center py-5">
                        <h4 className="mb-3">🚧 Coming Soon!</h4>
                        <p className="mb-4">
                            We're working hard to bring you the best {categoryName.toLowerCase()} services.
                            <br />
                            This page will be available soon with amazing offers and professional services.
                        </p>
                        <Button
                            className="butn px-4 py-2"
                            onClick={() => navigate('/')}
                        >
                            Explore Other Services
                        </Button>
                    </Alert>

                    {/* Optional: Show available categories */}
                    <div className="mt-5">
                        <h5 className="fw-bold mb-3">Meanwhile, check out our other services:</h5>
                        <div className="d-flex gap-3 flex-wrap">
                            <Button
                                variant="outline-primary"
                                onClick={() => navigate('/salon')}
                            >
                                Salon for Women
                            </Button>
                            <Button
                                variant="outline-primary"
                                onClick={() => navigate('/')}
                            >
                                View All Services
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default CategoryPage;
