import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

import Layout from './components/Common/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import FieldsList from './components/Fields/FieldsList';
import FieldForm from './components/Fields/FieldForm';
import CropsList from './components/Fields/CropsList';
import CropForm from './components/Fields/CropForm';
import OperationsList from './components/Fields/OperationsList';
import SheepList from './components/Sheep/SheepList';
import SheepForm from './components/Sheep/SheepForm';
import SheepDetail from './components/Sheep/SheepDetail';
import VaccinationsList from './components/Sheep/VaccinationsList';
import TreatmentsList from './components/Sheep/TreatmentsList';
import BirthsList from './components/Sheep/BirthsList';
import WaterDashboard from './components/Water/WaterDashboard';
import WaterReadings from './components/Water/WaterReadings';
import Predictions from './components/Water/Predictions';
import Anomalies from './components/Water/Anomalies';

const PrivateRoute = ({ children }) => {
    const { token, loading } = useAuth();
    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
    return token ? children : <Navigate to="/login" />;
};

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="fields" element={<FieldsList />} />
                <Route path="fields/edit/:id" element={<FieldForm />} />
                <Route path="crops" element={<CropsList />} />
                <Route path="crops/edit/:id" element={<CropForm />} />
                <Route path="operations" element={<OperationsList />} />
                <Route path="sheep" element={<SheepList />} />
                <Route path="sheep/edit/:id" element={<SheepForm />} />
                <Route path="sheep/:id" element={<SheepDetail />} />
                <Route path="vaccinations" element={<VaccinationsList />} />
                <Route path="treatments" element={<TreatmentsList />} />
                <Route path="births" element={<BirthsList />} />
                <Route path="water" element={<WaterDashboard />} />
                <Route path="water/readings" element={<WaterReadings />} />
                <Route path="water/predictions" element={<Predictions />} />
                <Route path="water/anomalies" element={<Anomalies />} />
            </Route>
        </Routes>
    );
}

function App() {
    return (
        <LanguageProvider>
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <AppRoutes />
                    <ToastContainer
                        position="top-left"
                        autoClose={3000}
                        hideProgressBar={false}
                        rtl={true}
                        theme="colored"
                    />
                </Router>
            </AuthProvider>
        </ThemeProvider>
        </LanguageProvider>
    );
}

export default App;
