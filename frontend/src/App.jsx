import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import BoardView from './pages/BoardView';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import Admin from './pages/Admin';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/common/Sidebar';
import { useAuth } from './context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import Footer from './components/common/Footer';

const ProtectedLayout = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1E1E28]">
        <div className="animate-pulse text-[#6B7280] text-sm">Verifying session...</div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-[#1E1E28] overflow-hidden">
      <Sidebar />
      <div className="flex-1 lg:ml-[260px] h-full overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

const AdminRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user?.role === 'admin' ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Routes>
            <Route path="/" element={<><Navbar /><Landing /><FooterWrapper /></>} />
            <Route path="/login" element={<><Navbar /><Login /></>} />
            <Route path="/register" element={<><Navbar /><Register /></>} />
            
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/boards/:id" element={<BoardView />} />
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<Admin />} />
              </Route>
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

const FooterWrapper = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  if (!isLanding) return null;
  return <Footer />;
};

export default App;
