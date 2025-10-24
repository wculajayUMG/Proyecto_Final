import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { createCampaign, updateCampaign, fetchCampaigns } from '../store/slices/campaignSlice';
import { Campana } from '../types';

// Interfaz para los datos del formulario (con fechas como string para el input date)
interface CampaignFormData {
    titulo: string;
    descripcion: string;
    cantidadVotosPorCampana: number;
    fechaInicio: string;
    fechaFin: string;
}

interface CampaignFormModalProps {
    show: boolean;
    onHide: () => void;
    campaign?: Campana | null; // Permitimos null o undefined
}

const CampaignFormModal: React.FC<CampaignFormModalProps> = ({ show, onHide, campaign }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [formData, setFormData] = useState<CampaignFormData>({
        titulo: '',
        descripcion: '',
        cantidadVotosPorCampana: 1,
        fechaInicio: '',
        fechaFin: ''
    });

    useEffect(() => {
        if (campaign) {
            setFormData({
                titulo: campaign.titulo,
                descripcion: campaign.descripcion,
                cantidadVotosPorCampana: campaign.cantidadVotosPorCampana,
                fechaInicio: campaign.fechaInicio ? new Date(campaign.fechaInicio).toISOString().split('T')[0] : '',
                fechaFin: campaign.fechaFin ? new Date(campaign.fechaFin).toISOString().split('T')[0] : ''
            });
        } else {
            // Resetear el formulario cuando no hay campaña seleccionada
            setFormData({
                titulo: '',
                descripcion: '',
                cantidadVotosPorCampana: 1,
                fechaInicio: '',
                fechaFin: ''
            });
        }
    }, [campaign]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const campaignData = {
                ...formData,
                fechaInicio: new Date(formData.fechaInicio),
                fechaFin: new Date(formData.fechaFin)
            };

            if (campaign && campaign._id) {
                console.log('Actualizando campaña:', campaign._id);
                await dispatch(updateCampaign({ 
                    id: campaign._id, 
                    ...campaignData
                })).unwrap();
                console.log('Campaña actualizada exitosamente');
            } else {
                await dispatch(createCampaign(campaignData)).unwrap();
            }
            // Actualizar la lista de campañas después de crear/editar
            await dispatch(fetchCampaigns());
            onHide();
            // Limpiar el formulario
            setFormData({
                titulo: '',
                descripcion: '',
                cantidadVotosPorCampana: 1,
                fechaInicio: '',
                fechaFin: ''
            });
        } catch (error) {
            console.error('Error al guardar la campaña:', error);
            alert('Error al guardar la campaña. Por favor, inténtelo de nuevo.');
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
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{campaign ? 'Editar Campaña' : 'Crear Nueva Campaña'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Título</Form.Label>
                        <Form.Control
                            type="text"
                            name="titulo"
                            value={formData.titulo}
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

                    <Form.Group className="mb-3">
                        <Form.Label>Cantidad de votos por campaña</Form.Label>
                        <Form.Control
                            type="number"
                            name="cantidadVotosPorCampana"
                            value={formData.cantidadVotosPorCampana}
                            onChange={handleChange}
                            min="1"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Fecha de inicio</Form.Label>
                        <Form.Control
                            type="date"
                            name="fechaInicio"
                            value={formData.fechaInicio}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Fecha de fin</Form.Label>
                        <Form.Control
                            type="date"
                            name="fechaFin"
                            value={formData.fechaFin}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit">
                        {campaign ? 'Guardar Cambios' : 'Crear Campaña'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default CampaignFormModal;