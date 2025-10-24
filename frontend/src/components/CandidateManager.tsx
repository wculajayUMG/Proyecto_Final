import React, { useState } from 'react';
import { Modal, Form, Button, ListGroup } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { Campana } from '../types';
import api from '../services/api';
import { fetchCampaigns } from '../store/slices/campaignSlice';

interface CandidateFormData {
    nombreCompleto: string;
    descripcion: string;
}

interface ModalProps {
    show: boolean;
    onHide: () => void;
    campaign: Campana;
}

const CandidateManager = ({ show, onHide, campaign }: ModalProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const [formData, setFormData] = useState<CandidateFormData>({
        nombreCompleto: '',
        descripcion: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Eliminada la función handleFileChange ya que no se manejan imágenes

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        // Validaciones del lado del cliente
        if (!formData.nombreCompleto.trim()) {
            setError('El nombre completo es requerido');
            setIsSubmitting(false);
            return;
        }

        if (!formData.descripcion.trim()) {
            setError('La descripción es requerida');
            setIsSubmitting(false);
            return;
        }
        
        try {
            // Validar que tengamos un ID de campaña válido
            if (!campaign._id) {
                throw new Error('ID de campaña no válido');
            }

            // Preparar los datos del candidato con votos inicializados a 0
            const candidatoData = {
                nombreCompleto: formData.nombreCompleto.trim(),
                descripcion: formData.descripcion.trim(),
                votos: 0  // Asegurarnos de que el candidato tenga votos inicializados
            };

            // Log detallado para depuración
            console.log('Intentando agregar candidato:', {
                url: `/campanas/${campaign._id}/candidatos`,
                data: candidatoData,
                campaignId: campaign._id
            });

            console.log('Enviando solicitud al servidor:', {
                url: `/campanas/${campaign._id}/candidatos`,
                data: candidatoData
            });

            const response = await api.post(
                `/campanas/${campaign._id}/candidatos`, 
                candidatoData,
                {
                    timeout: 5000, // 5 segundos de timeout
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            console.log('Respuesta del servidor:', response.data);
            
            if (response.status === 201 || response.status === 200) {
                // Limpiar el formulario
                setFormData({
                    nombreCompleto: '',
                    descripcion: '',
                });
                
                // Actualizar la lista de campañas
                await dispatch(fetchCampaigns()).unwrap();
                
                // Cerrar el modal
                onHide();
            }
        } catch (error: any) {
            console.error('Error al agregar candidato:', error);
            
            let errorMessage = 'Error al agregar el candidato. Por favor, intente de nuevo.';
            
            if (error.response) {
                // Log detallado del error
                const errorDetails = {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data,
                    message: error.message,
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers,
                    requestData: error.config?.data
                };
                
                console.error('Error detallado del servidor:', errorDetails);
                
                // Si hay un mensaje específico del servidor, lo usamos
                if (error.response.data) {
                    if (typeof error.response.data === 'string') {
                        errorMessage = error.response.data;
                    } else if (error.response.data.message) {
                        errorMessage = error.response.data.message;
                    } else if (error.response.data.error) {
                        errorMessage = error.response.data.error;
                    } else {
                        errorMessage = `Error del servidor (${error.response.status}): ${JSON.stringify(error.response.data)}`;
                    }
                }
            } else if (error.request) {
                console.error('Error de conexión:', {
                    message: error.message,
                    request: error.request
                });
                errorMessage = 'No se pudo conectar con el servidor. Por favor, verifique su conexión.';
            } else {
                console.error('Error de configuración:', {
                    message: error.message,
                    config: error.config
                });
                errorMessage = 'Error en la configuración de la solicitud: ' + error.message;
            }
            
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCandidate = async (candidatoId: string) => {
        if (window.confirm('¿Está seguro que desea eliminar este candidato?')) {
            try {
                await api.delete(`/campanas/${campaign._id}/candidatos/${candidatoId}`);
                await dispatch(fetchCampaigns()).unwrap();
            } catch (error) {
                console.error('Error al eliminar candidato:', error);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Gestionar Candidatos - {campaign.titulo}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-4">
                    <h5>Candidatos Actuales</h5>
                    <ListGroup>
                        {campaign.candidatos?.map((candidato) => (
                            <ListGroup.Item key={candidato._id} className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6>{candidato.nombreCompleto}</h6>
                                    <small>{candidato.descripcion}</small>
                                    <div><small className="text-muted">Votos: {candidato.votos}</small></div>
                                </div>
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => candidato._id && handleDeleteCandidate(candidato._id)}
                                >
                                    Eliminar
                                </Button>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </div>

                <h5>Agregar Nuevo Candidato</h5>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre Completo</Form.Label>
                        <Form.Control
                            type="text"
                            name="nombreCompleto"
                            value={formData.nombreCompleto}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}
                    
                    <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Agregando...' : 'Agregar Candidato'}
                    </Button>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CandidateManager;