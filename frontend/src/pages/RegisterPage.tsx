import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store/index';
import moment from 'moment';

const RegisterPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { error, isLoading } = useSelector((state: RootState) => state.auth);

    const [formData, setFormData] = useState({
        numeroColegiado: '',
        nombreCompleto: '',
        correoElectronico: '',
        dpi: '',
        fechaNacimiento: '',
        password: '',
        confirmPassword: ''
    });

    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const validateForm = () => {
        const errors: string[] = [];

        if (formData.password !== formData.confirmPassword) {
            errors.push('Las contraseñas no coinciden');
        }

        if (formData.password.length < 8) {
            errors.push('La contraseña debe tener al menos 8 caracteres');
        }

        if (!/^ING\d{3,}$/.test(formData.numeroColegiado)) {
            errors.push('El número de colegiado debe comenzar con ING seguido de al menos 3 dígitos');
        }

        if (!/^\d{13}$/.test(formData.dpi)) {
            errors.push('El DPI debe tener exactamente 13 dígitos');
        }

        setValidationErrors(errors);
        return errors.length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            const { confirmPassword, ...registerData } = formData;
            await dispatch(register({
                ...registerData,
                fechaNacimiento: new Date(formData.fechaNacimiento)
            })).unwrap();
            navigate('/dashboard');
        } catch (error: any) {
            // Manejar los errores del backend
            const errorDetails = error?.details?.password?.requirements || [];
            if (errorDetails.length > 0) {
                setValidationErrors([
                    error?.details?.password?.message,
                    ...errorDetails
                ]);
            } else if (error?.message) {
                setValidationErrors([error.message]);
            } else {
                setValidationErrors(['Error al registrar el usuario']);
            }
        }
    };

    return (
        <Container className="py-5">
            <div className="form-container">
                <h2 className="text-center mb-4">Registro de Votante</h2>

                {error && <Alert variant="danger">{error}</Alert>}
                
                {validationErrors.length > 0 && (
                    <Alert variant="danger">
                        <ul className="mb-0">
                            {validationErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Número de Colegiado</Form.Label>
                        <Form.Control
                            type="text"
                            name="numeroColegiado"
                            value={formData.numeroColegiado}
                            onChange={handleChange}
                            required
                            placeholder="Ej: ING123"
                        />
                    </Form.Group>

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
                        <Form.Label>Correo Electrónico</Form.Label>
                        <Form.Control
                            type="email"
                            name="correoElectronico"
                            value={formData.correoElectronico}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>DPI</Form.Label>
                        <Form.Control
                            type="text"
                            name="dpi"
                            value={formData.dpi}
                            onChange={handleChange}
                            required
                            placeholder="13 dígitos"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Fecha de Nacimiento</Form.Label>
                        <Form.Control
                            type="date"
                            name="fechaNacimiento"
                            value={formData.fechaNacimiento}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Contraseña</Form.Label>
                        <Form.Control
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Confirmar Contraseña</Form.Label>
                        <Form.Control
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Button 
                        variant="primary" 
                        type="submit" 
                        className="w-100"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Registrando...' : 'Registrarse'}
                    </Button>
                </Form>

                <div className="mt-3 text-center">
                    <p>
                        ¿Ya tienes una cuenta?{' '}
                        <Link to="/login">Inicia sesión aquí</Link>
                    </p>
                </div>
            </div>
        </Container>
    );
};

export default RegisterPage;