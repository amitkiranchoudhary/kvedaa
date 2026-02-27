import { useState, useEffect } from 'react';
import { deviceAPI, buildingAPI } from '../services/api';
import DeviceCard from '../components/DeviceCard';
import { Plus, Search, Radio, X, Sliders, TreePine, Leaf } from 'lucide-react';

export default function DeviceManager() {
    const [devices, setDevices] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [error, setError] = useState('');
    const [form, setForm] = useState({ device_id: '', name: '', type: 'sensor', building_id: '' });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [devRes, bRes] = await Promise.allSettled([deviceAPI.getAll(), buildingAPI.getAll()]);
            if (devRes.status === 'fulfilled') {
                const devData = devRes.value.data;
                setDevices(Array.isArray(devData) ? devData : (devData?.devices || []));
            }
            if (bRes.status === 'fulfilled') {
                const bData = bRes.value.data;
                setBuildings(Array.isArray(bData) ? bData : (bData?.buildings || []));
            }
        } catch { } finally { setLoading(false); }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await deviceAPI.register({
                ...form,
                building_id: form.building_id || undefined
            });
            setShowForm(false);
            setForm({ device_id: '', name: '', type: 'sensor', building_id: '' });
            fetchData();
        } catch (err) { setError(err.response?.data?.detail || 'Failed'); }
    };

    const handleRegenKey = async (id) => {
        try { await deviceAPI.regenerateKey(id); fetchData(); }
        catch (err) { setError(err.response?.data?.detail || 'Failed'); }
    };

    const filtered = devices.filter(d => {
        const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.device_id.toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === 'ALL' || d.type === filterType;
        return matchSearch && matchType;
    });

    const types = ['ALL', ...new Set(devices.map(d => d.type))];

    if (loading) return (
        <div className="flex items-center justify-center h-[50vh]">
            <div className="relative">
                <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-forest-spring"></div>
                <TreePine className="w-6 h-6 text-forest-spring absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-forest-cream font-display flex items-center gap-3">
                        <Radio className="w-7 h-7 text-forest-spring" />
                        Device Manager
                    </h1>
                    <p className="text-sm text-forest-muted mt-1.5">Register and monitor IoT devices across the farm</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4" /> Register Device
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-muted/50" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)}
                        className="input-scada w-full pl-11"
                        placeholder="Search devices..." />
                </div>
                <div className="flex items-center gap-1.5 p-0.5 rounded-xl border border-forest-border/20"
                    style={{ background: 'rgba(5, 13, 5, 0.4)' }}>
                    {types.map(t => (
                        <button key={t} onClick={() => setFilterType(t)}
                            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${filterType === t
                                ? 'text-emerald-300'
                                : 'text-forest-muted hover:text-forest-cream'
                                }`}
                            style={filterType === t ? {
                                background: 'linear-gradient(135deg, rgba(27, 67, 50, 0.4), rgba(45, 106, 79, 0.2))',
                            } : undefined}>
                            {t === 'ALL' ? 'All' : t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Device Grid */}
            {filtered.length === 0 ? (
                <div className="glass-panel rounded-2xl p-16 text-center">
                    <span className="text-6xl block mb-4">📡</span>
                    <h3 className="text-xl font-semibold text-forest-cream font-display mb-2">No Devices Found</h3>
                    <p className="text-forest-muted text-sm">{search ? 'No devices match your search.' : 'Register your first device to get started.'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filtered.map(d => <DeviceCard key={d.id} device={d} onRegenerateKey={handleRegenKey} />)}
                </div>
            )}

            {/* Register Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-darkest/85 backdrop-blur-md" onClick={() => setShowForm(false)}>
                    <div className="rounded-3xl p-8 max-w-lg w-full border border-forest-border/25 page-enter"
                        style={{
                            background: 'linear-gradient(135deg, rgba(19, 42, 19, 0.97), rgba(10, 23, 10, 0.99))',
                            boxShadow: '0 30px 100px rgba(0,0,0,0.6), 0 0 60px rgba(74, 222, 128, 0.04)',
                        }}
                        onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-forest-cream font-display flex items-center gap-2">
                                <Leaf className="w-5 h-5 text-forest-spring" /> Register Device
                            </h2>
                            <button onClick={() => setShowForm(false)} className="text-forest-muted hover:text-forest-cream p-1"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label className="block text-xs text-forest-muted uppercase tracking-wider mb-1.5 font-medium">Device ID</label>
                                <input value={form.device_id} onChange={(e) => setForm({ ...form, device_id: e.target.value })} className="input-scada w-full" required placeholder="e.g. TEMP-001" />
                            </div>
                            <div>
                                <label className="block text-xs text-forest-muted uppercase tracking-wider mb-1.5 font-medium">Name</label>
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-scada w-full" required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-forest-muted uppercase tracking-wider mb-1.5 font-medium">Type</label>
                                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-scada w-full">
                                        <option value="sensor">Sensor</option>
                                        <option value="actuator">Actuator</option>
                                        <option value="controller">Controller</option>
                                        <option value="gateway">Gateway</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-forest-muted uppercase tracking-wider mb-1.5 font-medium">Building</label>
                                    <select value={form.building_id} onChange={(e) => setForm({ ...form, building_id: e.target.value })} className="input-scada w-full">
                                        <option value="">— None —</option>
                                        {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                                <TreePine className="w-4 h-4" /> Register Device
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
