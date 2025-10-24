import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Campana } from '../types';
import moment from 'moment';
import 'moment/locale/es';

interface CampanaCardProps {
    campana: Campana;
}

const CampanaCard: React.FC<CampanaCardProps> = ({ campana }) => {
    const fechaInicio = moment(campana.fechaInicio).format('LL');
    const fechaFin = moment(campana.fechaFin).format('LL');
    const estaActiva = campana.estado === 'habilitada';

    return (
        <Card className="mb-4">
            <Card.Body>
                <Card.Title>{campana.titulo}</Card.Title>
                <Badge 
                    bg={estaActiva ? 'success' : 'secondary'}
                    className="mb-2"
                >
                    {estaActiva ? 'Activa' : 'Inactiva'}
                </Badge>
                <Card.Text>{campana.descripcion}</Card.Text>
                <div className="mb-3">
                    <small className="text-muted">
                        Periodo de votación: {fechaInicio} - {fechaFin}
                    </small>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <small className="text-muted">
                            Candidatos: {campana.candidatos.length}
                        </small>
                    </div>
                    <Link 
                        to={`/campanas/${campana._id}`}
                        className="btn btn-primary"
                    >
                        Ver Detalles
                    </Link>
                </div>
            </Card.Body>
        </Card>
    );
};

export default CampanaCard;