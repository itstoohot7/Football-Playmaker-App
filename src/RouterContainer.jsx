// RouterContainer.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import CancelPage from './pages/CancelPage';
import PayWall from './PayWall';
import ComingSoon from './pages/ComingSoon';
import App from './App';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import OtpScreen from './pages/Otp';

const RouterContainer = () => (
    <Router>
        <Routes>
            <Route path="/bypass" element={<App />} />
            <Route path="/editor" element={<PayWall />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="/cancel" element={<CancelPage />} />
            <Route path="/" element={<Navigate to="/editor" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<SignUp />} />
            <Route path="/verify" element={<OtpScreen />} />
            <Route path="*" element={<ComingSoon>
                <h1>404 Not Found</h1>
            </ComingSoon>} />
        </Routes>
    </Router>
);

export default RouterContainer;