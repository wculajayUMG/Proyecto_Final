import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchCampaigns } from '../store/slices/campaignSlice';
import { AppDispatch, RootState } from '../store';
import NavigationBar from '../components/NavigationBar';

const CampanasPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { campaigns, isLoading, error } = useSelector((state: RootState) => state.campaign);

    useEffect(() => {
        dispatch(fetchCampaigns());
    }, [dispatch]);

    if (isLoading) return <div>Cargando...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <NavigationBar />
            <div className="campanas-page">
                <Container>
                <h2 className="mb-4">Campañas Disponibles</h2>
                <Row>
                    {campaigns.map(campaign => (
                        <Col key={campaign._id} md={4} className="mb-4">
                            <Card>
                                <Card.Body>
                                    <Card.Title>{campaign.titulo}</Card.Title>
                                    <Card.Text>{campaign.descripcion}</Card.Text>
                                    <Link 
                                        to={`/campanas/${campaign._id}`} 
                                        className="btn btn-primary"
                                    >
                                        Ver Detalles
                                    </Link>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
                </Container>
            </div>
        </>
    );
};

export default CampanasPage;