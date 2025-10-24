import React, { useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/index';
import { AuthState } from '../store/slices/authSlice';
import { CampaignState } from '../store/slices/campaignSlice';
import { Campana } from '../types';
import { fetchCampaigns } from '../store/slices/campaignSlice';
import CampanaCard from '../components/CampanaCard';
import NavigationBar from '../components/NavigationBar';

const Dashboard: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { campaigns, isLoading, error } = useSelector((state: RootState) => state.campaign as CampaignState);
    const { user } = useSelector((state: RootState) => state.auth as AuthState);

    useEffect(() => {
        dispatch(fetchCampaigns());
    }, [dispatch]);

    return (
        <>
            <NavigationBar />
            <div className="dashboard-page">
                <Container>
                <h2 className="mb-4">
                    Bienvenido, {user?.nombreCompleto}
                </h2>

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <Row>
                            {campaigns.map((campana: Campana) => (
                                <Col key={campana._id} md={6} lg={4}>
                                    <CampanaCard campana={campana} />
                                </Col>
                            ))}
                        </Row>

                        {campaigns.length === 0 && !isLoading && (
                            <div className="text-center mt-4">
                                <p>No hay campañas disponibles en este momento.</p>
                            </div>
                        )}
                    </>
                )}
                </Container>
            </div>
        </>
    );
};

export default Dashboard;