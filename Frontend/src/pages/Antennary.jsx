import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Package, AlertTriangle, Plus, Check, Clock, Leaf, TrendingDown, Box, Beaker } from 'lucide-react';

const Antennary = () => {
    const [activeTab, setActiveTab] = useState('tasks'); // tasks, inventory
    const [tasks, setTasks] = useState([]);
    const [todayTasks, setTodayTasks] = useState([]);
    const [overdueTasks, setOverdueTasks] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddItem, setShowAddItem] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [tasksRes, todayRes, overdueRes, invRes, lowRes] = await Promise.all([
                api.get('/api/farm/tasks/?limit=50'),
                api.get('/api/farm/tasks/today'),
                api.get('/api/farm/tasks/overdue'),
                api.get('/api/farm/inventory/'),
                api.get('/api/farm/inventory/low-stock'),
            ]);
            setTasks(tasksRes.data);
            setTodayTasks(todayRes.data);
            setOverdueTasks(overdueRes.data);
            setInventory(invRes.data);
            setLowStock(lowRes.data);
        } catch (err) { console.error('Failed:', err); }
        finally { setLoading(false); }
    };

    const completeTask = async (taskId) => {
        try {
            await api.post(`/api/farm/tasks/${taskId}/complete`);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const createInventoryItem = async (data) => {
        try {
            await api.post('/api/farm/inventory/', data);
            setShowAddItem(false);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const adjustStock = async (itemId, change, reason) => {
        try {
            await api.post(`/api/farm/inventory/${itemId}/adjust`, { quantity_change: change, reason, transaction_type: change > 0 ? 'ADD' : 'DEDUCT' });
            fetchData();
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="flex items-center justify-center h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-scada-accent"></div></div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">🔬 Antennary</h1>
                    <p className="text-sm text-slate-400 mt-1">Inventory Management + Task Scheduler</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex rounded-lg bg-white/5 border border-white/5 p-0.5">
                        <button onClick={() => setActiveTab('tasks')} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'tasks' ? 'bg-scada-accent text-white' : 'text-slate-400'}`}>Tasks</button>
                        <button onClick={() => setActiveTab('inventory')} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'inventory' ? 'bg-scada-accent text-white' : 'text-slate-400'}`}>Inventory</button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryCard title="Today's Tasks" value={todayTasks.length} icon={Clock} color="text-blue-400 bg-blue-500/10 border-blue-500/20" />
                <SummaryCard title="Overdue" value={overdueTasks.length} icon={AlertTriangle} color="text-rose-400 bg-rose-500/10 border-rose-500/20" />
                <SummaryCard title="Inventory Items" value={inventory.length} icon={Package} color="text-emerald-400 bg-emerald-500/10 border-emerald-500/20" />
                <SummaryCard title="Low Stock" value={lowStock.length} icon={TrendingDown} color="text-amber-400 bg-amber-500/10 border-amber-500/20" />
            </div>

            {/* TASKS TAB */}
            {activeTab === 'tasks' && (
                <div className="space-y-6">
                    {/* Overdue Alert */}
                    {overdueTasks.length > 0 && (
                        <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                            <h3 className="font-bold text-rose-400 mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Overdue Tasks ({overdueTasks.length})</h3>
                            <div className="space-y-2">
                                {overdueTasks.map(task => (
                                    <TaskRow key={task.id} task={task} onComplete={completeTask} isOverdue />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Today's Tasks */}
                    <div>
                        <h3 className="font-bold text-white mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" /> Today's To-Do ({todayTasks.length})</h3>
                        {todayTasks.length === 0 ? (
                            <div className="text-center py-12 glass-panel rounded-2xl">
                                <Check className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                                <p className="text-slate-400">All caught up! No tasks due today.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">{todayTasks.map(t => <TaskRow key={t.id} task={t} onComplete={completeTask} />)}</div>
                        )}
                    </div>

                    {/* All Tasks */}
                    <div>
                        <h3 className="font-bold text-white mb-3">All Pending Tasks</h3>
                        <div className="space-y-2">
                            {tasks.filter(t => t.status === 'PENDING').slice(0, 20).map(t => <TaskRow key={t.id} task={t} onComplete={completeTask} />)}
                            {tasks.filter(t => t.status === 'PENDING').length === 0 && <p className="text-slate-500 text-sm">No pending tasks.</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* INVENTORY TAB */}
            {activeTab === 'inventory' && (
                <div className="space-y-6">
                    {/* Low Stock Warning */}
                    {lowStock.length > 0 && (
                        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                            <h3 className="font-bold text-amber-400 mb-2 flex items-center gap-2"><TrendingDown className="w-4 h-4" /> Low Stock Alert</h3>
                            <div className="flex flex-wrap gap-2">
                                {lowStock.map(item => (
                                    <span key={item.id} className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium">{item.name}: {item.quantity} {item.unit}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white">Inventory</h3>
                        <button onClick={() => setShowAddItem(true)} className="btn-primary flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> Add Item</button>
                    </div>

                    {/* Consumables */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Beaker className="w-3.5 h-3.5" /> Consumables</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {inventory.filter(i => i.category === 'CONSUMABLE').map(item => (
                                <InventoryCard key={item.id} item={item} onAdjust={adjustStock} />
                            ))}
                        </div>
                    </div>

                    {/* Finished Products */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Leaf className="w-3.5 h-3.5" /> Finished Products</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {inventory.filter(i => i.category === 'FINISHED_PRODUCT').map(item => (
                                <InventoryCard key={item.id} item={item} onAdjust={adjustStock} />
                            ))}
                        </div>
                        {inventory.filter(i => i.category === 'FINISHED_PRODUCT').length === 0 && <p className="text-sm text-slate-500">No finished products yet.</p>}
                    </div>
                </div>
            )}

            {showAddItem && <AddInventoryModal onClose={() => setShowAddItem(false)} onCreate={createInventoryItem} />}
        </div>
    );
};


const SummaryCard = ({ title, value, icon: Icon, color }) => (
    <div className="glass-card p-4 rounded-2xl flex items-center justify-between group">
        <div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">{title}</p>
            <h3 className="text-2xl font-bold text-white">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-xl border ${color}`}><Icon className="w-5 h-5" /></div>
    </div>
);


const TaskRow = ({ task, onComplete, isOverdue }) => {
    const stageColors = { SUBSTRATE_PREP: 'bg-blue-500', INOCULATION: 'bg-violet-500', INCUBATION: 'bg-indigo-500', FRUITING: 'bg-amber-500', HARVEST: 'bg-emerald-500' };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`flex items-center gap-3 p-3 rounded-xl ${isOverdue ? 'bg-rose-500/5 border border-rose-500/10' : 'bg-white/5 border border-white/5'} hover:bg-white/8 transition-all group`}>
            <button onClick={() => onComplete(task.id)} className="w-6 h-6 rounded-full border-2 border-slate-600 hover:border-emerald-500 hover:bg-emerald-500/20 flex items-center justify-center transition-all shrink-0 group-hover:border-emerald-400">
                <Check className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition-colors" />
            </button>
            <div className={`w-1.5 h-8 rounded-full ${stageColors[task.stage] || 'bg-slate-600'} shrink-0`} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{task.title}</p>
                <p className="text-[10px] text-slate-500">{new Date(task.due_date).toLocaleDateString()} • {task.stage}</p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${task.priority === 'HIGH' || task.priority === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400' : 'bg-white/5 text-slate-400'}`}>{task.priority}</span>
        </motion.div>
    );
};


const InventoryCard = ({ item, onAdjust }) => {
    const [adjusting, setAdjusting] = useState(false);
    const [qty, setQty] = useState('');

    return (
        <div className={`p-4 rounded-xl bg-white/5 border ${item.is_low_stock ? 'border-amber-500/20' : 'border-white/5'} hover:bg-white/8 transition-all`}>
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white text-sm">{item.name}</h4>
                {item.is_low_stock && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-full">Low</span>}
            </div>
            <div className="flex items-baseline gap-1 mb-3">
                <span className="text-2xl font-bold text-white">{item.quantity}</span>
                <span className="text-xs text-slate-500">{item.unit}</span>
            </div>
            {!adjusting ? (
                <button onClick={() => setAdjusting(true)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">± Adjust Stock</button>
            ) : (
                <div className="flex gap-2">
                    <input type="number" value={qty} onChange={e => setQty(e.target.value)} className="input-scada text-xs w-20 py-1 px-2" placeholder="±qty" />
                    <button onClick={() => { onAdjust(item.id, parseFloat(qty), 'Manual adjustment'); setAdjusting(false); setQty(''); }} className="text-xs text-emerald-400 hover:text-emerald-300">Save</button>
                    <button onClick={() => { setAdjusting(false); setQty(''); }} className="text-xs text-slate-500">✕</button>
                </div>
            )}
        </div>
    );
};


const AddInventoryModal = ({ onClose, onCreate }) => {
    const [form, setForm] = useState({ name: '', category: 'CONSUMABLE', quantity: 0, unit: 'g', low_stock_threshold: 0, cost_per_unit: '', supplier: '', description: '' });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[#1e293b] rounded-2xl border border-white/10 max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-white mb-6">📦 Add Inventory Item</h2>
                <div className="space-y-4">
                    <div><label className="text-xs text-slate-400 mb-1 block">Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-scada w-full" placeholder="Brown Rice" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs text-slate-400 mb-1 block">Category</label>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-scada w-full">
                                <option value="CONSUMABLE">Consumable</option><option value="FINISHED_PRODUCT">Finished Product</option>
                            </select>
                        </div>
                        <div><label className="text-xs text-slate-400 mb-1 block">Unit</label>
                            <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="input-scada w-full">
                                <option value="g">Grams</option><option value="kg">Kilograms</option><option value="L">Liters</option><option value="mL">Milliliters</option><option value="units">Units</option><option value="pcs">Pieces</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs text-slate-400 mb-1 block">Initial Quantity</label><input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })} className="input-scada w-full" /></div>
                        <div><label className="text-xs text-slate-400 mb-1 block">Low Stock Alert At</label><input type="number" value={form.low_stock_threshold} onChange={e => setForm({ ...form, low_stock_threshold: parseFloat(e.target.value) || 0 })} className="input-scada w-full" /></div>
                    </div>
                    <div><label className="text-xs text-slate-400 mb-1 block">Supplier</label><input value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} className="input-scada w-full" placeholder="Optional" /></div>
                </div>
                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 text-sm font-medium transition-all">Cancel</button>
                    <button onClick={() => onCreate(form)} disabled={!form.name} className="flex-1 btn-primary text-sm disabled:opacity-50">Add Item</button>
                </div>
            </div>
        </div>
    );
};

export default Antennary;
