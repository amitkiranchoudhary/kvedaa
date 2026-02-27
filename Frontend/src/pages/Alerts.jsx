import { useState, useEffect } from 'react';
import { alertAPI } from '../services/api';
import { Bell, Plus, Trash2, X, AlertTriangle, CheckCircle, ToggleLeft, ToggleRight, TreePine, Leaf, Shield } from 'lucide-react';

export default function Alerts() {
    const [rules, setRules] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [error, setError] = useState('');
    const [tab, setTab] = useState('rules');
    const [form, setForm] = useState({ name: '', metric: '', operator: '>', threshold: '', severity: 'MEDIUM' });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [rRes, aRes] = await Promise.allSettled([
                alertAPI.getRules(),
                alertAPI.getAlerts(50),
            ]);
            if (rRes.status === 'fulfilled') {
                const data = rRes.value.data;
                setRules(Array.isArray(data) ? data : (data?.rules || []));
            }
            if (aRes.status === 'fulfilled') {
                const data = aRes.value.data;
                setAlerts(Array.isArray(data) ? data : (data?.alerts || []));
            }
        } catch { } finally { setLoading(false); }
    };

    const handleCreateRule = async (e) => {
        e.preventDefault();
        try {
            await alertAPI.createRule({ ...form, threshold: parseFloat(form.threshold) });
            setShowCreate(false);
            setForm({ name: '', metric: '', operator: '>', threshold: '', severity: 'MEDIUM' });
            fetchData();
        } catch (err) { setError(err.response?.data?.detail || 'Failed'); }
    };

    const handleDeleteRule = async (id) => {
        if (!confirm('Delete this rule?')) return;
        try { await alertAPI.deleteRule(id); fetchData(); }
        catch (err) { setError(err.response?.data?.detail || 'Failed'); }
    };

    const handleToggle = async (rule) => {
        try {
            await alertAPI.updateRule(rule.id, { ...rule, enabled: !rule.enabled });
            fetchData();
        } catch (err) { setError(err.response?.data?.detail || 'Failed'); }
    };

    const handleAck = async (id) => {
        try { await alertAPI.acknowledge(id); fetchData(); }
        catch (err) { setError(err.response?.data?.detail || 'Failed'); }
    };

    const sevColors = {
        CRITICAL: { bg: 'bg-red-500/8', border: 'border-red-500/15', text: 'text-red-400', icon: '🔴', glow: 'rgba(239, 68, 68, 0.05)' },
        HIGH: { bg: 'bg-amber-500/8', border: 'border-amber-500/15', text: 'text-amber-400', icon: '🟡', glow: 'rgba(245, 158, 11, 0.05)' },
        MEDIUM: { bg: 'bg-forest-gold/8', border: 'border-forest-gold/15', text: 'text-forest-gold', icon: '🟠', glow: 'rgba(230, 180, 34, 0.05)' },
        LOW: { bg: 'bg-forest-spring/8', border: 'border-forest-spring/15', text: 'text-forest-spring', icon: '🟢', glow: 'rgba(82, 183, 136, 0.05)' },
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
                    <h1 className="text-3xl font-bold text-forest-cream font-display flex items-center gap-3">
                        <Bell className="w-7 h-7 text-amber-400" />
                        Alerts
                    </h1>
                    <p className="text-sm text-forest-muted mt-1.5">Configure alert rules and monitor triggered alerts</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4" /> New Rule
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-forest-border/20 pb-1">
                <button onClick={() => setTab('rules')}
                    className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-all ${tab === 'rules'
                        ? 'text-emerald-400 border-emerald-400'
                        : 'text-forest-muted border-transparent hover:text-forest-cream'}`}>
                    <Shield className="w-4 h-4" /> Rules
                    <span className="ml-1.5 text-[10px] bg-forest-card/30 px-2 py-0.5 rounded-full text-forest-muted/60">{rules.length}</span>
                </button>
                <button onClick={() => setTab('alerts')}
                    className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-all ${tab === 'alerts'
                        ? 'text-amber-400 border-amber-400'
                        : 'text-forest-muted border-transparent hover:text-forest-cream'}`}>
                    <AlertTriangle className="w-4 h-4" /> Triggered
                    <span className="ml-1.5 text-[10px] bg-forest-card/30 px-2 py-0.5 rounded-full text-forest-muted/60">{alerts.length}</span>
                </button>
            </div>

            {tab === 'rules' ? (
                <div className="space-y-3">
                    {rules.length === 0 ? (
                        <div className="glass-panel rounded-2xl p-16 text-center">
                            <span className="text-6xl block mb-4">🔔</span>
                            <h3 className="text-xl font-semibold text-forest-cream font-display mb-2">No Alert Rules</h3>
                            <p className="text-forest-muted text-sm">Create your first alert rule to monitor farm conditions.</p>
                        </div>
                    ) : (
                        rules.map(rule => {
                            const sev = sevColors[rule.severity] || sevColors.MEDIUM;
                            return (
                                <div key={rule.id} className={`glass-card rounded-2xl p-5 flex items-center gap-4 ${!rule.enabled ? 'opacity-50' : ''}`}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold text-forest-cream">{rule.name}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${sev.bg} ${sev.text} border ${sev.border}`}>
                                                {rule.severity}
                                            </span>
                                        </div>
                                        <p className="text-xs text-forest-muted mt-1.5 font-mono">
                                            {rule.metric} {rule.operator} {rule.threshold}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleToggle(rule)}
                                            className="text-forest-muted hover:text-forest-cream transition-colors p-1.5 rounded-lg hover:bg-forest-card/30">
                                            {rule.enabled ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6" />}
                                        </button>
                                        <button onClick={() => handleDeleteRule(rule.id)}
                                            className="text-forest-muted hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/[0.06]">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {alerts.length === 0 ? (
                        <div className="glass-panel rounded-2xl p-16 text-center">
                            <span className="text-6xl block mb-4">🌿</span>
                            <h3 className="text-xl font-semibold text-forest-cream font-display mb-2">All Clear</h3>
                            <p className="text-forest-muted text-sm">No alerts have been triggered. The forest is at peace.</p>
                        </div>
                    ) : (
                        alerts.map((a, i) => {
                            const sev = sevColors[a.severity] || sevColors.MEDIUM;
                            return (
                                <div key={i} className={`p-5 rounded-2xl ${sev.bg} border ${sev.border} transition-all hover:scale-[1.005]`}
                                    style={{ boxShadow: `0 4px 20px ${sev.glow}` }}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">{sev.icon}</span>
                                            <span className={`text-xs font-bold uppercase tracking-wider ${sev.text}`}>{a.severity}</span>
                                        </div>
                                        <span className="text-[11px] text-forest-muted/40">{new Date(a.triggered_at).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-forest-cream mb-3">{a.message}</p>
                                    {!a.acknowledged && (
                                        <button onClick={() => handleAck(a.id)}
                                            className="flex items-center gap-1.5 text-xs text-forest-spring hover:text-forest-accent transition-colors font-medium">
                                            <CheckCircle className="w-3.5 h-3.5" /> Acknowledge
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Create Rule Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-darkest/85 backdrop-blur-md" onClick={() => setShowCreate(false)}>
                    <div className="rounded-3xl p-8 max-w-lg w-full border border-forest-border/25 page-enter"
                        style={{
                            background: 'linear-gradient(135deg, rgba(19, 42, 19, 0.97), rgba(10, 23, 10, 0.99))',
                            boxShadow: '0 30px 100px rgba(0,0,0,0.6), 0 0 60px rgba(74, 222, 128, 0.04)',
                        }}
                        onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-forest-cream font-display flex items-center gap-2">
                                <Leaf className="w-5 h-5 text-forest-spring" /> New Alert Rule
                            </h2>
                            <button onClick={() => setShowCreate(false)} className="text-forest-muted hover:text-forest-cream p-1"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCreateRule} className="space-y-4">
                            <div>
                                <label className="block text-xs text-forest-muted uppercase tracking-wider mb-1.5 font-medium">Rule Name</label>
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-scada w-full" required placeholder="e.g. High Temperature Alert" />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs text-forest-muted uppercase tracking-wider mb-1.5 font-medium">Metric</label>
                                    <input value={form.metric} onChange={(e) => setForm({ ...form, metric: e.target.value })} className="input-scada w-full" required placeholder="temperature" />
                                </div>
                                <div>
                                    <label className="block text-xs text-forest-muted uppercase tracking-wider mb-1.5 font-medium">Operator</label>
                                    <select value={form.operator} onChange={(e) => setForm({ ...form, operator: e.target.value })} className="input-scada w-full">
                                        <option value=">">&gt;</option>
                                        <option value="<">&lt;</option>
                                        <option value=">=">&gt;=</option>
                                        <option value="<=">&lt;=</option>
                                        <option value="==">=</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-forest-muted uppercase tracking-wider mb-1.5 font-medium">Threshold</label>
                                    <input type="number" step="0.01" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: e.target.value })} className="input-scada w-full" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-forest-muted uppercase tracking-wider mb-1.5 font-medium">Severity</label>
                                <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="input-scada w-full">
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="CRITICAL">Critical</option>
                                </select>
                            </div>
                            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                                <TreePine className="w-4 h-4" /> Create Rule
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
