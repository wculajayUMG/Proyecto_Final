import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store/index';
import moment from 'moment';

const LoginPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { error, isLoading } = useSelector((state: RootState) => state.auth);

    const [formData, setFormData] = useState({
        numeroColegiado: '',
        dpi: '',
        fechaNacimiento: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dispatch(login({
                ...formData,
                fechaNacimiento: moment(formData.fechaNacimiento).toISOString()
            })).unwrap();
            navigate('/dashboard');
        } catch (error) {
            // Error ya manejado por el slice
        }
    };

    return (
        <div className="login-page">
            <div className="header-band">
                <span className="header-text left">Colegio</span>
                <img 
                    src="/logo-cig.png" 
                    alt="Logo CIG" 
                    className="header-logo"
                />
                <span className="header-text right">Ingenieros</span>
            </div>
            <Container>
                <div className="form-container">
                <h2 className="text-center mb-4">Iniciar Sesión</h2>
                
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Número de Colegiado</Form.Label>
                        <Form.Control
                            type="text"
                            name="numeroColegiado"
                            value={formData.numeroColegiado}
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

                    <Button 
                        variant="primary" 
                        type="submit" 
                        className="w-100"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </Button>
                </Form>

                <div className="mt-3 text-center">
                    <p>
                        ¿No tienes una cuenta?{' '}
                        <Link to="/register">Regístrate aquí</Link>
                    </p>
                </div>
                </div>
            </Container>
        </div>
    );
};

export default LoginPage;