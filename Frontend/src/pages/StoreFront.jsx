import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Shield, Award, Leaf, ChevronRight, FlaskConical, CheckCircle2, Sparkles } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const StoreFront = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cart, setCart] = useState([]);

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_BASE}/store/products`);
            const data = await res.json();
            setProducts(data);
        } catch (err) { console.error('Failed:', err); }
        finally { setLoading(false); }
    };

    const addToCart = (product) => {
        setCart(prev => {
            const ex = prev.find(i => i.id === product.id);
            if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const totalItems = cart.reduce((s, i) => s + i.qty, 0);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0f1a] via-[#0f172a] to-[#0a0f1a] text-white font-sans">
            {/* NAV */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-lime-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <Leaf className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">KVedaa</h1>
                            <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Cordyceps Farm</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Owner Login</a>
                        <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors group" id="cart-button">
                            <ShoppingCart className="w-5 h-5 text-slate-400 group-hover:text-white" />
                            {totalItems > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-[10px] flex items-center justify-center font-bold">{totalItems}</span>}
                        </button>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-emerald-600/10 blur-[150px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-lime-500/10 blur-[120px] pointer-events-none" />
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
                            <Sparkles className="w-3.5 h-3.5" /> Premium Cordyceps Militaris
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent leading-tight">
                            Farm-to-Table<br />Medicinal Fungi
                        </h1>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">Every batch is scientifically cultivated, lab-tested, and traceable.</p>
                        <div className="flex items-center justify-center gap-4 flex-wrap">
                            <a href="#products" className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold shadow-xl shadow-emerald-500/20 transition-all active:scale-95">Shop Now</a>
                            <a href="#quality" className="px-8 py-3.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 font-medium transition-all">Our Quality Promise</a>
                        </div>
                    </motion.div>
                </div>
                <div className="max-w-4xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[{ icon: FlaskConical, label: 'Lab Tested', desc: 'Every batch' }, { icon: Shield, label: 'GMP Certified', desc: 'Quality assured' }, { icon: Leaf, label: 'Organic', desc: 'Pesticide free' }, { icon: Award, label: 'Traceable', desc: 'Batch verified' }].map((b, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                            <b.icon className="w-6 h-6 text-emerald-400 mb-2" /><p className="text-sm font-semibold text-white">{b.label}</p><p className="text-[11px] text-slate-500">{b.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* PRODUCTS */}
            <section id="products" className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-3">Our Products</h2>
                        <p className="text-slate-400">Lab-tested, batch-traced Cordyceps Militaris</p>
                    </div>
                    {loading ? (
                        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div></div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20">
                            <Leaf className="w-16 h-16 text-emerald-500/30 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-400">Coming Soon</h3>
                            <p className="text-sm text-slate-500 mt-2">Our first harvest is being prepared!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {products.map((p, i) => (
                                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                    className="group rounded-2xl bg-white/5 border border-white/5 overflow-hidden hover:border-emerald-500/20 transition-all flex flex-col">
                                    <div className="relative h-56 bg-gradient-to-br from-emerald-900/30 to-lime-900/20 flex items-center justify-center">
                                        <span className="text-6xl">🍄</span>
                                        <div className="absolute top-3 left-3 flex gap-1.5">
                                            {p.lab_tested && <span className="px-2 py-1 rounded-md bg-emerald-500/90 text-[10px] font-bold uppercase text-white">Lab Tested</span>}
                                            {p.quality_grade && <span className="px-2 py-1 rounded-md bg-amber-500/90 text-[10px] font-bold uppercase text-white">Grade {p.quality_grade}</span>}
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex items-start justify-between mb-2">
                                            <div><h3 className="font-bold text-white text-lg">{p.name}</h3>{p.strain && <p className="text-xs text-emerald-400 mt-0.5">Strain: {p.strain}</p>}</div>
                                            <p className="text-xl font-bold text-emerald-400">₹{p.price}</p>
                                        </div>
                                        <p className="text-sm text-slate-400 mb-4 line-clamp-2 flex-1">{p.description}</p>
                                        {p.harvest_date && <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 mb-4">
                                            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold"><CheckCircle2 className="w-3 h-3" />Batch Verified</div>
                                            <p className="text-[11px] text-slate-400 mt-1">Harvested: {new Date(p.harvest_date).toLocaleDateString()}</p>
                                        </div>}
                                        <div className="flex gap-2 mt-auto">
                                            <button onClick={() => addToCart(p)} className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">Add to Cart</button>
                                            <button onClick={() => setSelectedProduct(p)} className="px-3 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-400 transition-all"><ChevronRight className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* QUALITY */}
            <section id="quality" className="py-20 px-6 bg-gradient-to-b from-transparent via-emerald-950/20 to-transparent">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">The Quality Promise</h2>
                    <p className="text-slate-400 mb-12 max-w-xl mx-auto">Every product links back to its cultivation batch. Transparency you can trust.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[{ s: '01', t: 'Cultivated', d: 'Precise temp, humidity, and light cycles', e: '🌱' }, { s: '02', t: 'Lab Tested', d: 'Purity, potency, and contaminant testing', e: '🔬' }, { s: '03', t: 'Batch Traced', d: 'Full lifecycle on our platform', e: '📋' }].map((item, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                                className="p-8 rounded-2xl bg-white/5 border border-white/5 text-left hover:bg-white/10 transition-all">
                                <span className="text-5xl mb-4 block">{item.e}</span>
                                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Step {item.s}</span>
                                <h3 className="text-xl font-bold text-white mt-1 mb-2">{item.t}</h3>
                                <p className="text-sm text-slate-400">{item.d}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* WHOLESALE CTA */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="p-12 rounded-3xl bg-gradient-to-r from-emerald-900/40 to-lime-900/40 border border-emerald-500/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
                        <h2 className="text-3xl font-bold mb-4 relative z-10">Wholesale Inquiries</h2>
                        <p className="text-slate-400 mb-8 max-w-lg mx-auto relative z-10">Bulk orders for your store, clinic, or brand? We offer competitive pricing.</p>
                        <button className="px-8 py-3.5 rounded-xl bg-white text-gray-900 font-semibold hover:bg-slate-100 transition-all active:scale-95 shadow-xl relative z-10" id="wholesale-cta">Request Wholesale Quote</button>
                    </div>
                </div>
            </section>

            <footer className="border-t border-white/5 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2"><Leaf className="w-5 h-5 text-emerald-500" /><span className="font-semibold">KVedaa Cordyceps Farm</span></div>
                    <p className="text-sm text-slate-500">© 2026 KVedaa. All rights reserved.</p>
                </div>
            </footer>

            {/* MODAL */}
            <AnimatePresence>
                {selectedProduct && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#1e293b] rounded-3xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="p-8">
                                <div className="flex items-start justify-between mb-6">
                                    <div><h2 className="text-2xl font-bold text-white">{selectedProduct.name}</h2>{selectedProduct.strain && <p className="text-sm text-emerald-400 mt-1">Strain: {selectedProduct.strain}</p>}</div>
                                    <button onClick={() => setSelectedProduct(null)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400">✕</button>
                                </div>
                                <p className="text-slate-300 mb-6">{selectedProduct.description}</p>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5"><p className="text-xs text-slate-500 uppercase mb-1">Price</p><p className="text-2xl font-bold text-emerald-400">₹{selectedProduct.price}</p></div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5"><p className="text-xs text-slate-500 uppercase mb-1">Weight</p><p className="text-2xl font-bold text-white">{selectedProduct.weight_grams}g</p></div>
                                </div>
                                {selectedProduct.batch_info && <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 mb-6">
                                    <h3 className="font-semibold text-emerald-400 mb-3 flex items-center gap-2"><Shield className="w-4 h-4" />Batch Traceability</h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div><p className="text-slate-500">Batch</p><p className="text-white font-medium">{selectedProduct.batch_info.batch_number}</p></div>
                                        <div><p className="text-slate-500">Strain</p><p className="text-white font-medium">{selectedProduct.batch_info.strain}</p></div>
                                    </div>
                                </div>}
                                <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} className="w-full py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">Add to Cart</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StoreFront;
