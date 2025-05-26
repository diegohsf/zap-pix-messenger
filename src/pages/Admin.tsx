
import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from '@/components/AdminDashboard';

const Admin: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Verificar se já está logado
    const loggedIn = localStorage.getItem('admin_logged_in') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
};

export default Admin;
