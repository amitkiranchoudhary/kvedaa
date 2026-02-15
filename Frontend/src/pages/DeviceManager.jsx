import { useState, useEffect } from 'react';
import api from '../services/api';
import DeviceCard from '../components/DeviceCard';
import { Plus, Search, Filter, X } from 'lucide-react';

const DeviceManager = () => {
    const [devices, setDevices] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        device_id: '',
        name: '',
        type: 'ENERGY_METER',
        building_id: '',
        location: ''
    });

    const fetchData = async () => {
        try {
            const [devicesRes, buildingsRes] = await Promise.all([
                api.get('/devices/'),
                api.get('/buildings/')
            ]);
            setDevices(devicesRes.data.devices);
            setBuildings(buildingsRes.data.buildings);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRegenerateKey = async (deviceId) => {
        if (!window.confirm("Are you sure? The old key will stop working immediately.")) return;
        try {
            await api.post(`/devices/${deviceId}/regenerate_key`);
            fetchData(); // Refresh list to get new key
            alert("API Key regenerated successfully!");
        } catch (error) {
            alert("Failed to regenerate key: " + error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/devices/', formData);
            setShowForm(false);
            setFormData({ device_id: '', name: '', type: 'ENERGY_METER', building_id: '', location: '' });
            fetchData();
        } catch (error) {
            alert('Failed to register device: ' + error.response?.data?.detail || error.message);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-scada-accent"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Device Management</h1>
                    <p className="text-slate-400 mt-1 font-light">Manage hardware provisioning and API keys</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 btn-primary hover:shadow-blue-500/40 transition-shadow"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-semibold tracking-wide">Register Device</span>
                </button>
            </div>

            {/* Registration Form (Collapsible) */}
            {showForm && (
                <div className="glass-panel rounded-2xl p-8 animate-in fade-in slide-in-from-top-4 border-l-4 border-l-scada-accent">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-xl font-bold text-white tracking-tight">Register New Hardware</h2>
                        <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Device ID (MAC/Serial)</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. AA:BB:CC:DD:EE:FF"
                                className="input-scada w-full"
                                value={formData.device_id}
                                onChange={e => setFormData({ ...formData, device_id: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Friendly Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Main Lobby Sensor"
                                className="input-scada w-full"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Type</label>
                            <select
                                className="input-scada w-full appearance-none"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="ENERGY_METER">Energy Meter</option>
                                <option value="THERMOSTAT">Thermostat</option>
                                <option value="ENV_SENSOR">Environmental Sensor</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Building</label>
                            <select
                                required
                                className="input-scada w-full appearance-none"
                                value={formData.building_id}
                                onChange={e => setFormData({ ...formData, building_id: e.target.value })}
                            >
                                <option value="">Select Building...</option>
                                {buildings.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Location Detail</label>
                            <input
                                type="text"
                                placeholder="e.g. Floor 2 Server Room"
                                className="input-scada w-full"
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-white/5">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-5 py-2.5 text-slate-400 hover:text-white transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                            >
                                Register Device
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters (Mock UI) */}
            <div className="flex gap-3 mb-6">
                <div className="relative flex-1 max-w-sm group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-scada-accent transition-colors" />
                    <input
                        type="text"
                        placeholder="Search devices..."
                        className="input-scada w-full pl-10 bg-scada-card/30 hover:bg-scada-card/50"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 glass-card hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-colors border border-white/5">
                    <Filter className="w-4 h-4" />
                    <span className="font-medium text-sm">Filter</span>
                </button>
            </div>

            {/* Device Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {devices.map(device => (
                    <DeviceCard
                        key={device.id}
                        device={device}
                        onRegenerateKey={handleRegenerateKey}
                    />
                ))}
                {devices.length === 0 && (
                    <div className="col-span-full py-16 text-center text-slate-500 bg-white/5 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center">
                        <Search className="w-12 h-12 mb-4 opacity-50" />
                        <p className="text-lg font-medium text-slate-400">No devices found</p>
                        <p className="text-sm mt-1">Register your first device to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeviceManager;
