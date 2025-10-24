import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/index';
import { getCampaign } from '../store/slices/campaignSlice';
import FormularioVotacion from '../components/FormularioVotacion';
import GraficoResultados from '../components/GraficoResultados';
import NavigationBar from '../components/NavigationBar';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

const DetalleCampana: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const { activeCampaign: campana, isLoading, error } = useSelector((state: RootState) => state.campaign);
    const [tiempoRestante, setTiempoRestante] = useState<string>('');

    useEffect(() => {
        if (id) {
            dispatch(getCampaign(id));
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (campana?.fechaFin) {
            const intervalo = setInterval(() => {
                const ahora = moment();
                const fin = moment(campana.fechaFin);
                const duracion = moment.duration(fin.diff(ahora));

                if (duracion.asMilliseconds() <= 0) {
                    setTiempoRestante('Votación finalizada');
                    clearInterval(intervalo);
                } else {
                    setTiempoRestante(
                        `${duracion.days()}d ${duracion.hours()}h ${duracion.minutes()}m ${duracion.seconds()}s`
                    );
                }
            }, 1000);

            return () => clearInterval(intervalo);
        }
    }, [campana?.fechaFin]);

    if (isLoading) {
        return (
            <>
                <NavigationBar />
                <Container className="mt-4">
                    <div className="text-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                </Container>
            </>
        );
    }

    if (error || !campana) {
        return (
            <>
                <NavigationBar />
                <Container className="mt-4">
                    <div className="alert alert-danger">
                        {error || 'No se pudo cargar la campaña'}
                    </div>
                </Container>
            </>
        );
    }

    const totalVotos = campana.candidatos.reduce((sum: number, c: { votos: number }) => sum + c.votos, 0);

    return (
        <>
            <NavigationBar />
            <Container className="py-4">
                <Card className="mb-4">
                    <Card.Header>
                        <h2>{campana.titulo}</h2>
                    </Card.Header>
                    <Card.Body>
                        <p>{campana.descripcion}</p>
                        <Row className="mt-3">
                            <Col md={6}>
                                <p>
                                    <strong>Estado:</strong>{' '}
                                    <span className={`text-${campana.estado === 'habilitada' ? 'success' : 'danger'}`}>
                                        {campana.estado === 'habilitada' ? 'Activa' : 'Inactiva'}
                                    </span>
                                </p>
                            </Col>
                            <Col md={6}>
                                <p>
                                    <strong>Tiempo restante:</strong>{' '}
                                    {tiempoRestante}
                                </p>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Row>
                    <Col md={6}>
                        <Card className="mb-4">
                            <Card.Header>
                                <h3>Emitir Voto</h3>
                            </Card.Header>
                            <Card.Body>
                                {campana.estado === 'habilitada' ? (
                                    <FormularioVotacion
                                        campaignId={campana._id}
                                        candidatos={campana.candidatos}
                                        votosDisponibles={campana.cantidadVotosPorCampana}
                                        onVoteComplete={() => dispatch(getCampaign(id!))}
                                    />
                                ) : (
                                    <div className="alert alert-info">
                                        La votación no está disponible en este momento.
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card>
                            <Card.Header>
                                <h3>Resultados Actuales</h3>
                            </Card.Header>
                            <Card.Body>
                                <GraficoResultados
                                    candidatos={campana.candidatos}
                                    totalVotos={totalVotos}
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default DetalleCampana;