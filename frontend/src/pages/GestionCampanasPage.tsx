import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Button, Modal } from 'react-bootstrap';
import { fetchCampaigns, toggleCampaignStatus, deleteCampaign } from '../store/slices/campaignSlice';
import { AppDispatch, RootState } from '../store';
import NavigationBar from '../components/NavigationBar';
import CampaignFormModal from '../components/CampaignFormModal';
import CandidateManager from '../components/CandidateManager';
import { Campana } from '../types';

const GestionCampanasPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { campaigns, isLoading, error } = useSelector((state: RootState) => state.campaign);
    const [showModal, setShowModal] = useState(false);
    const [showCandidateModal, setShowCandidateModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campana | null>(null);

    useEffect(() => {
        dispatch(fetchCampaigns());
    }, [dispatch]);

    const handleCreateClick = () => {
        setSelectedCampaign(null);
        setShowModal(true);
    };

    const handleEditClick = (campaign: Campana) => {
        setSelectedCampaign(campaign);
        setShowModal(true);
    };

    const handleToggleStatus = async (id: string, currentStatus: 'habilitada' | 'deshabilitada') => {
        try {
            const newStatus = currentStatus === 'habilitada' ? 'deshabilitada' : 'habilitada';
            await dispatch(toggleCampaignStatus({ id, estado: newStatus })).unwrap();
            dispatch(fetchCampaigns());
        } catch (error) {
            console.error('Error al cambiar el estado de la campaña:', error);
        }
    };

    const handleDeleteClick = (campaign: Campana) => {
        setSelectedCampaign(campaign);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (selectedCampaign) {
            try {
                console.log('Intentando eliminar campaña:', selectedCampaign._id);
                const result = await dispatch(deleteCampaign(selectedCampaign._id)).unwrap();
                console.log('Resultado de eliminar:', result);
                await dispatch(fetchCampaigns()).unwrap();
                setShowDeleteConfirm(false);
                setSelectedCampaign(null);
            } catch (error: any) {
                console.error('Error al eliminar la campaña:', error);
                alert(error.message || 'Error al eliminar la campaña');
            }
        } else {
            console.error('No hay campaña seleccionada para eliminar');
        }
    };

    const handleManageCandidates = (campaign: Campana) => {
        setSelectedCampaign(campaign);
        setShowCandidateModal(true);
    };

    if (isLoading) return <div>Cargando...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <NavigationBar />
            <div className="gestion-campanas-page">
                <Container>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Gestión de Campañas</h2>
                    <Button variant="primary" onClick={handleCreateClick}>
                        Crear Nueva Campaña
                    </Button>
                </div>
                <Row>
                    {campaigns.map(campaign => (
                        <Col key={campaign._id} md={4} className="mb-4">
                            <Card>
                                <Card.Body>
                                    <Card.Title>{campaign.titulo}</Card.Title>
                                    <Card.Text>{campaign.descripcion}</Card.Text>
                                    <Card.Text>
                                        <small className="text-muted">
                                            Estado: {campaign.estado}
                                        </small>
                                    </Card.Text>
                                    <Card.Text>
                                        <small className="text-muted">
                                            Votos permitidos: {campaign.cantidadVotosPorCampana}
                                        </small>
                                    </Card.Text>
                                    <Card.Text>
                                        <small className="text-muted">
                                            Periodo: {new Date(campaign.fechaInicio).toLocaleDateString()} - {new Date(campaign.fechaFin).toLocaleDateString()}
                                        </small>
                                    </Card.Text>
                                    <div className="d-flex flex-wrap gap-2 mt-3">
                                        <div className="d-flex gap-2 me-auto">
                                            <Button 
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => handleEditClick(campaign)}
                                            >
                                                Editar
                                            </Button>
                                            <Button 
                                                variant={campaign.estado === 'habilitada' ? 'outline-danger' : 'outline-success'}
                                                size="sm"
                                                onClick={() => handleToggleStatus(campaign._id, campaign.estado)}
                                            >
                                                {campaign.estado === 'habilitada' ? 'Deshabilitar' : 'Activar'}
                                            </Button>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <Button 
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => handleManageCandidates(campaign)}
                                            >
                                                Gestionar Candidatos
                                            </Button>
                                            <Button 
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDeleteClick(campaign)}
                                            >
                                                Eliminar
                                            </Button>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <CampaignFormModal 
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    campaign={selectedCampaign}
                />

                {selectedCampaign && (
                    <CandidateManager
                        show={showCandidateModal}
                        onHide={() => setShowCandidateModal(false)}
                        campaign={selectedCampaign}
                    />
                )}

                <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirmar Eliminación</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        ¿Está seguro que desea eliminar la campaña "{selectedCampaign?.titulo}"?
                        Esta acción no se puede deshacer.
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                            Cancelar
                        </Button>
                        <Button variant="danger" onClick={handleDeleteConfirm}>
                            Eliminar
                        </Button>
                    </Modal.Footer>
                </Modal>
                </Container>
            </div>
        </>
    );
};

export default GestionCampanasPage;