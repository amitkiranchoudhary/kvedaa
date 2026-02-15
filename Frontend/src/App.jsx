import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Buildings from './pages/Buildings';
import DeviceManager from './pages/DeviceManager';
import Telemetry from './pages/Telemetry';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Signup from './pages/Signup';

// ─── Farm / Cultivation ───
import BatchMonitor from './pages/BatchMonitor';
import Antennary from './pages/Antennary';

// ─── Public Store ───
import StoreFront from './pages/StoreFront';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth State Restoration
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) return null;

  // Protected Routes Wrapper
  const ProtectedRoute = ({ children }) => {
    if (!user) return <Navigate to="/login" replace />;
    return (
      <Layout user={user} onLogout={handleLogout}>
        {children}
      </Layout>
    );
  };

  return (
    <Router>
      <Routes>
        {/* ═══ PUBLIC ROUTES — No authentication needed ═══ */}
        <Route path="/store" element={<StoreFront />} />
        <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!user ? <Signup onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />

        {/* ═══ PROTECTED ROUTES — Owner Dashboard ═══ */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/batches" element={<ProtectedRoute><BatchMonitor /></ProtectedRoute>} />
        <Route path="/antennary" element={<ProtectedRoute><Antennary /></ProtectedRoute>} />
        <Route path="/buildings" element={<ProtectedRoute><Buildings /></ProtectedRoute>} />
        <Route path="/devices" element={<ProtectedRoute><DeviceManager /></ProtectedRoute>} />
        <Route path="/telemetry" element={<ProtectedRoute><Telemetry /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />

        {/* Redirect Root */}
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/store"} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
