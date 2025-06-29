import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DemoGame from './pages/DemoGame';
import Dashboard from './pages/Dashboard';
import GamePage from './pages/GamePage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import LoadingSpinner from './components/LoadingSpinner';

function AppRoutes() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route path="/" element={!user ? <HomePage /> : <Navigate to="/dashboard" />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />
      
      {/* Protected User Routes */}
      <Route 
        path="/demo" 
        element={user && !user.hasPlayedDemo ? <DemoGame /> : <Navigate to="/dashboard" />} 
      />
      <Route 
        path="/dashboard" 
        element={user ? (
          !user.hasPlayedDemo ? <Navigate to="/demo" /> : <Dashboard />
        ) : <Navigate to="/login" />} 
      />
      <Route 
        path="/game" 
        element={user && user.hasPlayedDemo ? <GamePage /> : <Navigate to="/dashboard" />} 
      />

      {/* Admin Routes */}
      <Route path="/admin" element={!isAdmin ? <AdminLogin /> : <Navigate to="/admin/dashboard" />} />
      <Route 
        path="/admin/dashboard" 
        element={isAdmin ? <AdminDashboard /> : <Navigate to="/admin" />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
              
              {/* Floating Dots */}
              <div className="absolute top-20 left-20 w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-300"></div>
              <div className="absolute top-40 right-32 w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-700"></div>
              <div className="absolute bottom-32 left-40 w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-1000"></div>
              <div className="absolute bottom-20 right-20 w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-500"></div>
              
              {/* Grid Pattern - Using CSS instead of SVG data URL */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                  backgroundSize: '20px 20px'
                }}
              ></div>
            </div>
            
            <div className="relative z-10">
              <AppRoutes />
            </div>
            
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(17, 24, 39, 0.95)',
                  color: '#f9fafb',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                },
              }}
            />
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;