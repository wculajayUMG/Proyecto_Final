export interface User {
    _id: string;
    numeroColegiado: string;
    nombreCompleto: string;
    correoElectronico: string;
    dpi: string;
    fechaNacimiento: Date;
    rol: 'admin' | 'votante';
}

export interface Candidato {
    _id?: string;
    nombreCompleto: string;
    descripcion: string;
    imagen: string;
    votos: number;
}

export interface Campana {
    _id: string;
    titulo: string;
    descripcion: string;
    cantidadVotosPorCampana: number;
    estado: 'habilitada' | 'deshabilitada';
    fechaInicio: Date;
    fechaFin: Date;
    candidatos: Candidato[];
    votantes: string[]; // Array de IDs de usuarios que ya votaron
}