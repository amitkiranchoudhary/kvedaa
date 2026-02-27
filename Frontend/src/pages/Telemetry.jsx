import { useState, useEffect } from 'react';
import { deviceAPI, telemetryAPI } from '../services/api';
import { Activity, Radio, Send, TreePine, Leaf, Clock, ChevronRight } from 'lucide-react';

export default function Telemetry() {
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [telemetry, setTelemetry] = useState([]);
    const [latest, setLatest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pushForm, setPushForm] = useState({ device_id: '', api_key: '', metric: '', reading: '' });
    const [pushMsg, setPushMsg] = useState('');

    useEffect(() => { fetchDevices(); }, []);

    const fetchDevices = async () => {
        try {
            const res = await deviceAPI.getAll();
            const data = res.data;
            setDevices(Array.isArray(data) ? data : (data?.devices || []));
        } catch { } finally { setLoading(false); }
    };

    const selectDevice = async (device) => {
        setSelectedDevice(device);
        try {
            const [telRes, latRes] = await Promise.allSettled([
                telemetryAPI.getByDevice(device.device_id, 50),
                telemetryAPI.getLatest(device.device_id)
            ]);
            if (telRes.status === 'fulfilled') {
                const data = telRes.value.data;
                setTelemetry(Array.isArray(data) ? data : (data?.telemetry || []));
            }
            if (latRes.status === 'fulfilled') setLatest(latRes.value.data);
        } catch { }
    };

    const handlePush = async (e) => {
        e.preventDefault();
        setPushMsg('');
        try {
            await telemetryAPI.push({
                device_id: pushForm.device_id,
                readings: { [pushForm.metric]: parseFloat(pushForm.reading) }
            }, pushForm.api_key);
            setPushMsg('✅ Data pushed successfully!');
            if (selectedDevice?.device_id === pushForm.device_id) selectDevice(selectedDevice);
        } catch (err) {
            setPushMsg('❌ ' + (err.response?.data?.detail || 'Failed'));
        }
    };

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
            <div>
                <h1 className="text-3xl font-bold text-forest-cream font-display flex items-center gap-3">
                    <Activity className="w-7 h-7 text-forest-spring" />
                    Telemetry
                </h1>
                <p className="text-sm text-forest-muted mt-1.5">Real-time sensor data and readings from farm devices</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Device List */}
                <div className="lg:col-span-1">
                    <h2 className="text-sm font-bold text-forest-muted uppercase tracking-wider mb-3 px-1">Devices</h2>
                    <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
                        {devices.map(d => (
                            <button key={d.id} onClick={() => selectDevice(d)}
                                className={`w-full p-4 rounded-xl text-left transition-all duration-300 group flex items-center gap-3 ${selectedDevice?.id === d.id
                                    ? 'border text-forest-cream'
                                    : 'border border-transparent hover:bg-forest-card/25'
                                    }`}
                                style={selectedDevice?.id === d.id ? {
                                    background: 'linear-gradient(135deg, rgba(27, 67, 50, 0.3), rgba(45, 106, 79, 0.15))',
                                    borderColor: 'rgba(82, 183, 136, 0.2)',
                                    boxShadow: '0 0 20px rgba(74, 222, 128, 0.05)',
                                } : undefined}>
                                <div className={`p-2 rounded-lg ${d.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                    <Radio className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">{d.name}</p>
                                    <p className="text-[11px] text-forest-muted/50 font-mono truncate">{d.device_id}</p>
                                </div>
                                <ChevronRight className={`w-4 h-4 text-forest-muted/30 transition-all ${selectedDevice?.id === d.id ? 'text-forest-spring' : 'group-hover:text-forest-cream'}`} />
                            </button>
                        ))}
                        {devices.length === 0 && (
                            <div className="text-center py-10">
                                <span className="text-4xl block mb-2">📡</span>
                                <p className="text-sm text-forest-muted">No devices registered.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Telemetry Data */}
                <div className="lg:col-span-2 space-y-6">
                    {selectedDevice ? (
                        <>
                            {/* Latest Reading */}
                            {latest && (
                                <div className="glass-panel rounded-2xl p-6">
                                    <h3 className="text-sm font-bold text-forest-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Leaf className="w-4 h-4 text-forest-spring" /> Latest Reading
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {latest.readings && Object.entries(latest.readings).map(([key, value]) => (
                                            <div key={key} className="p-4 rounded-xl border border-forest-border/15"
                                                style={{ background: 'linear-gradient(135deg, rgba(26, 58, 26, 0.25), rgba(19, 42, 19, 0.15))' }}>
                                                <p className="text-xs text-forest-muted uppercase tracking-wider mb-1">{key}</p>
                                                <p className="text-2xl font-bold text-forest-cream">{typeof value === 'number' ? value.toFixed(2) : value}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {latest.timestamp && (
                                        <p className="flex items-center gap-1.5 text-[11px] text-forest-muted/40 mt-4">
                                            <Clock className="w-3 h-3" /> {new Date(latest.timestamp).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* History Table */}
                            <div className="glass-panel rounded-2xl overflow-hidden">
                                <div className="p-6 pb-3">
                                    <h3 className="text-sm font-bold text-forest-muted uppercase tracking-wider flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-forest-spring" /> Historical Data
                                    </h3>
                                </div>
                                <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-forest-border/15">
                                                <th className="text-left text-xs text-forest-muted uppercase tracking-wider px-6 py-3 font-semibold sticky top-0"
                                                    style={{ background: 'rgba(19, 42, 19, 0.9)' }}>Timestamp</th>
                                                <th className="text-left text-xs text-forest-muted uppercase tracking-wider px-6 py-3 font-semibold sticky top-0"
                                                    style={{ background: 'rgba(19, 42, 19, 0.9)' }}>Readings</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {telemetry.map((t, i) => (
                                                <tr key={i} className="border-b border-forest-border/8 hover:bg-forest-card/15 transition-colors">
                                                    <td className="px-6 py-3 text-xs text-forest-muted whitespace-nowrap">{new Date(t.timestamp).toLocaleString()}</td>
                                                    <td className="px-6 py-3">
                                                        <div className="flex flex-wrap gap-2">
                                                            {t.readings && Object.entries(t.readings).map(([k, v]) => (
                                                                <span key={k} className="px-2.5 py-1 rounded-lg text-xs font-medium border"
                                                                    style={{
                                                                        background: 'linear-gradient(135deg, rgba(82, 183, 136, 0.06), rgba(45, 106, 79, 0.04))',
                                                                        borderColor: 'rgba(82, 183, 136, 0.1)',
                                                                        color: '#95d5b2',
                                                                    }}>
                                                                    {k}: {typeof v === 'number' ? v.toFixed(2) : v}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {telemetry.length === 0 && (
                                        <div className="text-center py-10 px-6">
                                            <p className="text-sm text-forest-muted">No readings yet for this device.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="glass-panel rounded-2xl p-16 text-center">
                            <span className="text-6xl block mb-4">📊</span>
                            <h3 className="text-xl font-semibold text-forest-cream font-display mb-2">Select a Device</h3>
                            <p className="text-forest-muted text-sm">Choose a device from the list to view its telemetry data.</p>
                        </div>
                    )}

                    {/* Manual Push */}
                    <div className="glass-panel rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-forest-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Send className="w-4 h-4 text-forest-gold" /> Push Test Data
                        </h3>
                        <form onSubmit={handlePush} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <input placeholder="Device ID" value={pushForm.device_id} onChange={(e) => setPushForm({ ...pushForm, device_id: e.target.value })} className="input-scada" required />
                            <input placeholder="API Key" value={pushForm.api_key} onChange={(e) => setPushForm({ ...pushForm, api_key: e.target.value })} className="input-scada" required />
                            <input placeholder="Metric" value={pushForm.metric} onChange={(e) => setPushForm({ ...pushForm, metric: e.target.value })} className="input-scada" required />
                            <div className="flex gap-2">
                                <input placeholder="Reading" type="number" step="0.01" value={pushForm.reading} onChange={(e) => setPushForm({ ...pushForm, reading: e.target.value })} className="input-scada flex-1" required />
                                <button type="submit" className="btn-primary px-4"><Send className="w-4 h-4" /></button>
                            </div>
                        </form>
                        {pushMsg && <p className="text-sm mt-3">{pushMsg}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
