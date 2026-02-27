import { useState, useEffect } from 'react';
import { ShoppingCart, Leaf, ChevronRight, X, Minus, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const CATEGORY_EMOJIS = {
    'cordyceps': '🍄',
    'yellow-turmeric': '🌾',
    'black-turmeric': '🖤',
    'white-musli': '🌱',
};

// Fallback products
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

export default function Products({ cart, addToCart, removeFromCart, updateQty }) {
    const location = useLocation();
    const [products, setProducts] = useState(SHOWCASE_PRODUCTS);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState(location.state?.category || 'all');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cartOpen, setCartOpen] = useState(false);

    const totalItems = cart ? cart.reduce((s, i) => s + i.qty, 0) : 0;
    const totalPrice = cart ? cart.reduce((s, i) => s + i.price * i.qty, 0) : 0;

    useEffect(() => {
        if (!loading && location.state?.productId && !selectedProduct) {
            const product = products.find(p => p.id === location.state.productId);
            if (product) setSelectedProduct(product);
        }
    }, [loading, products, location.state]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_BASE}/store/products`);
            const data = await res.json();
            if (data && data.length > 0) setProducts(data);
            else setProducts(SHOWCASE_PRODUCTS);
        } catch {
            setProducts(SHOWCASE_PRODUCTS);
        } finally { setLoading(false); }
    };

    const categories = ['all', ...new Set(products.map(p => p.category))];
    const filteredProducts = activeCategory === 'all' ? products : products.filter(p => p.category === activeCategory);

    return (
        <div className="min-h-screen bg-forest-darkest text-forest-text font-sans relative overflow-hidden pt-32 pb-24">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-700/[0.04] blur-[150px]" />
                <div className="absolute inset-0 opacity-[0.02] nature-dots" />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-forest-border/20 shadow-lg"
                style={{ background: 'linear-gradient(180deg, rgba(5, 13, 5, 0.95), rgba(5, 13, 5, 0.88))', backdropFilter: 'blur(20px)' }}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/store" className="flex items-center">
                        <img src="/assets/kvedaa-logo.png" alt="KiranVedaa" className="h-28 w-auto object-contain"
                            style={{ filter: 'drop-shadow(0 0 10px rgba(124, 179, 66, 0.35)) brightness(1.1)' }} />
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link to="/store" className="text-sm text-forest-muted hover:text-forest-cream transition-colors">Home</Link>
                        <Link to="/about" className="text-sm text-forest-muted hover:text-forest-cream transition-colors">About Us</Link>
                        <Link to="/quality" className="text-sm text-forest-muted hover:text-forest-cream transition-colors">Quality</Link>
                        {/* Cart Button */}
                        <button onClick={() => setCartOpen(true)} className="relative p-2.5 rounded-xl hover:bg-forest-card/30 transition-all group border border-transparent hover:border-forest-border/20">
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

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-forest-cream font-display mb-4">Complete Collection</h1>
                    <p className="text-forest-muted">Explore our full range of premium nature products.</p>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-3 mb-12">
                    {categories.map(c => (
                        <button key={c} onClick={() => setActiveCategory(c)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider backdrop-blur-md transition-all ${activeCategory === c
                                ? 'text-white border border-forest-spring/30'
                                : 'text-forest-muted border border-forest-border/15 hover:text-forest-cream hover:border-forest-border/30 hover:bg-forest-card/30'
                                }`}
                            style={activeCategory === c ? {
                                background: 'linear-gradient(135deg, rgba(27, 67, 50, 0.6), rgba(45, 106, 79, 0.4))',
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 15px rgba(0,0,0,0.2)'
                            } : undefined}>
                            {c === 'all' ? 'All Botanicals' : <span className="flex items-center gap-2"><span>{CATEGORY_EMOJIS[c]}</span> {c.replace('-', ' ')}</span>}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
                    {filteredProducts.map((p, i) => (
                        <motion.div key={p.id} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                            className="group rounded-3xl border border-forest-border/15 overflow-hidden transition-all duration-500 flex flex-col hover:border-forest-spring/25"
                            style={{
                                background: 'linear-gradient(145deg, rgba(26, 58, 26, 0.3), rgba(15, 33, 15, 0.25))',
                                backdropFilter: 'blur(10px)',
                            }}>
                            <div className="relative h-52 overflow-hidden">
                                {p.image ? (
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-500"
                                        style={{ background: 'linear-gradient(135deg, rgba(15, 33, 15, 0.9), rgba(27, 67, 50, 0.6))' }}>
                                        {CATEGORY_EMOJIS[p.category] || '🌿'}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-forest-darkest/80 via-forest-darkest/20 to-transparent" />
                                <div className="absolute bottom-3 left-3">
                                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase backdrop-blur-md border text-forest-spring border-forest-spring/15 bg-forest-darkest/60">
                                        {CATEGORY_EMOJIS[p.category]} {p.category?.replace('-', ' ')}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col relative z-10">
                                <h3 className="text-xl font-bold font-display text-forest-cream mb-2 line-clamp-2 leading-tight group-hover:text-forest-spring transition-colors">{p.name}</h3>
                                <p className="text-sm text-forest-muted leading-relaxed line-clamp-2 mb-4">{p.description}</p>
                                <div className="mt-auto flex items-center gap-3">
                                    <div className="flex flex-col flex-1">
                                        <span className="text-[10px] text-forest-muted/50 uppercase font-bold tracking-wider mb-0.5">Price</span>
                                        <span className="text-2xl font-extrabold text-white">₹{p.price}</span>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); addToCart(p); setCartOpen(true); }}
                                        className="h-10 px-4 flex items-center justify-center rounded-xl bg-forest-spring/10 border border-forest-spring/20 text-forest-spring hover:bg-forest-spring hover:text-forest-darkest hover:scale-105 transition-all font-bold text-sm">
                                        <ShoppingCart className="w-4 h-4 mr-1.5" /> Add
                                    </button>
                                    <button onClick={() => setSelectedProduct(p)}
                                        className="h-10 w-10 flex flex-shrink-0 items-center justify-center rounded-xl bg-forest-card/40 border border-forest-border/20 text-forest-cream group-hover:bg-forest-card group-hover:border-forest-border/40 hover:scale-105 transition-all">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-20 px-6">
                        <span className="text-5xl block mb-4">🫙</span>
                        <h3 className="text-2xl font-semibold text-forest-cream mb-2 font-display">No Botanicals Found</h3>
                        <p className="text-forest-muted">We couldn't find any products in this category.</p>
                    </div>
                )}
            </div>

            {/* Product Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-darkest/85 backdrop-blur-md"
                        onClick={() => setSelectedProduct(null)}>
                        <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
                            className="rounded-3xl border border-forest-border/25 max-w-xl w-full max-h-[90vh] overflow-y-auto"
                            style={{
                                background: 'linear-gradient(135deg, rgba(19, 42, 19, 0.97), rgba(10, 23, 10, 0.99))',
                            }}
                            onClick={e => e.stopPropagation()}>
                            {selectedProduct.image && (
                                <div className="h-56 overflow-hidden rounded-t-3xl relative">
                                    <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="p-8">
                                <div className="flex justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-forest-cream font-display">{selectedProduct.name}</h2>
                                    <button onClick={() => setSelectedProduct(null)} className="p-2 text-forest-muted hover:text-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-forest-muted mb-6">{selectedProduct.description}</p>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 border border-forest-border/20 rounded-xl"><p className="text-xs uppercase text-forest-muted">Price</p><p className="text-2xl font-bold text-forest-spring">₹{selectedProduct.price}</p></div>
                                    <div className="p-4 border border-forest-border/20 rounded-xl"><p className="text-xs uppercase text-forest-muted">Weight</p><p className="text-2xl font-bold text-forest-cream">{selectedProduct.weight_grams}g</p></div>
                                </div>
                                <div className="flex gap-4">
                                    <button className="flex-1 py-4 bg-forest-spring text-forest-darkest font-bold rounded-2xl hover:bg-emerald-400 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                        onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); setCartOpen(true); }}>
                                        <ShoppingCart className="w-5 h-5" /> Add to Cart
                                    </button>
                                    <button className="px-6 py-4 border border-forest-border/20 text-forest-muted font-bold rounded-2xl hover:bg-forest-card hover:text-white transition-all"
                                        onClick={() => setSelectedProduct(null)}>
                                        Close
                                    </button>
                                </div>
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
                                {cart && cart.length === 0 ? (
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
                                    cart && cart.map(item => (
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
                            {cart && cart.length > 0 && (
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
        </div>
    );
}
