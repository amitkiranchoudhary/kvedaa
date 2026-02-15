import { useState, useEffect } from 'react';
import api from '../services/api';
import LiveChart from '../components/LiveChart';
import DeviceCard from '../components/DeviceCard';
import { Activity, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [devices, setDevices] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [energyData, setEnergyData] = useState([]);
    const [comfortData, setComfortData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Poll for data every 5 seconds (simulated WebSocket)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashboardRes, devicesRes, alertsRes, energyRes, comfortRes] = await Promise.all([
                    api.get('/analytics/dashboard'),
                    api.get('/devices/'),
                    api.get('/alerts/?limit=5'),
                    api.get('/analytics/energy?limit=20'),
                    api.get('/analytics/comfort?limit=20')
                ]);

                setStats(dashboardRes.data);
                setDevices(devicesRes.data.devices || []);
                setAlerts(alertsRes.data.alerts || []);

                setEnergyData(energyRes.data.data?.map(d => ({ timestamp: d.date, value: d.kwh })) || []);
                setComfortData(comfortRes.data.data?.map(d => ({ timestamp: d.date, value: d.temperature })) || []);

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000); // 5s polling
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-scada-accent"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Buildings"
                    value={stats?.total_buildings || 0}
                    icon={Activity}
                    color="text-blue-400 bg-blue-500/10 border-blue-500/20"
                />
                <StatCard
                    title="Active Devices"
                    value={`${stats?.online_devices || 0} / ${stats?.total_devices || 0}`}
                    icon={Zap}
                    color="text-amber-400 bg-amber-500/10 border-amber-500/20"
                />
                <StatCard
                    title="Critical Alerts"
                    value={stats?.total_alerts || 0}
                    icon={AlertTriangle}
                    color="text-rose-400 bg-rose-500/10 border-rose-500/20"
                />
                <StatCard
                    title="System Status"
                    value="OPERATIONAL"
                    icon={CheckCircle}
                    color="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                />
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-panel p-1 rounded-2xl">
                    <LiveChart data={energyData} metric="Energy Consumption (kWh)" color="#F59E0B" unit="kWh" />
                </div>
                <div className="glass-panel p-1 rounded-2xl">
                    <LiveChart data={comfortData} metric="Avg. Temperature (°C)" color="#EF4444" unit="°C" />
                </div>
            </div>

            {/* Device Overview & Recent Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Device Status Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold text-white tracking-tight">Live Device Status</h2>
                        <button className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider">View All Devices →</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {devices.slice(0, 4).map(device => (
                            <DeviceCard key={device.id} device={device} />
                        ))}
                    </div>
                </div>

                {/* Recent Alerts Feed */}
                <div className="glass-panel rounded-2xl p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white tracking-tight">Recent Alerts</h2>
                        <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></div>
                    </div>

                    <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 max-h-[400px]">
                        {alerts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-8 opacity-50">
                                <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                                <p className="text-sm text-scada-muted">All systems nominal</p>
                            </div>
                        ) : (
                            alerts.map(alert => (
                                <div key={alert.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group relative overflow-hidden">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${alert.severity === 'CRITICAL' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                    <div className="flex items-start gap-3 pl-2">
                                        <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${alert.severity === 'CRITICAL' ? 'text-rose-500' : 'text-amber-500'
                                            }`} />
                                        <div>
                                            <p className="text-sm font-semibold text-white group-hover:text-blue-200 transition-colors">{alert.rule_name}</p>
                                            <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-wide font-medium">{new Date(alert.timestamp).toLocaleString()}</p>
                                            <p className="text-xs text-slate-300 mt-2 leading-relaxed opacity-90">{alert.message}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="glass-card p-5 rounded-2xl flex items-center justify-between group">
        <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1 group-hover:text-white transition-colors">{title}</p>
            <h3 className="text-3xl font-bold text-white tracking-tight group-hover:scale-105 transition-transform origin-left">{value}</h3>
        </div>
        <div className={`p-3.5 rounded-xl border ${color} shadow-lg shadow-black/20 group-hover:shadow-black/40 transition-shadow`}>
            <Icon className="w-6 h-6" />
        </div>
    </div>
);

export default Dashboard;
