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
import About from './pages/About';
import Products from './pages/Products';
import Quality from './pages/Quality';

// Protected Routes Wrapper
const ProtectedRoute = ({ user, handleLogout, children }) => {
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'amitkchoudhary2019@gmail.com';

  if (!user) return <Navigate to="/login" replace />;
  if (user.email !== adminEmail) return <Navigate to="/store" replace />;

  return (
    <Layout user={user} onLogout={handleLogout}>
      {children}
    </Layout>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cart State (Persisted)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('kvedaa_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('kvedaa_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id !== id) return i;
      const newQty = i.qty + delta;
      return newQty > 0 ? { ...i, qty: newQty } : i;
    }).filter(i => i.qty > 0));
  };

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

  return (
    <Router>
      <Routes>
        {/* ═══ PUBLIC ROUTES — No authentication needed ═══ */}
        <Route path="/store" element={<StoreFront onLogin={handleLogin} user={user} cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} updateQty={updateQty} />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<Products cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} updateQty={updateQty} />} />
        <Route path="/quality" element={<Quality />} />
        <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to={user.email === (import.meta.env.VITE_ADMIN_EMAIL || 'amitkchoudhary2019@gmail.com') ? "/dashboard" : "/store"} />} />
        <Route path="/signup" element={!user ? <Signup onLogin={handleLogin} /> : <Navigate to={user.email === (import.meta.env.VITE_ADMIN_EMAIL || 'amitkchoudhary2019@gmail.com') ? "/dashboard" : "/store"} />} />

        {/* ═══ PROTECTED ROUTES — Owner Dashboard ═══ */}
        <Route path="/dashboard" element={<ProtectedRoute user={user} handleLogout={handleLogout}><Dashboard /></ProtectedRoute>} />
        <Route path="/batches" element={<ProtectedRoute user={user} handleLogout={handleLogout}><BatchMonitor /></ProtectedRoute>} />
        <Route path="/antennary" element={<ProtectedRoute user={user} handleLogout={handleLogout}><Antennary /></ProtectedRoute>} />
        <Route path="/buildings" element={<ProtectedRoute user={user} handleLogout={handleLogout}><Buildings /></ProtectedRoute>} />
        <Route path="/devices" element={<ProtectedRoute user={user} handleLogout={handleLogout}><DeviceManager /></ProtectedRoute>} />
        <Route path="/telemetry" element={<ProtectedRoute user={user} handleLogout={handleLogout}><Telemetry /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute user={user} handleLogout={handleLogout}><Alerts /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute user={user} handleLogout={handleLogout}><Analytics /></ProtectedRoute>} />

        {/* Redirect Root */}
        <Route path="/" element={<Navigate to="/store" replace />} />
        <Route path="*" element={<Navigate to="/store" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
