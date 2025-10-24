import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Candidato } from '../types';
import { vote } from '../store/slices/campaignSlice';
import { AppDispatch } from '../store/index';

interface FormularioVotacionProps {
    campaignId: string;
    candidatos: Candidato[];
    votosDisponibles: number;
    onVoteComplete?: () => void;
}

const FormularioVotacion: React.FC<FormularioVotacionProps> = ({
    campaignId,
    candidatos,
    votosDisponibles,
    onVoteComplete
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showVotingForm, setShowVotingForm] = useState(true);

    // Efecto para controlar cuándo mostrar el formulario
    useEffect(() => {
        if (votosDisponibles <= 0) {
            setShowVotingForm(false);
        }
    }, [votosDisponibles]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedCandidateId) {
            setError('Por favor seleccione un candidato');
            return;
        }

        if (votosDisponibles <= 0) {
            setError('No tiene votos disponibles para esta campaña');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await dispatch(vote({ 
                campaignId, 
                candidateId: selectedCandidateId 
            })).unwrap();
            
            setSelectedCandidateId('');
            setError(''); // Limpiar cualquier error previo
            if (onVoteComplete) {
                onVoteComplete();
            }
        } catch (error: any) {
            console.log('Error en formulario:', error);
            // Asegurarnos de que el error se establezca correctamente
            setError(error?.toString() || 'Error al emitir el voto');
            
            // Si el error indica que no hay más votos disponibles
            if (error?.toString().includes('Ya ha utilizado todos sus votos disponibles')) {
                // Forzar actualización de los votos disponibles
                if (onVoteComplete) {
                    onVoteComplete();
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (error) {
        return (
            <div>
                <Alert variant="danger" onClose={() => setError('')} dismissible>
                    {error}
                </Alert>
                {showVotingForm && votosDisponibles > 0 && (
                    <Button variant="primary" onClick={() => setError('')} className="mt-2">
                        Intentar de nuevo
                    </Button>
                )}
            </div>
        );
    }

    if (!showVotingForm || votosDisponibles <= 0) {
        return (
            <Alert variant="info">
                Ya ha emitido todos sus votos disponibles para esta campaña.
            </Alert>
        );
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
                <Form.Label>Seleccione su candidato:</Form.Label>
                {candidatos.map(candidato => (
                    <div key={candidato._id} className="mb-3">
                        <Form.Check
                            type="radio"
                            id={`candidato-${candidato._id}`}
                            name="candidato"
                            value={candidato._id}
                            checked={selectedCandidateId === candidato._id}
                            onChange={(e) => setSelectedCandidateId(e.target.value)}
                            label={
                                <div className="d-flex align-items-center">
                                    <div>
                                        <strong>{candidato.nombreCompleto}</strong>
                                        <br />
                                        <small className="text-muted">{candidato.descripcion}</small>
                                    </div>
                                </div>
                            }
                        />
                    </div>
                ))}
            </Form.Group>

            <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                    Votos disponibles: {Math.max(0, votosDisponibles)}
                </small>
                <Button 
                    type="submit" 
                    disabled={isSubmitting || !selectedCandidateId || votosDisponibles <= 0}
                    variant={votosDisponibles > 0 ? "primary" : "secondary"}
                >
                    {isSubmitting ? 'Emitiendo voto...' : 'Votar'}
                </Button>
            </div>
        </Form>
    );
};

export default FormularioVotacion;