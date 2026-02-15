import { useState } from 'react';
import { analyticsAPI } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Analytics() {
    const [tab, setTab] = useState('energy');
    const [startDate, setStartDate] = useState('2026-01-01');
    const [endDate, setEndDate] = useState('2026-12-31');
    const [energyData, setEnergyData] = useState(null);
    const [comfortData, setComfortData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchEnergy = async () => {
        try {
            setLoading(true); setError('');
            const res = await analyticsAPI.getEnergy(startDate, endDate);
            setEnergyData(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load energy data');
        } finally {
            setLoading(false);
        }
    };

    const fetchComfort = async () => {
        try {
            setLoading(true); setError('');
            const res = await analyticsAPI.getComfort(startDate, endDate);
            setComfortData(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load comfort data');
        } finally {
            setLoading(false);
        }
    };

    const handleFetch = () => {
        if (tab === 'energy') fetchEnergy();
        else fetchComfort();
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-scada-text mb-6">Analytics</h1>

            {/* Tab + Date Range */}
            <div className="bg-scada-panel border border-scada-border rounded-lg p-4 mb-6">
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex gap-2">
                        <button onClick={() => setTab('energy')}
                            className={`px-3 py-1 rounded text-sm ${tab === 'energy' ? 'bg-scada-accent text-white' : 'bg-scada-card text-scada-muted border border-scada-border'}`}>
                            Energy
                        </button>
                        <button onClick={() => setTab('comfort')}
                            className={`px-3 py-1 rounded text-sm ${tab === 'comfort' ? 'bg-scada-accent text-white' : 'bg-scada-card text-scada-muted border border-scada-border'}`}>
                            Comfort
                        </button>
                    </div>
                    <div>
                        <label className="text-xs text-scada-muted block mb-1">Start</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-1 bg-scada-dark border border-scada-border rounded text-scada-text text-sm" />
                    </div>
                    <div>
                        <label className="text-xs text-scada-muted block mb-1">End</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-1 bg-scada-dark border border-scada-border rounded text-scada-text text-sm" />
                    </div>
                    <button onClick={handleFetch}
                        className="px-4 py-1.5 bg-scada-accent hover:bg-blue-600 text-white rounded text-sm font-medium">
                        Load Data
                    </button>
                </div>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded mb-4 text-sm">{error}</div>}
            {loading && <p className="text-scada-muted">Loading analytics...</p>}

            {/* Energy Charts */}
            {tab === 'energy' && energyData && (
                <div className="space-y-6">
                    <div className="bg-scada-panel border border-scada-border rounded-lg p-4">
                        <h2 className="text-lg font-medium text-scada-text mb-4">Daily Energy Consumption (kWh)</h2>
                        {energyData.data.length === 0 ? (
                            <p className="text-scada-muted">No energy data for this period. Push some telemetry data first.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={energyData.data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                                    <YAxis stroke="#94a3b8" fontSize={12} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#f1f5f9' }} />
                                    <Bar dataKey="total_kwh" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {energyData.data.length > 0 && (
                        <div className="bg-scada-panel border border-scada-border rounded-lg p-4">
                            <h2 className="text-lg font-medium text-scada-text mb-4">Average Voltage & Amperage</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={energyData.data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                                    <YAxis stroke="#94a3b8" fontSize={12} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#f1f5f9' }} />
                                    <Line type="monotone" dataKey="avg_voltage" stroke="#eab308" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="avg_amperage" stroke="#22c55e" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            )}

            {/* Comfort Charts */}
            {tab === 'comfort' && comfortData && (
                <div className="space-y-6">
                    <div className="bg-scada-panel border border-scada-border rounded-lg p-4">
                        <h2 className="text-lg font-medium text-scada-text mb-4">Temperature & Humidity</h2>
                        {comfortData.data.length === 0 ? (
                            <p className="text-scada-muted">No comfort data for this period.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={comfortData.data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
                                    <YAxis stroke="#94a3b8" fontSize={12} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#f1f5f9' }} />
                                    <Line type="monotone" dataKey="avg_temperature" stroke="#ef4444" strokeWidth={2} name="Temp (°C)" />
                                    <Line type="monotone" dataKey="avg_humidity" stroke="#3b82f6" strokeWidth={2} name="Humidity (%)" />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {comfortData.data.length > 0 && (
                        <div className="bg-scada-panel border border-scada-border rounded-lg p-4">
                            <h2 className="text-lg font-medium text-scada-text mb-4">CO₂ Levels (ppm)</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={comfortData.data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
                                    <YAxis stroke="#94a3b8" fontSize={12} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#f1f5f9' }} />
                                    <Bar dataKey="avg_co2" fill="#eab308" radius={[4, 4, 0, 0]} name="CO₂ (ppm)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
