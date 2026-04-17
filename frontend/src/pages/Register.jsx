import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      await axios.post('/auth/register', {
        username,
        email,
        password,
      });

      // Login automatically after registration
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const loginResponse = await axios.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      localStorage.setItem('token', loginResponse.data.access_token);
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Error al registrarse. Asegurate de completar todos los campos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-editorial p-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif text-slate-800 mb-2">Creá tu cuenta</h1>
          <p className="text-slate-500">Unite a la comunidad Trellix</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm leading-relaxed">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 block ml-1">Nombre de usuario</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-0 transition-all outline-none bg-slate-50/50"
              placeholder="tu_usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 block ml-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-0 transition-all outline-none bg-slate-50/50"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 block ml-1">Contraseña</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-0 transition-all outline-none bg-slate-50/50"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 block ml-1">Confirmar contraseña</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-0 transition-all outline-none bg-slate-50/50"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-medium shadow-soft hover:bg-slate-800 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'Creando cuenta...' : 'Empezar ahora'}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-sm">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-slate-900 font-semibold hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
