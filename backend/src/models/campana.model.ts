import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidato extends Document {
    _id: mongoose.Types.ObjectId;
    nombreCompleto: string;
    descripcion: string;
    votos: number;
}

export interface ICampana extends Document {
    titulo: string;
    descripcion: string;
    cantidadVotosPorCampana: number;
    estado: 'habilitada' | 'deshabilitada';
    fechaInicio: Date;
    fechaFin: Date;
    candidatos: {
        _id: mongoose.Types.ObjectId;
        nombreCompleto: string;
        descripcion: string;
        votos: number;
    }[];
    votantes: string[]; // Array de IDs de usuarios que ya votaron como strings
}

const CampanaSchema: Schema = new Schema({
    titulo: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    cantidadVotosPorCampana: {
        type: Number,
        required: true,
        default: 1
    },
    estado: {
        type: String,
        enum: ['habilitada', 'deshabilitada'],
        default: 'deshabilitada'
    },
    fechaInicio: {
        type: Date,
        required: true
    },
    fechaFin: {
        type: Date,
        required: true
    },
    candidatos: [{
        _id: {
            type: Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId()
        },
        nombreCompleto: {
            type: String,
            required: true
        },
        descripcion: {
            type: String,
            required: true
        },
        votos: {
            type: Number,
            default: 0
        }
    }],
    votantes: [{
        type: String // Almacenamos los IDs como strings
    }]
}, {
    timestamps: true
});

export default mongoose.model<ICampana>('Campana', CampanaSchema);