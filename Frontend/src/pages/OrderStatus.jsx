import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, Truck, CheckCircle2, Clock, XCircle, ChevronDown,
    ShoppingCart, ArrowLeft, Leaf, RefreshCw, AlertCircle
} from 'lucide-react';
import { orderAPI } from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/* ═══════════════════════════════════════════
   ORDER STATUS STEPS — Visual Progress Tracker
   ═══════════════════════════════════════════ */
const STATUS_STEPS = [
    { key: 'PENDING', label: 'Order Placed', icon: Clock, color: '#fbbf24' },
    { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2, color: '#34d399' },
    { key: 'SHIPPED', label: 'Shipped', icon: Truck, color: '#60a5fa' },
    { key: 'DELIVERED', label: 'Delivered', icon: Package, color: '#7cb342' },
];

const STATUS_COLORS = {
    PENDING: { bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.25)', text: '#fbbf24' },
    CONFIRMED: { bg: 'rgba(52, 211, 153, 0.1)', border: 'rgba(52, 211, 153, 0.25)', text: '#34d399' },
    SHIPPED: { bg: 'rgba(96, 165, 250, 0.1)', border: 'rgba(96, 165, 250, 0.25)', text: '#60a5fa' },
    DELIVERED: { bg: 'rgba(124, 179, 66, 0.1)', border: 'rgba(124, 179, 66, 0.25)', text: '#7cb342' },
    CANCELLED: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.25)', text: '#ef4444' },
};

export default function OrderStatus() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [cancelling, setCancelling] = useState(null);
    const navigate = useNavigate();

    const user = (() => {
        try {
            const saved = localStorage.getItem('user');
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    })();

    useEffect(() => {
        if (!user) {
            navigate('/store');
            return;
        }
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await orderAPI.getMyOrders();
            setOrders(res.data || []);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            if (err.response?.status === 401) {
                // Token expired — redirect to store for re-login
                navigate('/store');
                return;
            }
            setError(err.response?.data?.detail || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (orderId) => {
        setCancelling(orderId);
        try {
            await orderAPI.cancel(orderId);
            await fetchOrders();
        } catch (err) {
            console.error('Cancel failed:', err);
        } finally {
            setCancelling(null);
        }
    };

    const getStatusIndex = (status) => STATUS_STEPS.findIndex(s => s.key === status);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen bg-forest-darkest text-forest-text font-sans relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-15%] left-[20%] w-[50%] h-[40%] rounded-full bg-forest-spring/[0.04] blur-[180px]" />
                <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[35%] rounded-full bg-forest-gold/[0.03] blur-[150px]" />
            </div>

            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-forest-border/20 shadow-lg"
                style={{ background: 'linear-gradient(180deg, rgba(5, 13, 5, 0.95), rgba(5, 13, 5, 0.88))', backdropFilter: 'blur(20px)' }}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/store" className="flex items-center">
                        <img src="/assets/kvedaa-logo.png" alt="KiranVedaa" className="h-28 w-auto object-contain"
                            style={{ filter: 'drop-shadow(0 0 10px rgba(124, 179, 66, 0.35)) brightness(1.1)' }} />
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link to="/store" className="text-sm text-forest-muted hover:text-forest-cream transition-colors flex items-center gap-1.5">
                            <ArrowLeft className="w-4 h-4" /> Back to Store
                        </Link>
                        <Link to="/products" className="text-sm text-forest-muted hover:text-forest-cream transition-colors hidden sm:block">Products</Link>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 pt-40 pb-24 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <span className="text-[11px] uppercase tracking-[0.25em] text-forest-spring font-bold mb-2 block">Order Tracking</span>
                        <h1 className="text-3xl md:text-4xl font-bold text-forest-cream font-display">My Orders</h1>
                    </div>
                    <button onClick={fetchOrders}
                        className="p-3 rounded-xl border border-forest-border/20 hover:border-forest-border/40 text-forest-muted hover:text-forest-cream transition-all active:scale-95"
                        title="Refresh">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center py-24">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-forest-spring" />
                            <Package className="w-6 h-6 text-forest-spring absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                    </div>
                )}

                {/* Error — show friendly empty state instead of scary error */}
                {error && !loading && (
                    <div className="text-center py-24">
                        <span className="text-7xl block mb-5">🛒</span>
                        <h3 className="text-2xl font-semibold text-forest-muted font-display mb-3">No orders yet!</h3>
                        <p className="text-sm text-forest-muted/50 mb-8 max-w-md mx-auto">
                            Would you like to get something for yourself? Browse our collection of premium natural products.
                        </p>
                        <Link to="/store"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold transition-all active:scale-95"
                            style={{
                                background: 'linear-gradient(135deg, #2d5a27, #7cb342, #f57c00)',
                                boxShadow: '0 6px 30px rgba(124, 179, 66, 0.25)',
                            }}>
                            <ShoppingCart className="w-5 h-5" /> Browse Products
                        </Link>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && orders.length === 0 && (
                    <div className="text-center py-24">
                        <span className="text-7xl block mb-5">📦</span>
                        <h3 className="text-2xl font-semibold text-forest-muted font-display mb-3">No Orders Yet</h3>
                        <p className="text-sm text-forest-muted/50 mb-8 max-w-md mx-auto">
                            You haven't placed any orders yet. Head to the store and explore our natural products!
                        </p>
                        <Link to="/products"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold transition-all active:scale-95"
                            style={{
                                background: 'linear-gradient(135deg, #2d5a27, #7cb342, #f57c00)',
                                boxShadow: '0 6px 30px rgba(124, 179, 66, 0.25)',
                            }}>
                            <Leaf className="w-5 h-5" /> Explore Products
                        </Link>
                    </div>
                )}

                {/* Orders List */}
                {!loading && !error && orders.length > 0 && (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const statusIdx = getStatusIndex(order.status);
                            const isCancelled = order.status === 'CANCELLED';
                            const isExpanded = expandedOrder === order.id;
                            const colors = STATUS_COLORS[order.status] || STATUS_COLORS.PENDING;

                            return (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="rounded-3xl border border-forest-border/15 overflow-hidden transition-all duration-300 hover:border-forest-border/30"
                                    style={{
                                        background: 'linear-gradient(145deg, rgba(26, 58, 26, 0.25), rgba(15, 33, 15, 0.2))',
                                        backdropFilter: 'blur(8px)',
                                    }}
                                >
                                    {/* Order Header */}
                                    <button
                                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                        className="w-full p-6 flex items-center justify-between text-left"
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                                style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
                                                {isCancelled
                                                    ? <XCircle className="w-6 h-6" style={{ color: colors.text }} />
                                                    : <Package className="w-6 h-6" style={{ color: colors.text }} />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span className="text-sm font-bold text-forest-cream">
                                                        Order #{order.id.slice(-8).toUpperCase()}
                                                    </span>
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
                                                        style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-forest-muted mt-1">
                                                    {formatDate(order.created_at)} • ₹{order.total_amount.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronDown className={`w-5 h-5 text-forest-muted transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-6 pb-6 space-y-6">
                                                    {/* Status Progress Bar */}
                                                    {!isCancelled && (
                                                        <div className="p-5 rounded-2xl border border-forest-border/15"
                                                            style={{ background: 'linear-gradient(135deg, rgba(26, 58, 26, 0.3), rgba(15, 33, 15, 0.25))' }}>
                                                            <h4 className="text-xs font-bold uppercase tracking-wider text-forest-spring mb-5">Order Progress</h4>
                                                            <div className="flex items-center justify-between relative">
                                                                {/* Progress Line */}
                                                                <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-forest-border/20 rounded-full" />
                                                                <div className="absolute top-5 left-[10%] h-0.5 rounded-full transition-all duration-700"
                                                                    style={{
                                                                        width: `${Math.max(0, (statusIdx / (STATUS_STEPS.length - 1)) * 80)}%`,
                                                                        background: 'linear-gradient(90deg, #7cb342, #34d399)',
                                                                    }} />

                                                                {/* Steps */}
                                                                {STATUS_STEPS.map((step, i) => {
                                                                    const isActive = i <= statusIdx;
                                                                    const isCurrent = i === statusIdx;
                                                                    const StepIcon = step.icon;
                                                                    return (
                                                                        <div key={step.key} className="flex flex-col items-center relative z-10" style={{ width: '25%' }}>
                                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isCurrent ? 'scale-125 shadow-lg' : ''}`}
                                                                                style={{
                                                                                    background: isActive
                                                                                        ? `linear-gradient(135deg, ${step.color}30, ${step.color}15)`
                                                                                        : 'rgba(15, 33, 15, 0.5)',
                                                                                    border: isActive
                                                                                        ? `2px solid ${step.color}60`
                                                                                        : '2px solid rgba(82, 183, 136, 0.1)',
                                                                                    boxShadow: isCurrent ? `0 0 20px ${step.color}30` : 'none',
                                                                                }}>
                                                                                <StepIcon className="w-4 h-4"
                                                                                    style={{ color: isActive ? step.color : 'rgba(150, 150, 150, 0.3)' }} />
                                                                            </div>
                                                                            <span className={`text-[10px] font-semibold mt-2 text-center ${isActive ? 'text-forest-cream' : 'text-forest-muted/40'}`}>
                                                                                {step.label}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Cancelled Badge */}
                                                    {isCancelled && (
                                                        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-center">
                                                            <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                                                            <p className="text-sm font-semibold text-red-400">This order has been cancelled</p>
                                                        </div>
                                                    )}

                                                    {/* Items */}
                                                    <div>
                                                        <h4 className="text-xs font-bold uppercase tracking-wider text-forest-muted mb-3">Items Ordered</h4>
                                                        <div className="space-y-2">
                                                            {order.items.map((item, i) => (
                                                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-forest-border/10"
                                                                    style={{ background: 'rgba(15, 33, 15, 0.3)' }}>
                                                                    <span className="text-lg">🌿</span>
                                                                    <span className="text-sm text-forest-cream">{item}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Order Info */}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="p-4 rounded-xl border border-forest-border/10"
                                                            style={{ background: 'rgba(15, 33, 15, 0.3)' }}>
                                                            <p className="text-[10px] text-forest-muted uppercase tracking-wider mb-1">Total Amount</p>
                                                            <p className="text-xl font-extrabold" style={{ color: '#7cb342' }}>₹{order.total_amount.toLocaleString()}</p>
                                                        </div>
                                                        <div className="p-4 rounded-xl border border-forest-border/10"
                                                            style={{ background: 'rgba(15, 33, 15, 0.3)' }}>
                                                            <p className="text-[10px] text-forest-muted uppercase tracking-wider mb-1">Order Date</p>
                                                            <p className="text-sm font-semibold text-forest-cream">{formatDate(order.created_at)}</p>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    {order.status === 'PENDING' && (
                                                        <button
                                                            onClick={() => handleCancel(order.id)}
                                                            disabled={cancelling === order.id}
                                                            className="w-full py-3 rounded-xl text-sm font-semibold text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                                        >
                                                            {cancelling === order.id ? (
                                                                <><div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> Cancelling...</>
                                                            ) : (
                                                                <><XCircle className="w-4 h-4" /> Cancel Order</>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="border-t border-forest-border/10 py-10 px-6 relative z-10"
                style={{ background: 'linear-gradient(180deg, transparent, rgba(5, 13, 5, 0.5))' }}>
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-sm text-forest-muted/40">© 2026 KiranVedaa. Pure Cultivation. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
