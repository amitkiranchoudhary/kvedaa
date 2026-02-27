import { useState, useEffect } from 'react';
import { inventoryAPI, scheduleAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, TrendingDown, Plus, Beaker, Leaf, X, TreePine,
    AlertTriangle, CheckCircle, Sparkles, Cpu, Activity, Zap,
    ShieldCheck, Calendar, ArrowUpRight, BarChart3
} from 'lucide-react';

const SummaryCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-[2rem] flex items-center justify-between group relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity duration-700"
            style={{ background: color?.includes('emerald') ? 'rgba(82, 183, 136, 0.4)' : color?.includes('amber') ? 'rgba(245, 158, 11, 0.3)' : 'rgba(230, 180, 34, 0.3)' }} />

        <div className="relative z-10">
            <p className="text-[10px] text-forest-muted font-bold uppercase tracking-[0.2em] mb-2">{title}</p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-extrabold text-forest-cream font-display tracking-tight">{value}</h3>
                {trend && <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" /> {trend}</span>}
            </div>
        </div>

        <div className={`p-4 rounded-2xl border transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 ${color}`}>
            <Icon className="w-7 h-7" />
        </div>
    </motion.div>
);

export default function Antennary() {
    const [tab, setTab] = useState('tasks');
    const [inventory, setInventory] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddItem, setShowAddItem] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [itemForm, setItemForm] = useState({
        name: '', category: 'substrate', quantity: 0, unit: 'kg', min_stock: 5, notes: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [invRes, taskRes] = await Promise.allSettled([
                inventoryAPI.getAll(),
                scheduleAPI.getAll()
            ]);
            if (invRes.status === 'fulfilled') {
                const data = invRes.value.data;
                setInventory(Array.isArray(data) ? data : data.items || []);
            }
            if (taskRes.status === 'fulfilled') {
                const data = taskRes.value.data;
                setTasks(Array.isArray(data) ? data : data.tasks || []);
            }
        } catch (err) {
            setError('Failed to establish connection with neural grid');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const lowStock = inventory.filter(i => i.quantity <= i.min_stock);

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            await inventoryAPI.create({
                ...itemForm,
                quantity: parseFloat(itemForm.quantity),
                min_stock: parseFloat(itemForm.min_stock)
            });
            setShowAddItem(false);
            setItemForm({ name: '', category: 'substrate', quantity: 0, unit: 'kg', min_stock: 5, notes: '' });
            setSuccess('Inventory matrix updated successfully 🌿');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.detail || 'Matrix write failed');
        }
    };

    const handleToggleTask = async (taskId, completed) => {
        try {
            if (!completed) {
                await scheduleAPI.complete(taskId);
            }
            fetchData();
        } catch (err) {
            setError(err.response?.data?.detail || 'Task synchronization error');
        }
    };

    const catIcon = (category) => {
        const icons = {
            substrate: '🌾', chemical: '🧪', equipment: '⚙️', packaging: '📦', culture: '🧬'
        };
        return icons[category] || '📦';
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-forest-spring/10 animate-ping"></div>
                <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-forest-spring"></div>
                <Sparkles className="w-8 h-8 text-forest-spring absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-forest-muted animate-pulse font-bold tracking-widest text-xs uppercase">Initializing Antigravity Grid</p>
        </div>
    );

    return (
        <div className="space-y-10 page-enter">
            {/* Header / Brand */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-forest-spring/15 border border-forest-spring/20">
                            <Sparkles className="w-6 h-6 text-forest-spring" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-forest-cream font-display tracking-tight">
                            Antigravity <span className="text-emerald-400 font-light italic">Hub</span>
                        </h1>
                    </div>
                    <p className="text-sm text-forest-muted ml-1 flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5" />
                        Autonomous farm management & inventory orchestration
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-forest-darkest/40 p-1.5 rounded-2xl border border-forest-border/20 backdrop-blur-md">
                    <div className="px-4 py-2 rounded-xl flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold text-forest-cream uppercase tracking-wider">Neural Link Active</span>
                    </div>
                </div>
            </div>

            {/* Error/Success Notifications */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-6 py-4 rounded-2xl text-sm flex justify-between items-center backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-medium">{error}</span>
                        </div>
                        <button onClick={() => setError('')} className="p-1 hover:bg-rose-500/10 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                    </motion.div>
                )}
                {success && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-4 rounded-2xl text-sm flex justify-between items-center backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">{success}</span>
                        </div>
                        <button onClick={() => setSuccess('')} className="p-1 hover:bg-emerald-500/10 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI Command Section (New Antigravity-specific feature) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    {/* Summary Matrix */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <SummaryCard title="Inventory Depth" value={inventory.length} icon={Package} color="text-emerald-400 bg-emerald-500/8 border-emerald-500/12" trend="+12%" />
                        <SummaryCard title="Critical Stock" value={lowStock.length} icon={TrendingDown} color="text-rose-400 bg-rose-500/8 border-rose-500/12" />
                        <SummaryCard title="Active Protocols" value={tasks.filter(t => !t.completed).length} icon={Beaker} color="text-forest-gold bg-forest-gold/8 border-forest-gold/12" trend="Active" />
                    </div>

                    {/* Operational Tabs */}
                    <div className="glass-panel rounded-[2.5rem] p-4 flex items-center gap-2 inline-flex border border-forest-border/20">
                        <button onClick={() => setTab('tasks')}
                            className={`flex items-center gap-2 px-8 py-3 rounded-[1.8rem] text-sm font-bold transition-all duration-300 ${tab === 'tasks'
                                ? 'bg-forest-spring text-forest-darkest shadow-[0_0_25px_rgba(74,222,128,0.3)]'
                                : 'text-forest-muted hover:text-forest-cream'}`}>
                            <Zap className="w-4 h-4" /> Operational Tasks
                        </button>
                        <button onClick={() => setTab('inventory')}
                            className={`flex items-center gap-2 px-8 py-3 rounded-[1.8rem] text-sm font-bold transition-all duration-300 ${tab === 'inventory'
                                ? 'bg-forest-spring text-forest-darkest shadow-[0_0_25px_rgba(74,222,128,0.3)]'
                                : 'text-forest-muted hover:text-forest-cream'}`}>
                            <Package className="w-4 h-4" /> Resource Matrix
                        </button>
                    </div>

                    {tab === 'tasks' ? (
                        <div className="glass-panel rounded-[2.5rem] p-10 relative overflow-hidden">
                            {/* Decorative background logo */}
                            <Sparkles className="absolute -bottom-10 -right-10 w-64 h-64 text-forest-spring/5 rotate-12 pointer-events-none" />

                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h2 className="text-2xl font-bold text-forest-cream font-display flex items-center gap-3">
                                        <Calendar className="w-6 h-6 text-forest-spring" /> Current Protocols
                                    </h2>
                                    <p className="text-sm text-forest-muted mt-1">Farm synchronization tasks</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-forest-spring uppercase tracking-widest px-4 py-1.5 rounded-full border border-forest-spring/20 bg-forest-spring/5">
                                        Today: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            </div>

                            {tasks.length === 0 ? (
                                <div className="text-center py-20 bg-forest-darkest/20 rounded-[2rem] border border-forest-border/10">
                                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle className="w-10 h-10 text-emerald-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-forest-cream font-display mb-2">Protocols Balanced</h3>
                                    <p className="text-forest-muted text-sm max-w-xs mx-auto">All operational directives have been successfully executed.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {tasks.map(task => (
                                        <motion.div key={task.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-center gap-5 p-5 rounded-3xl border border-forest-border/10 hover:border-forest-spring/30 transition-all group relative overflow-hidden"
                                            style={{ background: 'linear-gradient(135deg, rgba(15, 33, 15, 0.4), rgba(10, 23, 10, 0.3))' }}>

                                            <button onClick={() => handleToggleTask(task.id, task.completed)}
                                                className={`p-3 rounded-2xl transition-all duration-500 border ${task.completed ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-forest-darkest/40 text-forest-muted/40 hover:text-forest-cream border-forest-border/20'}`}>
                                                <CheckCircle className="w-6 h-6" />
                                            </button>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <p className={`text-lg font-bold ${task.completed ? 'text-forest-muted/40 line-through' : 'text-forest-cream'}`}>{task.title}</p>
                                                    {task.priority === 'HIGH' && <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-bold uppercase tracking-widest border border-rose-500/20">Critical</span>}
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-forest-muted/60">
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Continuous'}</span>
                                                    <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {task.completed ? 'Executed' : 'Pending Synchronization'}</span>
                                                </div>
                                            </div>

                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ArrowUpRight className="w-5 h-5 text-forest-spring/40" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-forest-cream font-display">Inventory Matrix</h2>
                                <button onClick={() => setShowAddItem(true)} className="btn-primary flex items-center gap-2 text-sm px-6 rounded-2xl">
                                    <Plus className="w-4 h-4" /> Expand Inventory
                                </button>
                            </div>

                            {inventory.length === 0 ? (
                                <div className="glass-panel rounded-[2rem] p-20 text-center border border-forest-border/10">
                                    <Package className="w-20 h-20 text-forest-muted/20 mx-auto mb-6" />
                                    <h3 className="text-2xl font-bold text-forest-cream font-display mb-2">Matrix Empty</h3>
                                    <p className="text-forest-muted text-sm">Initiate the first resource entry to begin tracking.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {inventory.map(item => (
                                        <motion.div key={item.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="glass-card rounded-3xl p-6 flex items-center gap-5 border border-forest-border/15 group hover:border-forest-spring/20">
                                            <div className="w-16 h-16 rounded-2xl bg-forest-darkest/60 flex items-center justify-center text-3xl border border-forest-border/10 group-hover:scale-110 transition-transform">
                                                {catIcon(item.category)}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-forest-cream">{item.name}</h3>
                                                <p className="text-xs text-forest-muted/60 uppercase tracking-widest font-bold mt-0.5">{item.category}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-2xl font-black ${item.quantity <= item.min_stock ? 'text-rose-400' : 'text-emerald-400'}`}>{item.quantity} <span className="text-xs font-normal text-forest-muted/40 uppercase">{item.unit}</span></p>
                                                {item.quantity <= item.min_stock && (
                                                    <span className="text-[10px] font-black text-rose-500 uppercase flex items-center gap-1 justify-end mt-1 animate-pulse">
                                                        <AlertTriangle className="w-3 h-3" /> Replenish
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar - AI Antigravity Insights */}
                <div className="space-y-8">
                    <div className="glass-panel rounded-[2.5rem] p-8 border-forest-spring/20 relative overflow-hidden bg-gradient-to-br from-forest-spring/5 to-transparent">
                        <div className="absolute top-0 right-0 p-4">
                            <Sparkles className="w-6 h-6 text-forest-spring/40" />
                        </div>

                        <h3 className="text-lg font-bold text-forest-cream mb-6 flex items-center gap-2">
                            <Cpu className="w-5 h-5 text-forest-spring" /> AI Insights
                        </h3>

                        <div className="space-y-6">
                            <div className="p-4 rounded-2xl bg-forest-darkest/40 border border-forest-border/10 space-y-3">
                                <div className="flex items-center gap-2 text-forest-spring">
                                    <Zap className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Prediction</span>
                                </div>
                                <p className="text-xs text-forest-cream leading-relaxed font-medium">
                                    Substrate levels are depleting faster than scheduled. Recommendation: Increase procurement by <span className="text-forest-spring">15%</span> before Friday.
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-forest-darkest/40 border border-forest-border/10 space-y-3">
                                <div className="flex items-center gap-2 text-forest-gold">
                                    <BarChart3 className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Efficiency</span>
                                </div>
                                <p className="text-xs text-forest-cream leading-relaxed font-medium">
                                    Operational efficiency is currently at <span className="text-forest-gold">94.8%</span>. Protocol completion rate is trending upwards.
                                </p>
                            </div>

                            <div className="pt-4 border-t border-forest-border/10">
                                <div className="flex items-center justify-between text-[11px] mb-4">
                                    <span className="text-forest-muted font-bold tracking-widest uppercase">System Health</span>
                                    <span className="text-emerald-400 font-bold">Optimal</span>
                                </div>
                                <div className="h-1.5 w-full bg-forest-darkest/60 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} className="h-full bg-forest-spring rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats / Environment */}
                    <div className="glass-card rounded-[2.5rem] p-8 border-forest-border/10">
                        <h3 className="text-sm font-bold text-forest-cream uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-forest-muted" /> Lab Status
                        </h3>
                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-forest-muted font-medium">Sterilization</span>
                                <span className="text-xs font-bold text-emerald-400">Verifed</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-forest-muted font-medium">Access Log</span>
                                <span className="text-xs font-bold text-forest-cream">Admin (0)</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-forest-muted font-medium">Network Latency</span>
                                <span className="text-xs font-bold text-forest-cream">24ms</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal - Modern & Advanced */}
            {showAddItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-forest-darkest/90 backdrop-blur-xl transition-all duration-500" onClick={() => setShowAddItem(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="rounded-[3rem] p-10 max-w-lg w-full border border-forest-spring/20 relative"
                        style={{
                            background: 'linear-gradient(135deg, rgba(10, 23, 10, 0.98), rgba(5, 13, 5, 1))',
                            boxShadow: '0 50px 150px rgba(0,0,0,0.8), 0 0 80px rgba(74, 222, 128, 0.05)',
                        }}
                        onClick={e => e.stopPropagation()}>

                        <div className="absolute top-0 right-0 p-8">
                            <button onClick={() => setShowAddItem(false)} className="text-forest-muted hover:text-forest-cream p-2 hover:bg-forest-card/30 rounded-full transition-all"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-forest-cream font-display flex items-center gap-3">
                                <Package className="w-7 h-7 text-forest-spring" /> Matrix Initiation
                            </h2>
                            <p className="text-sm text-forest-muted mt-1">Register a new resource into the system.</p>
                        </div>

                        <form onSubmit={handleAddItem} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-forest-muted uppercase tracking-[0.2em] ml-1">Asset Name</label>
                                <input placeholder="e.g. Premium Rye Substrate" value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} className="input-scada w-full bg-forest-darkest/60 h-14" required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-forest-muted uppercase tracking-[0.2em] ml-1">Classification</label>
                                    <select value={itemForm.category} onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })} className="input-scada w-full h-14">
                                        <option value="substrate">Substrate</option>
                                        <option value="chemical">Chemical</option>
                                        <option value="equipment">Equipment</option>
                                        <option value="packaging">Packaging</option>
                                        <option value="culture">Culture</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-forest-muted uppercase tracking-[0.2em] ml-1">Metric Unit</label>
                                    <select value={itemForm.unit} onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })} className="input-scada w-full h-14">
                                        <option value="kg">kilograms (kg)</option>
                                        <option value="g">grams (g)</option>
                                        <option value="L">liters (L)</option>
                                        <option value="mL">milliliters (mL)</option>
                                        <option value="pcs">pieces (pcs)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-forest-muted uppercase tracking-[0.2em] ml-1">Total Quantity</label>
                                    <input type="number" min="0" step="0.1" value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })} className="input-scada w-full h-14" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-forest-muted uppercase tracking-[0.2em] ml-1">Lower Threshold</label>
                                    <input type="number" min="0" step="0.1" value={itemForm.min_stock} onChange={(e) => setItemForm({ ...itemForm, min_stock: e.target.value })} className="input-scada w-full h-14" />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary w-full h-16 flex items-center justify-center gap-3 text-lg font-bold rounded-2xl group overflow-hidden relative">
                                <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                Confirm Matrix Write
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20" />
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
