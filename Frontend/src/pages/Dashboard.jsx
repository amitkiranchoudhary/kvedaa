import { useState, useEffect } from 'react';
import { TreePine, Leaf, Activity, Thermometer, Droplets, Bell, Radio, Building, Zap, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';
import api from '../services/api';
import LiveChart from '../components/LiveChart';
import DeviceCard from '../components/DeviceCard';

const StatCard = ({ title, value, icon: Icon, trend, color, glowColor }) => (
    <div className="glass-card p-6 rounded-2xl group relative overflow-hidden">
        {/* Hover glow */}
        <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-3xl pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity duration-500"
            style={{ background: glowColor || 'rgba(74, 222, 128, 0.15)' }} />

        <div className="flex items-center justify-between relative z-10">
            <div>
                <p className="text-xs text-forest-muted font-semibold uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-forest-cream">{value}</h3>
                {trend && (
                    <p className={`text-xs mt-1.5 flex items-center gap-1 ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
                        {Math.abs(trend)}% from last week
                    </p>
                )}
            </div>
            <div className="p-3.5 rounded-xl border transition-all duration-300 group-hover:scale-110"
                style={{
                    background: `${color}12`,
                    borderColor: `${color}20`,
                }}>
                <Icon className="w-6 h-6" style={{ color }} />
            </div>
        </div>
    </div>
);

export default function Dashboard() {
    const [stats, setStats] = useState({});
    const [devices, setDevices] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [energyData, setEnergyData] = useState([]);
    const [comfortData, setComfortData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [dashRes, devRes, alertRes] = await Promise.allSettled([
                api.get('/api/analytics/dashboard'),
                api.get('/api/devices/'),
                api.get('/api/alerts/?limit=5'),
            ]);
            if (dashRes.status === 'fulfilled') {
                const d = dashRes.value.data;
                setStats(d);
                setEnergyData(d.energy_trend || []);
                setComfortData(d.comfort_trend || []);
            }
            if (devRes.status === 'fulfilled') {
                const devData = devRes.value.data;
                const devArr = Array.isArray(devData) ? devData : (devData?.devices || []);
                setDevices(devArr.slice(0, 4));
            }
            if (alertRes.status === 'fulfilled') {
                const alertData = alertRes.value.data;
                setAlerts(Array.isArray(alertData) ? alertData : (alertData?.alerts || []));
            }
        } catch { } finally { setLoading(false); }
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-forest-cream tracking-tight font-display flex items-center gap-3">
                        <Leaf className="w-7 h-7 text-forest-spring" />
                        Dashboard
                    </h1>
                    <p className="text-sm text-forest-muted mt-1.5">Your farm's vital signs and environmental overview</p>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-emerald-500/15"
                    style={{ background: 'linear-gradient(135deg, rgba(82, 183, 136, 0.08), rgba(74, 222, 128, 0.04))' }}>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-live-pulse"
                        style={{ boxShadow: '0 0 8px rgba(74, 222, 128, 0.6)' }} />
                    <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider">Live</span>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Devices" value={stats.total_devices || 0} icon={Radio} color="#52b788" glowColor="rgba(82, 183, 136, 0.15)" trend={8} />
                <StatCard title="Active Buildings" value={stats.total_buildings || 0} icon={Building} color="#40916c" glowColor="rgba(64, 145, 108, 0.15)" />
                <StatCard title="Energy (kWh)" value={stats.energy_today || '—'} icon={Zap} color="#e6b422" glowColor="rgba(230, 180, 34, 0.15)" trend={-3} />
                <StatCard title="Active Alerts" value={stats.active_alerts || 0} icon={Bell} color="#ef4444" glowColor="rgba(239, 68, 68, 0.12)" />
            </div>

            {/* Antigravity Intelligence Widget */}
            <div className="glass-panel p-8 rounded-[2.5rem] border border-forest-spring/20 relative overflow-hidden bg-gradient-to-br from-forest-spring/5 to-transparent">
                <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12">
                    <Zap className="w-32 h-32 text-forest-spring" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-20 h-20 rounded-3xl bg-forest-spring/15 border border-forest-spring/20 flex items-center justify-center flex-shrink-0 animate-float shadow-[0_0_30px_rgba(74,222,128,0.2)]">
                        <Sparkles className="w-10 h-10 text-forest-spring" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl font-bold text-forest-cream font-display mb-2">Antigravity Intelligence</h2>
                        <p className="text-sm text-forest-muted max-w-2xl">
                            Ecosystem is performing at <span className="text-forest-spring font-bold">Optimal Capacity</span>. All sensor matrices are synchronized.
                            Predicted harvest yield for <span className="text-forest-gold">Batch CM-2026-04</span> has increased by <span className="text-forest-spring font-bold">4.2%</span> due to optimized light cycles.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-6 py-2.5 rounded-xl bg-forest-spring text-forest-darkest font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(74,222,128,0.2)]">
                            View Analysis
                        </button>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel rounded-2xl overflow-hidden">
                    <LiveChart data={energyData} metric="Energy Consumption" color="#52b788" unit="kWh" />
                </div>
                <div className="glass-panel rounded-2xl overflow-hidden">
                    <LiveChart data={comfortData} metric="Comfort Index" color="#e6b422" unit="%" />
                </div>
            </div>

            {/* Bottom: Devices + Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Devices */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-forest-cream font-display flex items-center gap-2">
                            <Radio className="w-5 h-5 text-forest-spring" /> Connected Devices
                        </h2>
                        <span className="text-xs text-forest-muted bg-forest-card/30 px-3 py-1 rounded-full border border-forest-border/15">{devices.length} devices</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {devices.map(d => <DeviceCard key={d.id} device={d} />)}
                        {devices.length === 0 && (
                            <div className="glass-card rounded-2xl p-10 text-center col-span-2">
                                <span className="text-5xl block mb-3">📡</span>
                                <p className="text-forest-muted">No devices connected yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Alerts Feed */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-forest-cream font-display flex items-center gap-2">
                            <Bell className="w-5 h-5 text-amber-400" /> Recent Alerts
                        </h2>
                    </div>
                    <div className="glass-panel rounded-2xl p-5 space-y-3 max-h-[450px] overflow-y-auto">
                        {alerts.length === 0 ? (
                            <div className="text-center py-8">
                                <span className="text-4xl block mb-2">🌿</span>
                                <p className="text-sm text-forest-muted">All clear. The forest is at peace.</p>
                            </div>
                        ) : (
                            alerts.map((a, i) => {
                                const sevColors = {
                                    CRITICAL: { bg: 'bg-red-500/8', border: 'border-red-500/15', text: 'text-red-400', icon: '🔴' },
                                    HIGH: { bg: 'bg-amber-500/8', border: 'border-amber-500/15', text: 'text-amber-400', icon: '🟡' },
                                    MEDIUM: { bg: 'bg-forest-gold/8', border: 'border-forest-gold/15', text: 'text-forest-gold', icon: '🟠' },
                                    LOW: { bg: 'bg-forest-spring/8', border: 'border-forest-spring/15', text: 'text-forest-spring', icon: '🟢' },
                                };
                                const s = sevColors[a.severity] || sevColors.MEDIUM;
                                return (
                                    <div key={i} className={`p-4 rounded-xl ${s.bg} border ${s.border} transition-all hover:scale-[1.01]`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs">{s.icon}</span>
                                            <span className={`text-xs font-bold uppercase tracking-wider ${s.text}`}>{a.severity}</span>
                                        </div>
                                        <p className="text-sm text-forest-cream">{a.message}</p>
                                        <p className="text-[11px] text-forest-muted/50 mt-1">{new Date(a.triggered_at).toLocaleString()}</p>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
