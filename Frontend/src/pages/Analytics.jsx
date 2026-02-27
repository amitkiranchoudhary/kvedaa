import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { BarChart2, Calendar, TreePine, Leaf, Droplets, Thermometer, Wind, Zap } from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="border border-forest-border/30 p-3.5 rounded-xl"
                style={{
                    background: 'linear-gradient(135deg, rgba(15, 33, 15, 0.97), rgba(10, 23, 10, 0.99))',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(12px)',
                }}>
                <p className="text-forest-muted/70 text-xs mb-1 uppercase tracking-wider font-medium">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} className="text-forest-cream text-sm font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                        {p.value} <span className="text-xs text-forest-muted/50 font-normal">{p.unit || ''}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function Analytics() {
    const [tab, setTab] = useState('energy');
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });
    const [energyData, setEnergyData] = useState([]);
    const [comfortData, setComfortData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, [dateRange]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [eRes, cRes] = await Promise.allSettled([
                analyticsAPI.getEnergy(dateRange.start, dateRange.end),
                analyticsAPI.getComfort(dateRange.start, dateRange.end),
            ]);
            if (eRes.status === 'fulfilled') {
                const data = eRes.value.data;
                setEnergyData(Array.isArray(data) ? data : (data?.energy || []));
            }
            if (cRes.status === 'fulfilled') {
                const data = cRes.value.data;
                setComfortData(Array.isArray(data) ? data : (data?.comfort || []));
            }
        } catch { } finally { setLoading(false); }
    };

    const tabs = [
        { key: 'energy', label: 'Energy', icon: Zap, color: 'text-forest-gold', activeColor: 'text-forest-gold', borderColor: 'border-forest-gold' },
        { key: 'temperature', label: 'Temperature', icon: Thermometer, color: 'text-rose-400', activeColor: 'text-rose-400', borderColor: 'border-rose-400' },
        { key: 'humidity', label: 'Humidity', icon: Droplets, color: 'text-blue-400', activeColor: 'text-blue-400', borderColor: 'border-blue-400' },
        { key: 'co2', label: 'CO₂', icon: Wind, color: 'text-forest-spring', activeColor: 'text-forest-spring', borderColor: 'border-forest-spring' },
    ];

    const activeTab = tabs.find(t => t.key === tab);

    if (loading && !energyData.length && !comfortData.length) return (
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
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-forest-cream font-display flex items-center gap-3">
                        <BarChart2 className="w-7 h-7 text-forest-spring" />
                        Analytics
                    </h1>
                    <p className="text-sm text-forest-muted mt-1.5">Energy consumption and environmental data trends</p>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-forest-muted" />
                    <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="input-scada text-xs py-1.5" />
                    <span className="text-forest-muted/30">→</span>
                    <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="input-scada text-xs py-1.5" />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-forest-border/20 pb-1">
                {tabs.map(t => {
                    const Icon = t.icon;
                    return (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-all ${tab === t.key
                                ? `${t.activeColor} ${t.borderColor}`
                                : 'text-forest-muted border-transparent hover:text-forest-cream'}`}>
                            <Icon className="w-4 h-4" /> {t.label}
                        </button>
                    );
                })}
            </div>

            {/* Chart */}
            <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="p-6 pb-2 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-forest-muted uppercase tracking-wider flex items-center gap-2">
                        {activeTab && <activeTab.icon className={`w-4 h-4 ${activeTab.color}`} />}
                        {tab === 'energy' ? 'Energy Consumption' : `${activeTab?.label || ''} Trends`}
                    </h3>
                    {loading && <div className="w-4 h-4 border-2 border-forest-spring/30 border-t-forest-spring rounded-full animate-spin" />}
                </div>

                <div className="h-[420px] w-full px-4 pb-6">
                    <ResponsiveContainer width="100%" height="100%">
                        {tab === 'energy' ? (
                            <BarChart data={energyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#e6b422" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#e6b422" stopOpacity={0.15} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#254025" vertical={false} opacity={0.3} />
                                <XAxis dataKey="date" stroke="#7aaf7a" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#7aaf7a" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(74, 222, 128, 0.04)' }} />
                                <Bar dataKey="value" fill="url(#energyGrad)" radius={[6, 6, 0, 0]} unit=" kWh" />
                            </BarChart>
                        ) : (
                            <AreaChart data={comfortData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="comfortGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={tab === 'temperature' ? '#ef4444' : tab === 'humidity' ? '#60a5fa' : '#52b788'} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={tab === 'temperature' ? '#ef4444' : tab === 'humidity' ? '#60a5fa' : '#52b788'} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#254025" vertical={false} opacity={0.3} />
                                <XAxis dataKey="date" stroke="#7aaf7a" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#7aaf7a" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#254025', strokeDasharray: '4 4' }} />
                                <Area type="monotone" dataKey="value"
                                    stroke={tab === 'temperature' ? '#ef4444' : tab === 'humidity' ? '#60a5fa' : '#52b788'}
                                    strokeWidth={2.5}
                                    fill="url(#comfortGrad)"
                                    activeDot={{ r: 5, strokeWidth: 0, fill: '#faf5eb' }} />
                            </AreaChart>
                        )}
                    </ResponsiveContainer>
                </div>

                {/* Empty state */}
                {((tab === 'energy' && energyData.length === 0) || (tab !== 'energy' && comfortData.length === 0)) && !loading && (
                    <div className="text-center py-12 -mt-[350px] relative z-10">
                        <span className="text-5xl block mb-3">📊</span>
                        <p className="text-forest-muted">No data available for the selected period.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
