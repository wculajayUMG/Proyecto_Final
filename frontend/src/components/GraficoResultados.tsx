import React from 'react';
import { ProgressBar } from 'react-bootstrap';
import { Candidato } from '../types';

interface GraficoResultadosProps {
    candidatos: Candidato[];
    totalVotos: number;
}

const GraficoResultados: React.FC<GraficoResultadosProps> = ({ candidatos, totalVotos }) => {
    const colors = [
        'primary',
        'success',
        'info',
        'warning',
        'danger',
        'secondary'
    ];

    return (
        <div className="resultados-container">
            {candidatos.map((candidato, index) => {
                const porcentaje = totalVotos > 0 
                    ? (candidato.votos / totalVotos) * 100 
                    : 0;

                return (
                    <div key={candidato._id} className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                            <span>{candidato.nombreCompleto}</span>
                            <span>
                                {candidato.votos} votos ({porcentaje.toFixed(1)}%)
                            </span>
                        </div>
                        <ProgressBar
                            variant={colors[index % colors.length]}
                            now={porcentaje}
                            label={`${porcentaje.toFixed(1)}%`}
                        />
                    </div>
                );
            })}

            <div className="text-muted mt-3">
                Total de votos emitidos: {totalVotos}
            </div>
        </div>
    );
};

export default GraficoResultados;