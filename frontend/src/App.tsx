import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/index';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import DetalleCampana from './pages/DetalleCampana';
import CampanasPage from './pages/CampanasPage';
import GestionCampanasPage from './pages/GestionCampanasPage';
import ProtectedRoute from './components/ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.scss';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/campanas" 
              element={
                <ProtectedRoute>
                  <CampanasPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/campanas/:id" 
              element={
                <ProtectedRoute>
                  <DetalleCampana />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/campanas" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <GestionCampanasPage />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
