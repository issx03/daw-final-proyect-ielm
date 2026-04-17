import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-background text-slate-900 selection:bg-slate-200">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<div className="pt-24 px-6 text-center">Perfil (Próximamente)</div>} />
            <Route path="/boards/:id" element={<div className="pt-24 px-6 text-center">Detalle del Tablero (Próximamente)</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
