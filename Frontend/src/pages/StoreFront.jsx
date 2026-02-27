import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingCart, Shield, Award, Leaf, ChevronRight, FlaskConical,
    CheckCircle2, Sparkles, TreePine, Star, ArrowRight, Heart, X,
    Filter, ChevronDown, Package, Sun, Sprout, Flower2, Minus, Plus, Trash2, LogIn
} from 'lucide-react';
import AuthModal from '../components/AuthModal';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/* ═══════════════════════════════════════════
   🌿 PRODUCT CATEGORIES — Multi-Crop Farm
   ═══════════════════════════════════════════ */
const CATEGORIES = [
    { key: 'all', label: 'All Products', icon: Package, emoji: '🌿' },
    { key: 'cordyceps', label: 'Cordyceps', icon: Sprout, emoji: '🍄' },
    { key: 'yellow-turmeric', label: 'Yellow Turmeric', icon: Sun, emoji: '🌾' },
    { key: 'black-turmeric', label: 'Black Turmeric', icon: Flower2, emoji: '🖤' },
    { key: 'white-musli', label: 'White Musli', icon: Leaf, emoji: '🌱' },
];

/* Fallback products when API has none */
const SHOWCASE_PRODUCTS = [
    {
        id: 'cm-001', name: 'Cordyceps Militaris Powder', category: 'cordyceps',
        price: 1499, weight_grams: 50, strain: 'CM-01',
        description: 'Premium lab-grown Cordyceps Militaris powder. Rich in cordycepin & adenosine for energy and immunity.',
        image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&h=400&fit=crop',
        lab_tested: true, quality_grade: 'A+', harvest_date: '2026-02-01',
    },
    {
        id: 'cm-002', name: 'Cordyceps Dried Fruiting Body', category: 'cordyceps',
        price: 2499, weight_grams: 30, strain: 'CM-02',
        description: 'Hand-harvested whole Cordyceps fruiting bodies. Maximum potency for tinctures & extracts.',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
        lab_tested: true, quality_grade: 'A+', harvest_date: '2026-01-28',
    },
    {
        id: 'yt-001', name: 'Yellow Turmeric Powder (Haldi)', category: 'yellow-turmeric',
        price: 349, weight_grams: 200,
        description: 'Pure farm-fresh yellow turmeric powder. High curcumin content, organically cultivated without pesticides.',
        image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&h=400&fit=crop',
        lab_tested: true, quality_grade: 'A',
    },
    {
        id: 'yt-002', name: 'Fresh Yellow Turmeric Roots', category: 'yellow-turmeric',
        price: 199, weight_grams: 500,
        description: 'Fresh organic yellow turmeric rhizomes, directly from our farm. Perfect for home use.',
        image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&h=400&fit=crop',
        lab_tested: false, quality_grade: 'A',
    },
    {
        id: 'bt-001', name: 'Black Turmeric (Kali Haldi)', category: 'black-turmeric',
        price: 899, weight_grams: 100,
        description: 'Rare Curcuma caesia — the legendary black turmeric. Deeply aromatic and medicinal, ethically wild-harvested.',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&h=400&fit=crop',
        lab_tested: true, quality_grade: 'A+',
    },
    {
        id: 'bt-002', name: 'Black Turmeric Extract Drops', category: 'black-turmeric',
        price: 1299, weight_grams: 30,
        description: 'Concentrated black turmeric liquid extract. 10x potency for wellness protocols.',
        image: 'https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?w=600&h=400&fit=crop',
        lab_tested: true, quality_grade: 'A+',
    },
    {
        id: 'wm-001', name: 'Safed Musli Powder', category: 'white-musli',
        price: 999, weight_grams: 100,
        description: 'Pure Chlorophytum borivilianum root powder. Known as "White Gold" — a powerful Ayurvedic adaptogen.',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=400&fit=crop',
        lab_tested: true, quality_grade: 'A',
    },
    {
        id: 'wm-002', name: 'White Musli Root (Dried)', category: 'white-musli',
        price: 799, weight_grams: 150,
        description: 'Hand-picked and sun-dried White Musli roots. Full potency preserved for traditional preparations.',
        image: 'https://images.unsplash.com/photo-1471943311424-646960669fbc?w=600&h=400&fit=crop',
        lab_tested: false, quality_grade: 'A',
    },
];

const CATEGORY_EMOJIS = {
    'cordyceps': '🍄',
    'yellow-turmeric': '🌾',
    'black-turmeric': '🖤',
    'white-musli': '🌱',
};

const StoreFront = ({ onLogin: parentOnLogin, user: parentUser, cart, addToCart, removeFromCart, updateQty }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [scrolled, setScrolled] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const [cartOpen, setCartOpen] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
    const heroRef = useRef(null);
    const navigate = useNavigate();

    // ─── Auth Modal State ───
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [storeUser, setStoreUser] = useState(parentUser || null);

    // Sync with parent user prop
    useEffect(() => {
        if (parentUser) setStoreUser(parentUser);
    }, [parentUser]);

    // Check if user is already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            try {
                setStoreUser(JSON.parse(savedUser));
            } catch {
                // ignore
            }
        }
    }, []);

    // Auto-show auth modal on first visit (if not logged in)
    useEffect(() => {
        const dismissed = sessionStorage.getItem('auth_modal_dismissed');
        const token = localStorage.getItem('token');
        if (!token && !dismissed) {
            const timer = setTimeout(() => {
                setAuthModalOpen(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAuthLogin = (userData) => {
        setStoreUser(userData);
        setAuthModalOpen(false);
        // Sync with parent App.jsx auth state
        if (parentOnLogin) parentOnLogin(userData);
        // Navigate to store (it already is on store)
    };

    const handleAuthModalClose = () => {
        setAuthModalOpen(false);
        sessionStorage.setItem('auth_modal_dismissed', 'true');
    };

    useEffect(() => {
        fetchProducts();
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    /* 3D parallax mouse tracking for hero */
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (heroRef.current) {
                const rect = heroRef.current.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                setMousePos({ x, y });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_BASE}/store/products`);
            const data = await res.json();
            if (data && data.length > 0) {
                setProducts(data);
            } else {
                setProducts(SHOWCASE_PRODUCTS);
            }
        } catch (err) {
            console.error('Using showcase products:', err);
            setProducts(SHOWCASE_PRODUCTS);
        } finally { setLoading(false); }
    };

    const totalItems = cart.reduce((s, i) => s + i.qty, 0);
    const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

    const toggleFavorite = (e, productId) => {
        e.stopPropagation();
        setFavorites(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const filteredProducts = activeCategory === 'all'
        ? products
        : products.filter(p => p.category === activeCategory);

    /* 3D transform calculations */
    const rx = (mousePos.y - 0.5) * -8;
    const ry = (mousePos.x - 0.5) * 8;

    return (
        <div className="min-h-screen bg-forest-darkest text-forest-text font-sans relative overflow-hidden">

            {/* ═══ 3D FOREST BACKGROUND — Multi-Layer Parallax ═══ */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {/* Deep forest image background */}
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.5,
                        filter: 'saturate(1.5) brightness(0.85)',
                        transform: `translate3d(${(mousePos.x - 0.5) * -20}px, ${(mousePos.y - 0.5) * -15}px, 0)`,
                        transition: 'transform 0.3s ease-out',
                    }} />

                {/* Mid-layer fog */}
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1507041957456-9c397ce39c97?w=1920&q=60')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center bottom',
                        opacity: 0.25,
                        filter: 'blur(1px) saturate(1.6) brightness(0.95)',
                        transform: `translate3d(${(mousePos.x - 0.5) * -10}px, ${(mousePos.y - 0.5) * -8}px, 0)`,
                        transition: 'transform 0.4s ease-out',
                    }} />

                {/* Ambient glow orbs — KiranVedaa green+orange */}
                <div className="absolute top-[-15%] left-[15%] w-[65%] h-[45%] rounded-full blur-[220px] animate-bio-glow"
                    style={{ background: 'rgba(45, 90, 39, 0.15)', transform: `translate3d(${(mousePos.x - 0.5) * 30}px, ${(mousePos.y - 0.5) * 20}px, 0)` }} />
                <div className="absolute top-[25%] right-[-8%] w-[40%] h-[40%] rounded-full blur-[170px] animate-bio-glow"
                    style={{ background: 'rgba(245, 124, 0, 0.08)', animationDelay: '2.5s' }} />
                <div className="absolute bottom-[-5%] left-[5%] w-[55%] h-[35%] rounded-full blur-[200px] animate-bio-glow"
                    style={{ background: 'rgba(124, 179, 66, 0.1)', animationDelay: '5s' }} />
                <div className="absolute top-[50%] left-[40%] w-[30%] h-[30%] rounded-full blur-[150px] animate-bio-glow"
                    style={{ background: 'rgba(255, 193, 7, 0.06)', animationDelay: '7s' }} />

                {/* Sun rays — warm orange matching logo */}
                <div className="absolute top-0 left-[30%] w-[40%] h-[80%] animate-sun-stream opacity-[0.1]"
                    style={{
                        background: 'linear-gradient(175deg, rgba(245, 124, 0, 0.15), rgba(255, 193, 7, 0.08), transparent 55%)',
                        transformOrigin: 'top center',
                        transform: `translate3d(${(mousePos.x - 0.5) * 40}px, 0, 0) rotate(${(mousePos.x - 0.5) * 3}deg)`,
                        transition: 'transform 0.5s ease-out',
                    }} />
                <div className="absolute top-0 right-[10%] w-[20%] h-[60%] animate-sun-stream opacity-[0.07]"
                    style={{
                        background: 'linear-gradient(170deg, rgba(255, 152, 0, 0.12), transparent 50%)',
                        animationDelay: '4s',
                        transform: `translate3d(${(mousePos.x - 0.5) * 50}px, 0, 0)`,
                        transition: 'transform 0.6s ease-out',
                    }} />

                {/* Dark overlay — very light top, gradual darkening */}
                <div className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(180deg, rgba(5,13,5,0.05) 0%, rgba(5,13,5,0.25) 35%, rgba(5,13,5,0.6) 75%, rgba(5,13,5,0.85) 100%)',
                    }} />
            </div>

            {/* ═══ NAV ═══ */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${scrolled
                ? 'border-forest-border/20 shadow-lg'
                : 'border-transparent'
                }`}
                style={{
                    background: scrolled
                        ? 'linear-gradient(180deg, rgba(5, 13, 5, 0.95), rgba(5, 13, 5, 0.88))'
                        : 'linear-gradient(180deg, rgba(5, 13, 5, 0.6), transparent)',
                    backdropFilter: scrolled ? 'blur(20px)' : 'blur(8px)',
                }}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <img src="/assets/kvedaa-logo.png" alt="KiranVedaa — Pure Cultivation"
                            className="h-28 w-auto object-contain"
                            style={{
                                filter: 'drop-shadow(0 0 10px rgba(124, 179, 66, 0.35)) brightness(1.1)',
                            }} />
                    </div>
                    <div className="flex items-center gap-6">
                        <Link to="/about" className="text-sm text-forest-muted hover:text-forest-cream transition-colors hidden sm:block">About Us</Link>
                        <Link to="/products" className="text-sm text-forest-muted hover:text-forest-cream transition-colors hidden sm:block">Products</Link>
                        <Link to="/quality" className="text-sm text-forest-muted hover:text-forest-cream transition-colors hidden sm:block">Quality</Link>
                        {storeUser ? (
                            <div className="flex items-center gap-4">
                                {storeUser.email === (import.meta.env.VITE_ADMIN_EMAIL || 'amitkchoudhary2019@gmail.com') && (
                                    <Link to="/dashboard" className="text-sm text-forest-spring hover:text-emerald-400 font-bold tracking-wide transition-colors">
                                        Dashboard
                                    </Link>
                                )}
                                <span className="text-sm text-forest-spring font-medium flex items-center gap-1.5 border-l border-forest-border/20 pl-4">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    {storeUser.first_name || 'User'}
                                </span>
                            </div>
                        ) : (
                            <button
                                onClick={() => setAuthModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
                                style={{
                                    background: 'linear-gradient(135deg, #1b4332, #2d6a4f)',
                                    boxShadow: '0 2px 15px rgba(74, 222, 128, 0.15)',
                                    border: '1px solid rgba(74, 222, 128, 0.15)',
                                }}
                                id="nav-auth-button"
                            >
                                <LogIn className="w-4 h-4" /> Login / Sign Up
                            </button>
                        )}
                        <button onClick={() => setCartOpen(true)} className="relative p-2.5 rounded-xl hover:bg-forest-card/30 transition-all group border border-transparent hover:border-forest-border/20" id="cart-button">
                            <ShoppingCart className="w-5 h-5 text-forest-muted group-hover:text-forest-cream transition-colors" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold text-white"
                                    style={{ background: 'linear-gradient(135deg, #2d5a27, #7cb342)', boxShadow: '0 0 10px rgba(124, 179, 66, 0.5)' }}>
                                    {totalItems}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* ═══ HERO — 3D Parallax Forest Escape ═══ */}
            <section ref={heroRef} className="relative pt-32 pb-28 px-6 overflow-hidden min-h-[90vh] flex items-center"
                style={{ perspective: '1200px' }}>

                {/* 3D Depth layers — floating forest images */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ perspective: '1000px' }}>
                    {/* Back layer — distant trees */}
                    <div className="absolute -left-[5%] top-[10%] w-[35%] h-[60%] rounded-3xl overflow-hidden opacity-[0.4]"
                        style={{
                            transform: `translate3d(${(mousePos.x - 0.5) * -15}px, ${(mousePos.y - 0.5) * -10}px, -100px) rotateY(${ry * 0.3}deg)`,
                            transition: 'transform 0.4s ease-out',
                        }}>
                        <img src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=70"
                            alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>

                    {/* Back layer — right side distant */}
                    <div className="absolute -right-[8%] top-[15%] w-[30%] h-[50%] rounded-3xl overflow-hidden opacity-[0.35]"
                        style={{
                            transform: `translate3d(${(mousePos.x - 0.5) * -20}px, ${(mousePos.y - 0.5) * -12}px, -80px) rotateY(${ry * 0.2}deg)`,
                            transition: 'transform 0.5s ease-out',
                        }}>
                        <img src="https://images.unsplash.com/photo-1476362555312-ab9e108a0b7e?w=800&q=70"
                            alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>

                    {/* Mid layer — left foliage */}
                    <div className="absolute left-[5%] bottom-[5%] w-[25%] h-[40%] rounded-2xl overflow-hidden opacity-[0.3]"
                        style={{
                            transform: `translate3d(${(mousePos.x - 0.5) * 15}px, ${(mousePos.y - 0.5) * 10}px, -40px)`,
                            transition: 'transform 0.35s ease-out',
                            filter: 'blur(1px)',
                        }}>
                        <img src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&q=60"
                            alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>

                    {/* Floating 3D nature elements */}
                    <div className="absolute top-[15%] left-[12%] text-7xl"
                        style={{
                            opacity: 0.07,
                            transform: `translate3d(${(mousePos.x - 0.5) * 40}px, ${(mousePos.y - 0.5) * 30}px, 50px)`,
                            transition: 'transform 0.2s ease-out',
                            animation: 'gentleFloat 7s ease-in-out infinite',
                        }}>🍃</div>
                    <div className="absolute top-[30%] right-[15%] text-6xl"
                        style={{
                            opacity: 0.06,
                            transform: `translate3d(${(mousePos.x - 0.5) * 50}px, ${(mousePos.y - 0.5) * 35}px, 80px)`,
                            transition: 'transform 0.15s ease-out',
                            animation: 'gentleFloat 9s ease-in-out infinite 2s',
                        }}>🌿</div>
                    <div className="absolute bottom-[20%] left-[25%] text-5xl"
                        style={{
                            opacity: 0.08,
                            transform: `translate3d(${(mousePos.x - 0.5) * 60}px, ${(mousePos.y - 0.5) * 40}px, 120px)`,
                            transition: 'transform 0.1s ease-out',
                            animation: 'drift 8s ease-in-out infinite 4s',
                        }}>🍂</div>
                    <div className="absolute bottom-[30%] right-[20%] text-6xl"
                        style={{
                            opacity: 0.05,
                            transform: `translate3d(${(mousePos.x - 0.5) * 35}px, ${(mousePos.y - 0.5) * 25}px, 60px)`,
                            transition: 'transform 0.25s ease-out',
                            animation: 'gentleFloat 11s ease-in-out infinite 6s',
                        }}>🌱</div>
                    <div className="absolute top-[50%] left-[50%] text-4xl"
                        style={{
                            opacity: 0.04,
                            transform: `translate3d(${(mousePos.x - 0.5) * 70}px, ${(mousePos.y - 0.5) * 50}px, 150px)`,
                            transition: 'transform 0.08s ease-out',
                            animation: 'drift 13s ease-in-out infinite 8s',
                        }}>🌲</div>
                </div>

                {/* Hero Content with 3D tilt */}
                <div className="max-w-7xl mx-auto text-center relative z-10 w-full"
                    style={{
                        transform: `rotateX(${rx * 0.15}deg) rotateY(${ry * 0.15}deg)`,
                        transition: 'transform 0.3s ease-out',
                        transformStyle: 'preserve-3d',
                    }}>
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
                        <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border text-xs font-semibold uppercase tracking-wider mb-8"
                            style={{
                                background: 'linear-gradient(135deg, rgba(45, 90, 39, 0.3), rgba(124, 179, 66, 0.15))',
                                borderColor: 'rgba(124, 179, 66, 0.25)',
                                color: '#8bc34a',
                                transform: 'translateZ(30px)',
                            }}>
                            <Sparkles className="w-3.5 h-3.5" /> KiranVedaa — Pure Cultivation
                        </span>

                        <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight mb-7 leading-[1.05] font-display"
                            style={{ transform: 'translateZ(60px)' }}>
                            <span className="bg-clip-text text-transparent" style={{
                                backgroundImage: 'linear-gradient(135deg, #faf5eb, #8bc34a, #7cb342, #2d5a27)',
                            }}>
                                Pure Cultivation
                            </span>
                            <br />
                            <span className="bg-clip-text text-transparent" style={{
                                backgroundImage: 'linear-gradient(135deg, #ffc107, #ff9800, #f57c00)',
                            }}>
                                From Nature
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-forest-muted max-w-2xl mx-auto mb-12 leading-relaxed"
                            style={{ transform: 'translateZ(20px)' }}>
                            From <span style={{ color: '#8bc34a' }} className="font-medium">Cordyceps Militaris</span> to
                            <span style={{ color: '#ffc107' }} className="font-medium"> Golden Turmeric</span>,
                            <span style={{ color: '#f57c00' }} className="font-medium"> Rare Black Turmeric</span> &
                            <span style={{ color: '#7cb342' }} className="font-medium"> White Musli</span> —
                            lab-tested, batch-traced, straight from our farm.
                        </p>

                        <div className="flex items-center justify-center gap-4 flex-wrap" style={{ transform: 'translateZ(40px)' }}>
                            <Link to="/products"
                                className="px-9 py-4 rounded-2xl text-white font-semibold transition-all active:scale-95 flex items-center gap-2 text-base group"
                                style={{
                                    background: 'linear-gradient(135deg, #2d5a27, #7cb342, #f57c00)',
                                    boxShadow: '0 6px 30px rgba(124, 179, 66, 0.25), 0 0 80px rgba(245, 124, 0, 0.06), inset 0 1px 0 rgba(255,255,255,0.1)',
                                }}>
                                <Leaf className="w-5 h-5" /> Explore Products
                                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/quality"
                                className="px-9 py-4 rounded-2xl border border-forest-border/25 hover:bg-forest-card/25 text-forest-mist font-medium transition-all text-base hover:border-forest-border/40"
                                style={{ backdropFilter: 'blur(8px)' }}>
                                Our Quality Promise
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Trust Badges with 3D depth */}
                <div className="absolute bottom-0 left-0 right-0 px-6">
                    <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 pb-8">
                        {[
                            { icon: FlaskConical, label: 'Lab Tested', desc: 'Every batch', color: '#7cb342' },
                            { icon: Shield, label: 'GMP Certified', desc: 'Quality assured', color: '#2d5a27' },
                            { icon: Leaf, label: 'Organic', desc: 'Pesticide free', color: '#8bc34a' },
                            { icon: Award, label: 'Traceable', desc: 'Batch verified', color: '#f57c00' }
                        ].map((b, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + i * 0.12, ease: 'easeOut' }}
                                className="flex flex-col items-center p-5 rounded-2xl border border-forest-border/15 hover:border-forest-border/30 transition-all duration-300 group"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(26, 58, 26, 0.25), rgba(15, 33, 15, 0.2))',
                                    backdropFilter: 'blur(12px)',
                                }}>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                                    style={{ background: `${b.color}15`, border: `1px solid ${b.color}20` }}>
                                    <b.icon className="w-5 h-5" style={{ color: b.color }} />
                                </div>
                                <p className="text-sm font-bold text-forest-cream">{b.label}</p>
                                <p className="text-[11px] text-forest-muted">{b.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ PRODUCT CATEGORIES ═══ */}
            <section id="products" className="py-24 px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <motion.div className="text-center mb-12"
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <span className="text-[11px] uppercase tracking-[0.25em] text-forest-spring font-bold mb-3 block">Our Collection</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-forest-cream mb-4 font-display">Nature's Pharmacy</h2>
                        <p className="text-forest-muted max-w-xl mx-auto">From rare medicinal mushrooms to ancient Ayurvedic herbs — each product is cultivated with care and fully traceable.</p>
                    </motion.div>

                    {/* Category Filter */}
                    <div className="flex items-center justify-center gap-2 flex-wrap mb-16">
                        {CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium transition-all duration-300 border ${activeCategory === cat.key
                                        ? 'text-emerald-300 border-emerald-500/20'
                                        : 'text-forest-muted border-transparent hover:text-forest-cream hover:border-forest-border/20'
                                        }`}
                                    style={activeCategory === cat.key ? {
                                        background: 'linear-gradient(135deg, rgba(27, 67, 50, 0.4), rgba(45, 106, 79, 0.2))',
                                        boxShadow: '0 0 20px rgba(74, 222, 128, 0.08)',
                                    } : { background: 'transparent' }}>
                                    <span className="text-base">{cat.emoji}</span>
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-24">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-forest-spring"></div>
                                <TreePine className="w-6 h-6 text-forest-spring absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-24">
                            <span className="text-7xl block mb-5">🌲</span>
                            <h3 className="text-2xl font-semibold text-forest-muted font-display">No Products Here Yet</h3>
                            <p className="text-sm text-forest-muted/50 mt-3 max-w-md mx-auto">Try a different category or check back soon!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
                            {filteredProducts.map((p, i) => (
                                <motion.div key={p.id} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                                    onClick={() => navigate('/products', { state: { category: p.category, productId: p.id } })}
                                    className="group rounded-3xl border border-forest-border/15 overflow-hidden transition-all duration-500 flex flex-col hover:border-forest-spring/30 shadow-sm hover:shadow-2xl hover:shadow-forest-spring/20 hover:-translate-y-3 hover:scale-[1.03] hover:z-10 relative cursor-pointer"
                                    style={{
                                        background: 'linear-gradient(145deg, rgba(26, 58, 26, 0.3), rgba(15, 33, 15, 0.25))',
                                        backdropFilter: 'blur(10px)',
                                    }}>
                                    {/* Product Image */}
                                    <div className="relative h-52 overflow-hidden">
                                        {p.image ? (
                                            <img src={p.image} alt={p.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                loading="lazy" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"
                                                style={{ background: 'linear-gradient(135deg, rgba(15, 33, 15, 0.9), rgba(27, 67, 50, 0.6))' }}>
                                                <span className="text-7xl group-hover:scale-110 transition-transform duration-500">
                                                    {CATEGORY_EMOJIS[p.category] || '🌿'}
                                                </span>
                                            </div>
                                        )}

                                        {/* Gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-forest-darkest/80 via-forest-darkest/20 to-transparent" />

                                        {/* Category tag */}
                                        <div className="absolute bottom-3 left-3">
                                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase backdrop-blur-md border"
                                                style={{
                                                    background: 'rgba(5, 13, 5, 0.6)',
                                                    borderColor: 'rgba(82, 183, 136, 0.15)',
                                                    color: '#95d5b2',
                                                }}>
                                                {CATEGORY_EMOJIS[p.category]} {p.category?.replace('-', ' ')}
                                            </span>
                                        </div>

                                        {/* Badges */}
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            {p.lab_tested && (
                                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase text-white"
                                                    style={{ background: 'linear-gradient(135deg, #1b4332, #2d6a4f)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                                                    Lab Tested
                                                </span>
                                            )}
                                            {p.quality_grade && (
                                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase text-white"
                                                    style={{ background: 'linear-gradient(135deg, #c9960c, #e6b422)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                                                    {p.quality_grade}
                                                </span>
                                            )}
                                        </div>

                                        {/* Wishlist */}
                                        <button
                                            onClick={(e) => toggleFavorite(e, p.id)}
                                            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm border transition-all ${favorites.includes(p.id)
                                                ? 'bg-rose-500/20 text-rose-400 border-rose-400/50 opacity-100'
                                                : 'bg-forest-darkest/30 text-forest-muted border-forest-border/20 hover:text-rose-400 hover:border-rose-400/20 opacity-0 group-hover:opacity-100'
                                                }`}
                                        >
                                            <Heart className={`w-4 h-4 ${favorites.includes(p.id) ? 'fill-rose-400' : ''}`} />
                                        </button>
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-bold text-forest-cream text-base group-hover:text-forest-glow transition-colors leading-tight">{p.name}</h3>
                                        </div>

                                        <p className="text-sm text-forest-muted mb-4 line-clamp-2 flex-1">{p.description}</p>

                                        <div className="flex items-end justify-between mb-4">
                                            <div>
                                                <p className="text-2xl font-extrabold" style={{ color: '#7cb342' }}>₹{p.price}</p>
                                                {p.weight_grams && <p className="text-xs text-forest-muted/50">{p.weight_grams}g</p>}
                                            </div>
                                            {p.strain && (
                                                <span className="text-[10px] px-2 py-1 rounded-full border border-forest-border/15 text-forest-muted"
                                                    style={{ background: 'rgba(5, 13, 5, 0.4)' }}>
                                                    🧬 {p.strain}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-2 relative z-20">
                                            <button onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                                                className="flex-1 py-3 rounded-xl font-semibold text-sm text-white active:scale-95 transition-all"
                                                style={{
                                                    background: 'linear-gradient(135deg, #2d5a27, #7cb342, #f57c00)',
                                                    boxShadow: '0 4px 18px rgba(124, 179, 66, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                                                }}>
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ═══ QUALITY PROMISE ═══ */}
            <section id="quality" className="py-24 px-6 relative z-10"
                style={{ background: 'linear-gradient(180deg, transparent, rgba(19, 42, 19, 0.15), transparent)' }}>
                <div className="max-w-5xl mx-auto text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <span className="text-[11px] uppercase tracking-[0.25em] text-forest-gold font-bold mb-3 block">Transparency</span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-5 text-forest-cream font-display">The Quality Promise</h2>
                        <p className="text-forest-muted mb-16 max-w-xl mx-auto">
                            Every product links back to its cultivation batch. Transparency rooted in nature.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { s: '01', t: 'Cultivated', d: 'Precise environment control — temp, humidity, light cycles for each crop', e: '🌱', color: '#52b788' },
                            { s: '02', t: 'Lab Tested', d: 'Purity, potency, heavy metals & contaminant testing every batch', e: '🔬', color: '#40916c' },
                            { s: '03', t: 'Batch Traced', d: 'Full lifecycle tracked — from seed to your doorstep', e: '🌲', color: '#e6b422' }
                        ].map((item, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                                className="p-8 rounded-3xl border border-forest-border/15 text-left hover:border-forest-border/30 transition-all duration-500 group relative overflow-hidden"
                                style={{
                                    background: 'linear-gradient(145deg, rgba(26, 58, 26, 0.25), rgba(15, 33, 15, 0.2))',
                                    backdropFilter: 'blur(8px)',
                                }}>
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                    style={{ background: `radial-gradient(circle at 50% 80%, ${item.color}08, transparent 60%)` }} />
                                <span className="text-5xl mb-5 block">{item.e}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: item.color }}>Step {item.s}</span>
                                <h3 className="text-xl font-bold text-forest-cream mt-1.5 mb-3 font-display group-hover:text-forest-glow transition-colors">{item.t}</h3>
                                <p className="text-sm text-forest-muted leading-relaxed">{item.d}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ WHAT WE GROW — Crop Showcase ═══ */}
            <section className="py-24 px-6 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <span className="text-[11px] uppercase tracking-[0.25em] text-forest-spring font-bold mb-3 block">Our Farm</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-forest-cream mb-4 font-display">What We Cultivate</h2>
                        <p className="text-forest-muted max-w-xl mx-auto">A diverse farm growing nature's most powerful medicinal crops.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            {
                                name: 'Cordyceps Militaris', emoji: '🍄', color: '#f97316',
                                desc: 'The caterpillar fungus — lab-grown for purity. Boosts energy, stamina & immunity.',
                                image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=70',
                                tags: ['Adaptogen', 'Energy', 'Immunity'],
                            },
                            {
                                name: 'Yellow Turmeric', emoji: '🌾', color: '#eab308',
                                desc: 'India\'s golden spice. High-curcumin variety grown organically in rich forest soil.',
                                image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&q=70',
                                tags: ['Anti-inflammatory', 'Curcumin', 'Cooking'],
                            },
                            {
                                name: 'Black Turmeric', emoji: '🖤', color: '#a855f7',
                                desc: 'Rare Curcuma caesia — deeply aromatic, used in traditional medicine for centuries.',
                                image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=70',
                                tags: ['Rare', 'Medicinal', 'Aromatic'],
                            },
                            {
                                name: 'Safed Musli', emoji: '🌱', color: '#22d3ee',
                                desc: 'Chlorophytum borivilianum — the "White Gold" of Ayurveda. Powerful root adaptogen.',
                                image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=70',
                                tags: ['Adaptogen', 'Vitality', 'Ayurvedic'],
                            },
                        ].map((crop, i) => {
                            const isReverse = i % 2 !== 0;
                            return (
                                <Link to="/quality" key={i} className="block group h-full">
                                    <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                        className={`flex flex-col ${isReverse ? 'md:flex-row-reverse' : 'md:flex-row'} rounded-3xl border border-forest-border/15 overflow-hidden hover:border-forest-spring/30 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-forest-spring/20 hover:-translate-y-3 hover:scale-[1.03] hover:z-10 relative h-full md:h-[280px] w-full`}
                                        style={{
                                            background: 'linear-gradient(145deg, rgba(26, 58, 26, 0.25), rgba(15, 33, 15, 0.2))',
                                            backdropFilter: 'blur(8px)',
                                        }}>
                                        <div className="md:w-2/5 h-48 md:h-auto overflow-hidden relative">
                                            <img src={crop.image} alt={crop.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                                            <div className={`absolute inset-0 bg-gradient-to-${isReverse ? 'l' : 'r'} from-transparent to-forest-darkest/80 hidden md:block`} />
                                            <div className="absolute inset-0 bg-gradient-to-t from-forest-darkest/60 to-transparent md:hidden" />
                                        </div>
                                        <div className={`p-7 flex-1 flex flex-col justify-center relative ${isReverse ? 'items-end text-right' : 'items-start text-left'}`}>
                                            {/* Hover Indicator */}
                                            <div className={`absolute ${isReverse ? 'left-6' : 'right-6'} top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-forest-card/50 border border-forest-border/20 flex items-center justify-center opacity-0 group-hover:opacity-100 ${isReverse ? 'group-hover:-translate-x-2' : 'group-hover:translate-x-2'} transition-all duration-300`}>
                                                <ArrowRight className={`w-4 h-4 text-forest-spring ${isReverse ? 'rotate-180' : ''}`} />
                                            </div>

                                            <span className="text-4xl mb-3">{crop.emoji}</span>
                                            <h3 className="text-xl font-bold text-forest-cream font-display mb-2 group-hover:text-forest-spring transition-colors">{crop.name}</h3>
                                            <p className={`text-sm text-forest-muted leading-relaxed mb-4 ${isReverse ? 'pl-6' : 'pr-6'}`}>{crop.desc}</p>
                                            <div className={`flex flex-wrap gap-2 ${isReverse ? 'justify-end' : 'justify-start'}`}>
                                                {crop.tags.map((tag, j) => (
                                                    <span key={j} className="px-3 py-1 rounded-full text-[10px] font-bold uppercase border"
                                                        style={{
                                                            background: `${crop.color}10`,
                                                            borderColor: `${crop.color}20`,
                                                            color: crop.color,
                                                        }}>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ═══ STATS ═══ */}
            <section className="py-20 px-6 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { value: '100%', label: 'Lab Tested', icon: '🔬' },
                            { value: '4+', label: 'Crop Varieties', icon: '🌿' },
                            { value: 'A+', label: 'Quality Grade', icon: '⭐' },
                            { value: '0%', label: 'Pesticides', icon: '🍃' },
                        ].map((stat, i) => (
                            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                className="text-center p-6 rounded-2xl border border-forest-border/10"
                                style={{ background: 'linear-gradient(135deg, rgba(19, 42, 19, 0.2), rgba(10, 23, 10, 0.15))' }}>
                                <span className="text-3xl block mb-2">{stat.icon}</span>
                                <p className="text-3xl md:text-4xl font-extrabold text-forest-cream font-display">{stat.value}</p>
                                <p className="text-xs text-forest-muted mt-1 uppercase tracking-wider font-medium">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ WHOLESALE CTA ═══ */}
            <section className="py-24 px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="p-14 rounded-[2rem] border border-forest-spring/10 relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, rgba(27, 67, 50, 0.35), rgba(19, 42, 19, 0.3), rgba(45, 106, 79, 0.2))' }}>
                        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-forest-spring/[0.06] blur-[120px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-forest-gold/[0.04] blur-[100px] pointer-events-none" />

                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <span className="text-5xl block mb-5">🌿</span>
                            <h2 className="text-3xl md:text-4xl font-bold mb-5 relative z-10 text-forest-cream font-display">Wholesale & Bulk Orders</h2>
                            <p className="text-forest-muted mb-10 max-w-lg mx-auto relative z-10">
                                Bulk Cordyceps, Turmeric, or Musli for your store, clinic, or wellness brand? Competitive pricing with full batch traceability.
                            </p>
                            <button className="px-10 py-4 rounded-2xl bg-forest-cream text-forest-darkest font-bold hover:bg-white transition-all active:scale-95 relative z-10 text-base"
                                id="wholesale-cta"
                                style={{ boxShadow: '0 6px 30px rgba(250, 245, 235, 0.15)' }}>
                                Request Wholesale Quote
                            </button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer className="border-t border-forest-border/10 py-14 px-6 relative z-10"
                style={{ background: 'linear-gradient(180deg, transparent, rgba(5, 13, 5, 0.5))' }}>
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center">
                            <img src="/assets/kvedaa-logo.png" alt="KiranVedaa"
                                className="h-11 w-auto object-contain"
                                style={{ filter: 'drop-shadow(0 0 6px rgba(124, 179, 66, 0.25)) brightness(1.1)' }} />
                        </div>
                        <div className="flex items-center gap-6 text-sm text-forest-muted/50">
                            <Link to="/products" className="hover:text-forest-cream transition-colors">Products</Link>
                            <Link to="/quality" className="hover:text-forest-cream transition-colors">Quality</Link>
                            <Link to="/about" className="hover:text-forest-cream transition-colors">About Us</Link>
                            {storeUser ? (
                                <button onClick={() => {
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('user');
                                    setStoreUser(null);
                                    if (parentOnLogin) parentOnLogin(null);
                                    window.location.reload();
                                }} className="hover:text-rose-400 transition-colors text-rose-500 font-bold ml-4">
                                    Sign Out
                                </button>
                            ) : (
                                <button onClick={() => setAuthModalOpen(true)} className="hover:text-forest-cream transition-colors">Login</button>
                            )}
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-forest-border/8 text-center">
                        <p className="text-sm text-forest-muted/40">© 2026 KiranVedaa. Pure Cultivation. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {/* ═══ PRODUCT DETAIL MODAL ═══ */}
            <AnimatePresence>
                {selectedProduct && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-darkest/85 backdrop-blur-md"
                        onClick={() => setSelectedProduct(null)}>
                        <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="rounded-3xl border border-forest-border/25 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            style={{
                                background: 'linear-gradient(135deg, rgba(19, 42, 19, 0.97), rgba(10, 23, 10, 0.99))',
                                boxShadow: '0 30px 100px rgba(0,0,0,0.6), 0 0 60px rgba(74, 222, 128, 0.04)',
                            }}
                            onClick={e => e.stopPropagation()}>

                            {/* Modal Image */}
                            {selectedProduct.image && (
                                <div className="h-56 overflow-hidden rounded-t-3xl relative">
                                    <img src={selectedProduct.image} alt={selectedProduct.name}
                                        className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-forest-darkest to-transparent" />
                                </div>
                            )}

                            <div className="p-8">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border mb-2 inline-block"
                                            style={{
                                                background: 'rgba(82, 183, 136, 0.08)',
                                                borderColor: 'rgba(82, 183, 136, 0.15)',
                                                color: '#95d5b2',
                                            }}>
                                            {selectedProduct.category?.replace('-', ' ')}
                                        </span>
                                        <h2 className="text-2xl font-bold text-forest-cream font-display">{selectedProduct.name}</h2>
                                        {selectedProduct.strain && <p className="text-sm text-forest-spring mt-1">Strain: {selectedProduct.strain}</p>}
                                    </div>
                                    <button onClick={() => setSelectedProduct(null)}
                                        className="p-2 rounded-xl hover:bg-forest-card/30 text-forest-muted hover:text-forest-cream transition-all">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <p className="text-forest-mist/80 mb-8 leading-relaxed">{selectedProduct.description}</p>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-5 rounded-2xl border border-forest-border/15"
                                        style={{ background: 'linear-gradient(135deg, rgba(26, 58, 26, 0.3), rgba(19, 42, 19, 0.2))' }}>
                                        <p className="text-xs text-forest-muted uppercase tracking-wider mb-1">Price</p>
                                        <p className="text-3xl font-extrabold text-forest-spring">₹{selectedProduct.price}</p>
                                    </div>
                                    <div className="p-5 rounded-2xl border border-forest-border/15"
                                        style={{ background: 'linear-gradient(135deg, rgba(26, 58, 26, 0.3), rgba(19, 42, 19, 0.2))' }}>
                                        <p className="text-xs text-forest-muted uppercase tracking-wider mb-1">Weight</p>
                                        <p className="text-3xl font-extrabold text-forest-cream">{selectedProduct.weight_grams}g</p>
                                    </div>
                                </div>

                                {selectedProduct.harvest_date && (
                                    <div className="p-5 rounded-2xl border mb-8"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(82, 183, 136, 0.06), rgba(27, 67, 50, 0.08))',
                                            borderColor: 'rgba(82, 183, 136, 0.12)',
                                        }}>
                                        <h3 className="font-semibold text-forest-spring mb-2 flex items-center gap-2">
                                            <Shield className="w-4 h-4" /> Batch Traceability
                                        </h3>
                                        <p className="text-sm text-forest-muted">Harvested: {new Date(selectedProduct.harvest_date).toLocaleDateString()}</p>
                                        {selectedProduct.lab_tested && <p className="text-sm text-emerald-400 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Lab tested & verified</p>}
                                    </div>
                                )}

                                <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                                    className="w-full py-4 rounded-2xl font-semibold text-sm text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    style={{
                                        background: 'linear-gradient(135deg, #2d5a27, #7cb342, #f57c00)',
                                        boxShadow: '0 4px 25px rgba(124, 179, 66, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                                    }}>
                                    <Leaf className="w-4 h-4" /> Add to Cart
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ CART DRAWER ═══ */}
            <AnimatePresence>
                {cartOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-forest-darkest/70 backdrop-blur-sm"
                        onClick={() => setCartOpen(false)}>
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="absolute right-0 top-0 h-full w-full max-w-md border-l border-forest-border/20 flex flex-col"
                            style={{
                                background: 'linear-gradient(135deg, rgba(15, 33, 15, 0.98), rgba(5, 13, 5, 0.99))',
                                boxShadow: '-10px 0 50px rgba(0,0,0,0.5)',
                            }}
                            onClick={e => e.stopPropagation()}>

                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-forest-border/15">
                                <div className="flex items-center gap-3">
                                    <ShoppingCart className="w-5 h-5" style={{ color: '#7cb342' }} />
                                    <h2 className="text-xl font-bold text-forest-cream font-display">Your Cart</h2>
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
                                        style={{ background: 'linear-gradient(135deg, #2d5a27, #7cb342)' }}>
                                        {totalItems}
                                    </span>
                                </div>
                                <button onClick={() => setCartOpen(false)}
                                    className="p-2 rounded-xl hover:bg-forest-card/30 text-forest-muted hover:text-forest-cream transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Cart Items */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                {cart.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center py-16">
                                        <span className="text-6xl mb-4">🛒</span>
                                        <h3 className="text-lg font-semibold text-forest-muted font-display">Cart is Empty</h3>
                                        <p className="text-sm text-forest-muted/50 mt-2">Add some products to get started!</p>
                                        <button onClick={() => setCartOpen(false)}
                                            className="mt-6 px-6 py-3 rounded-xl text-sm font-medium border border-forest-border/20 text-forest-muted hover:text-forest-cream hover:border-forest-border/40 transition-all">
                                            Continue Shopping
                                        </button>
                                    </div>
                                ) : (
                                    cart.map(item => (
                                        <div key={item.id} className="flex gap-4 p-4 rounded-2xl border border-forest-border/15 group hover:border-forest-border/25 transition-all"
                                            style={{ background: 'linear-gradient(135deg, rgba(26, 58, 26, 0.25), rgba(15, 33, 15, 0.2))' }}>
                                            {/* Item Image */}
                                            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-3xl"
                                                        style={{ background: 'linear-gradient(135deg, rgba(15, 33, 15, 0.8), rgba(27, 67, 50, 0.5))' }}>
                                                        {CATEGORY_EMOJIS[item.category] || '🌿'}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Item Details */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold text-forest-cream truncate">{item.name}</h4>
                                                <p className="text-xs text-forest-muted mt-0.5">{item.weight_grams && `${item.weight_grams}g`}</p>
                                                <p className="text-base font-bold mt-1" style={{ color: '#7cb342' }}>₹{item.price}</p>

                                                {/* Qty Controls */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <button onClick={() => updateQty(item.id, -1)}
                                                        className="w-7 h-7 rounded-lg flex items-center justify-center border border-forest-border/20 text-forest-muted hover:text-forest-cream hover:border-forest-border/40 transition-all">
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="text-sm font-bold text-forest-cream w-6 text-center">{item.qty}</span>
                                                    <button onClick={() => updateQty(item.id, 1)}
                                                        className="w-7 h-7 rounded-lg flex items-center justify-center border border-forest-border/20 text-forest-muted hover:text-forest-cream hover:border-forest-border/40 transition-all">
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                    <button onClick={() => removeFromCart(item.id)}
                                                        className="ml-auto p-1.5 rounded-lg text-forest-muted/40 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Item Total */}
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-sm font-bold text-forest-cream">₹{item.price * item.qty}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer — Total & Checkout */}
                            {cart.length > 0 && (
                                <div className="p-6 border-t border-forest-border/15"
                                    style={{ background: 'linear-gradient(180deg, transparent, rgba(5, 13, 5, 0.5))' }}>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm text-forest-muted">Subtotal ({totalItems} items)</span>
                                        <span className="text-2xl font-extrabold text-forest-cream">₹{totalPrice.toLocaleString()}</span>
                                    </div>
                                    <button className="w-full py-4 rounded-2xl font-semibold text-sm text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                        style={{
                                            background: 'linear-gradient(135deg, #2d5a27, #7cb342, #f57c00)',
                                            boxShadow: '0 4px 25px rgba(124, 179, 66, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
                                        }}>
                                        <ShoppingCart className="w-4 h-4" /> Proceed to Checkout
                                    </button>
                                    <button onClick={() => setCartOpen(false)}
                                        className="w-full mt-3 py-3 rounded-xl text-sm text-forest-muted hover:text-forest-cream transition-colors font-medium">
                                        ← Continue Shopping
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ AUTH MODAL — Login / Signup Popup ═══ */}
            <AuthModal
                open={authModalOpen}
                onClose={handleAuthModalClose}
                onLogin={handleAuthLogin}
            />
        </div>
    );
};

export default StoreFront;
