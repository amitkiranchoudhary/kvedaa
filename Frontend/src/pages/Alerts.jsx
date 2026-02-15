import { useState, useEffect } from 'react';
import { alertAPI } from '../services/api';

const METRICS = ['temperature_c', 'co2_ppm', 'humidity_pct', 'kwh', 'voltage', 'amperage', 'water_flow_lpm', 'gas_flow_m3h', 'power_w'];
const OPERATORS = [
    { value: 'gt', label: '> Greater than' },
    { value: 'lt', label: '< Less than' },
    { value: 'eq', label: '= Equal to' },
    { value: 'gte', label: '>= Greater or equal' },
    { value: 'lte', label: '<= Less or equal' },
];

export default function Alerts() {
    const [rules, setRules] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [tab, setTab] = useState('alerts'); // 'alerts' | 'rules'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: '', metric: 'temperature_c', operator: 'gt', threshold: '', severity: 'WARNING', action: 'LOG'
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [rulesRes, alertsRes] = await Promise.all([alertAPI.getRules(), alertAPI.getAlerts(50)]);
            setRules(rulesRes.data.rules || []);
            setAlerts(alertsRes.data.alerts || []);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreateRule = async (e) => {
        e.preventDefault();
        try {
            await alertAPI.createRule({ ...form, threshold: parseFloat(form.threshold) });
            setSuccess('Alert rule created!');
            setShowForm(false);
            setForm({ name: '', metric: 'temperature_c', operator: 'gt', threshold: '', severity: 'WARNING', action: 'LOG' });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create rule');
        }
    };

    const handleDeleteRule = async (id) => {
        if (!confirm('Delete this rule?')) return;
        try {
            await alertAPI.deleteRule(id);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.detail || 'Delete failed');
        }
    };

    const handleAcknowledge = async (id) => {
        try {
            await alertAPI.acknowledge(id);
            setSuccess('Alert acknowledged');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.detail || 'Acknowledge failed');
        }
    };

    const severityBadge = (sev) => {
        const cls = sev === 'CRITICAL' ? 'badge-critical' : sev === 'WARNING' ? 'badge-warning' : 'badge-info';
        return <span className={`text-xs px-2 py-0.5 rounded font-medium ${cls}`}>{sev}</span>;
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-scada-text">Alerts</h1>
                <div className="flex gap-2">
                    <button onClick={() => setTab('alerts')}
                        className={`px-3 py-1 rounded text-sm ${tab === 'alerts' ? 'bg-scada-accent text-white' : 'bg-scada-card text-scada-muted border border-scada-border'}`}>
                        Triggered ({alerts.length})
                    </button>
                    <button onClick={() => setTab('rules')}
                        className={`px-3 py-1 rounded text-sm ${tab === 'rules' ? 'bg-scada-accent text-white' : 'bg-scada-card text-scada-muted border border-scada-border'}`}>
                        Rules ({rules.length})
                    </button>
                </div>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded mb-4 text-sm">{error}
                <button onClick={() => setError('')} className="ml-2">✕</button></div>}
            {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2 rounded mb-4 text-sm">{success}
                <button onClick={() => setSuccess('')} className="ml-2">✕</button></div>}

            {/* RULES TAB */}
            {tab === 'rules' && (
                <>
                    <div className="mb-4">
                        <button onClick={() => setShowForm(!showForm)}
                            className="px-4 py-2 bg-scada-accent hover:bg-blue-600 text-white rounded text-sm font-medium">
                            {showForm ? 'Cancel' : '+ Create Rule'}
                        </button>
                    </div>

                    {showForm && (
                        <div className="bg-scada-panel border border-scada-border rounded-lg p-4 mb-6">
                            <h2 className="text-lg font-medium text-scada-text mb-3">New Alert Rule</h2>
                            <form onSubmit={handleCreateRule} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input placeholder="Rule Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="px-3 py-2 bg-scada-dark border border-scada-border rounded text-scada-text" required />
                                <select value={form.metric} onChange={(e) => setForm({ ...form, metric: e.target.value })}
                                    className="px-3 py-2 bg-scada-dark border border-scada-border rounded text-scada-text">
                                    {METRICS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <select value={form.operator} onChange={(e) => setForm({ ...form, operator: e.target.value })}
                                    className="px-3 py-2 bg-scada-dark border border-scada-border rounded text-scada-text">
                                    {OPERATORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                                <input type="number" step="any" placeholder="Threshold" value={form.threshold}
                                    onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                                    className="px-3 py-2 bg-scada-dark border border-scada-border rounded text-scada-text" required />
                                <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}
                                    className="px-3 py-2 bg-scada-dark border border-scada-border rounded text-scada-text">
                                    <option value="INFO">INFO</option>
                                    <option value="WARNING">WARNING</option>
                                    <option value="CRITICAL">CRITICAL</option>
                                </select>
                                <select value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })}
                                    className="px-3 py-2 bg-scada-dark border border-scada-border rounded text-scada-text">
                                    <option value="LOG">LOG</option>
                                    <option value="EMAIL">EMAIL</option>
                                    <option value="WEBHOOK">WEBHOOK</option>
                                </select>
                                <button type="submit" className="px-4 py-2 bg-scada-accent hover:bg-blue-600 text-white rounded font-medium">
                                    Create Rule
                                </button>
                            </form>
                        </div>
                    )}

                    {loading ? <p className="text-scada-muted">Loading...</p> : rules.length === 0 ? (
                        <p className="text-scada-muted">No alert rules defined yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {rules.map(r => (
                                <div key={r.id} className="bg-scada-panel border border-scada-border rounded-lg p-4 flex justify-between items-center">
                                    <div>
                                        <span className="text-scada-text font-medium">{r.name}</span>
                                        <span className="ml-3 text-sm text-scada-muted">
                                            If <code className="text-cyan-400">{r.metric}</code> {r.operator} <code className="text-yellow-400">{r.threshold}</code>
                                        </span>
                                        <span className="ml-3">{severityBadge(r.severity)}</span>
                                        <span className="ml-3 text-xs text-scada-muted">Action: {r.action}</span>
                                    </div>
                                    <button onClick={() => handleDeleteRule(r.id)}
                                        className="px-3 py-1 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-400">Delete</button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* ALERTS TAB */}
            {tab === 'alerts' && (
                loading ? <p className="text-scada-muted">Loading...</p> : alerts.length === 0 ? (
                    <p className="text-scada-muted">No triggered alerts. System is running normally.</p>
                ) : (
                    <div className="space-y-2">
                        {alerts.map(a => (
                            <div key={a.id} className="bg-scada-panel border border-scada-border rounded-lg p-4 flex justify-between items-start">
                                <div>
                                    {severityBadge(a.severity)}
                                    <span className="ml-2 text-sm text-scada-text">{a.message}</span>
                                    <div className="mt-1 text-xs text-scada-muted">
                                        Value: {a.value} | Threshold: {a.threshold} | {new Date(a.triggered_at).toLocaleString()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {a.acknowledged ? (
                                        <span className="text-xs text-green-400">✓ Acknowledged</span>
                                    ) : (
                                        <button onClick={() => handleAcknowledge(a.id)}
                                            className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm text-yellow-400 hover:bg-yellow-500/20">
                                            Acknowledge
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
