import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HealthProvider } from './context/HealthContext';

// Components
import Navbar from './components/layout/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Profile from './components/Profile/Profile';
import HealthLog from './components/HealthLog/HealthLog';
import Analytics from './components/Analytics/Analytics';
import AIChat from './components/AI/AIChat';
import Landing from './components/Landing/Landing';

function App() {
  return (
    <AuthProvider>
      <HealthProvider>
        <Router>
          <div className="App min-h-screen bg-gray-50">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
            <AppRoutes />
          </div>
        </Router>
      </HealthProvider>
    </AuthProvider>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <Landing />}
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" /> : <Register />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/login" />}
        />
        <Route
          path="/log"
          element={user ? <HealthLog /> : <Navigate to="/login" />}
        />
        <Route
          path="/analytics"
          element={user ? <Analytics /> : <Navigate to="/login" />}
        />
        <Route
          path="/chat"
          element={user ? <AIChat /> : <Navigate to="/login" />}
        />
      </Routes>
    </>
  );
}

export default App;
