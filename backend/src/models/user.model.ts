import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    numeroColegiado: string;
    nombreCompleto: string;
    correoElectronico: string;
    dpi: string;
    fechaNacimiento: Date;
    password: string;
    rol: 'admin' | 'votante';
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
    numeroColegiado: {
        type: String,
        required: true,
        unique: true
    },
    nombreCompleto: {
        type: String,
        required: true
    },
    correoElectronico: {
        type: String,
        required: true,
        unique: true
    },
    dpi: {
        type: String,
        required: true,
        unique: true
    },
    fechaNacimiento: {
        type: Date,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    rol: {
        type: String,
        enum: ['admin', 'votante'],
        default: 'votante'
    }
}, {
    timestamps: true
});

// Middleware para hashear la contraseña antes de guardar
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    const salt = await bcrypt.genSalt(10);
    const password = this.get('password') as string;
    this.set('password', await bcrypt.hash(password, salt));
    next();
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    const password = this.get('password') as string;
    return bcrypt.compare(candidatePassword, password);
};

export default mongoose.model<IUser>('User', UserSchema);