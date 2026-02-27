import { useState, useEffect, useMemo } from 'react';
import { farmAPI } from '../services/api';
import {
    Beaker, Syringe, Moon, Sun, Scissors, CheckCircle,
    AlertTriangle, Plus, X, Clock, Activity, ChevronRight, TreePine, Leaf
} from 'lucide-react';

const STAGE_CONFIG = {
    SUBSTRATE_PREP: { label: 'Substrate Prep', icon: Beaker, color: 'text-emerald-400', bg: 'bg-emerald-500/8', border: 'border-emerald-500/12', dayRange: 'Day 0', gradient: '#52b788' },
    INOCULATION: { label: 'Inoculation', icon: Syringe, color: 'text-lime-400', bg: 'bg-lime-500/8', border: 'border-lime-500/12', dayRange: 'Day 1', gradient: '#a3e635' },
    INCUBATION: { label: 'Dark Run', icon: Moon, color: 'text-forest-mist', bg: 'bg-forest-mist/8', border: 'border-forest-mist/12', dayRange: 'Days 2-10', gradient: '#b8d8b8' },
    FRUITING: { label: 'Light Run', icon: Sun, color: 'text-forest-gold', bg: 'bg-forest-gold/8', border: 'border-forest-gold/12', dayRange: 'Days 11-45', gradient: '#e6b422' },
    HARVEST: { label: 'Harvest', icon: Scissors, color: 'text-amber-400', bg: 'bg-amber-500/8', border: 'border-amber-500/12', dayRange: 'Days 45-60', gradient: '#f59e0b' },
    COMPLETED: { label: 'Completed', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/8', border: 'border-green-500/12', dayRange: 'Done', gradient: '#22c55e' },
    FAILED: { label: 'Failed', icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/8', border: 'border-rose-500/12', dayRange: '—', gradient: '#ef4444' },
};

const STAGES_ORDER = ['SUBSTRATE_PREP', 'INOCULATION', 'INCUBATION', 'FRUITING', 'HARVEST', 'COMPLETED'];

const ENV_REQS = {
    INCUBATION: [
        { label: 'Temperature', value: '24-26°C', icon: '🌡️' },
        { label: 'Humidity', value: '85-95%', icon: '💧' },
        { label: 'Light', value: 'Darkness', icon: '🌙' },
        { label: 'CO₂', value: 'Natural', icon: '🌿' },
    ],
    FRUITING: [
        { label: 'Temperature', value: '18-22°C', icon: '🌡️' },
        { label: 'Humidity', value: '90-95%', icon: '💧' },
        { label: 'Light', value: '12h cycle', icon: '☀️' },
        { label: 'CO₂', value: '<800ppm', icon: '🍃' },
    ]
};

export default function BatchMonitor() {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('kanban');
    const [showCreate, setShowCreate] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [error, setError] = useState('');

    const [form, setForm] = useState({ batch_id: '', strain: 'CM-01', substrate: 'Rice', jars_count: 12, notes: '' });

    const fetchBatches = async () => {
        try {
            const res = await farmAPI.getAllBatches();
            const data = res.data;
            setBatches(Array.isArray(data) ? data : data.batches || []);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchBatches(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await farmAPI.createBatch(form);
            setShowCreate(false);
            setForm({ batch_id: '', strain: 'CM-01', substrate: 'Rice', jars_count: 12, notes: '' });
            fetchBatches();
        } catch (err) { setError(err.response?.data?.detail || 'Failed'); }
    };

    const handleAdvance = async (batchId, nextStage) => {
        try {
            await farmAPI.advanceStage(batchId, nextStage);
            fetchBatches();
            setSelectedBatch(null);
        } catch (err) { setError(err.response?.data?.detail || 'Failed to advance'); }
    };

    const grouped = useMemo(() => {
        const g = {};
        STAGES_ORDER.forEach(s => g[s] = []);
        batches.forEach(b => {
            if (g[b.stage]) g[b.stage].push(b);
        });
        return g;
    }, [batches]);

    const daysSince = (dateStr) => {
        if (!dateStr) return 0;
        return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-forest-cream font-display flex items-center gap-3">
                        <Beaker className="w-7 h-7 text-forest-spring" />
                        Batch Monitor
                    </h1>
                    <p className="text-sm text-forest-muted mt-1.5">Track cultivation lifecycle from seed to harvest</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex rounded-xl border border-forest-border/20 p-0.5"
                        style={{ background: 'rgba(5, 13, 5, 0.4)' }}>
                        <button onClick={() => setView('kanban')}
                            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${view === 'kanban'
                                ? 'text-emerald-300'
                                : 'text-forest-muted hover:text-forest-cream'}`}
                            style={view === 'kanban' ? { background: 'linear-gradient(135deg, rgba(27, 67, 50, 0.4), rgba(45, 106, 79, 0.2))' } : undefined}>
                            Kanban
                        </button>
                        <button onClick={() => setView('timeline')}
                            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${view === 'timeline'
                                ? 'text-emerald-300'
                                : 'text-forest-muted hover:text-forest-cream'}`}
                            style={view === 'timeline' ? { background: 'linear-gradient(135deg, rgba(27, 67, 50, 0.4), rgba(45, 106, 79, 0.2))' } : undefined}>
                            Timeline
                        </button>
                    </div>
                    <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
                        <Plus className="w-4 h-4" /> New Batch
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Kanban View */}
            {view === 'kanban' ? (
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {STAGES_ORDER.map(stage => {
                        const conf = STAGE_CONFIG[stage];
                        const Icon = conf.icon;
                        return (
                            <div key={stage} className="min-w-[260px] flex-1">
                                <div className="flex items-center gap-2 mb-3 px-1">
                                    <Icon className={`w-4 h-4 ${conf.color}`} />
                                    <span className={`text-sm font-semibold ${conf.color}`}>{conf.label}</span>
                                    <span className="ml-auto text-xs text-forest-muted/40 px-2 py-0.5 rounded-full border border-forest-border/10"
                                        style={{ background: 'rgba(26, 58, 26, 0.2)' }}>{grouped[stage].length}</span>
                                </div>
                                <div className="space-y-2">
                                    {grouped[stage].map(batch => (
                                        <div key={batch.id} onClick={() => setSelectedBatch(batch)}
                                            className={`p-4 rounded-xl border ${conf.border} hover:bg-forest-card/30 transition-all cursor-pointer group backdrop-blur-sm`}
                                            style={{ background: 'linear-gradient(145deg, rgba(26, 58, 26, 0.2), rgba(15, 33, 15, 0.15))' }}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-bold text-forest-cream">{batch.batch_id}</span>
                                                <ChevronRight className="w-4 h-4 text-forest-muted/30 group-hover:text-forest-cream transition-colors" />
                                            </div>
                                            <p className="text-xs text-forest-muted">🧬 {batch.strain}</p>
                                            <div className="flex items-center gap-2 mt-2 text-[11px] text-forest-muted/40">
                                                <Clock className="w-3 h-3" />
                                                <span>Day {daysSince(batch.start_date)}</span>
                                                <span>• {batch.jars_count} jars</span>
                                            </div>
                                        </div>
                                    ))}
                                    {grouped[stage].length === 0 && (
                                        <div className="p-8 rounded-xl border border-dashed border-forest-border/10 text-center">
                                            <p className="text-xs text-forest-muted/30">No batches</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Timeline View */
                <div className="glass-panel rounded-2xl p-6">
                    {batches.length === 0 ? (
                        <div className="text-center py-16">
                            <span className="text-6xl block mb-4">🌱</span>
                            <h3 className="text-xl font-semibold text-forest-cream font-display mb-2">No Batches Yet</h3>
                            <p className="text-forest-muted text-sm">Create your first cultivation batch to start the journey.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {batches.map(batch => {
                                const conf = STAGE_CONFIG[batch.stage] || STAGE_CONFIG.SUBSTRATE_PREP;
                                const Icon = conf.icon;
                                const stageIdx = STAGES_ORDER.indexOf(batch.stage);
                                const progress = ((stageIdx + 1) / STAGES_ORDER.length) * 100;
                                return (
                                    <div key={batch.id} onClick={() => setSelectedBatch(batch)}
                                        className="p-5 rounded-2xl border border-forest-border/12 hover:bg-forest-card/15 transition-all cursor-pointer group"
                                        style={{ background: 'linear-gradient(145deg, rgba(15, 33, 15, 0.2), rgba(10, 23, 10, 0.15))' }}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${conf.bg} ${conf.border} border`}>
                                                    <Icon className={`w-4 h-4 ${conf.color}`} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-forest-cream">{batch.batch_id}</p>
                                                    <p className="text-xs text-forest-muted">🧬 {batch.strain} • {batch.substrate}</p>
                                                </div>
                                            </div>
                                            <span className={`text-xs px-3 py-1 rounded-full ${conf.bg} ${conf.color} border ${conf.border} font-medium`}>{conf.label}</span>
                                        </div>
                                        <div className="w-full h-2 rounded-full overflow-hidden"
                                            style={{ background: 'rgba(5, 13, 5, 0.5)' }}>
                                            <div className="h-full rounded-full transition-all duration-700"
                                                style={{
                                                    width: `${progress}%`,
                                                    background: `linear-gradient(90deg, #1b4332, ${conf.gradient})`,
                                                }} />
                                        </div>
                                        <div className="flex justify-between mt-2 text-[11px] text-forest-muted/40">
                                            <span>Day {daysSince(batch.start_date)}</span>
                                            <span>{Math.round(progress)}% complete</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Create Batch Modal */}
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
                                <Leaf className="w-5 h-5 text-forest-spring" /> New Cultivation Batch
                            </h2>
                            <button onClick={() => setShowCreate(false)} className="text-forest-muted hover:text-forest-cream p-1"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-xs text-forest-muted uppercase tracking-wider mb-1.5 font-medium">Batch ID</label>
                                <input value={form.batch_id} onChange={(e) => setForm({ ...form, batch_id: e.target.value })} className="input-scada w-full" required placeholder="e.g. CM-2026-001" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-forest-muted uppercase tracking-wider mb-1.5 font-medium">Strain</label>
                                    <select value={form.strain} onChange={(e) => setForm({ ...form, strain: e.target.value })} className="input-scada w-full">
                                        <option value="CM-01">CM-01 (Standard)</option>
                                        <option value="CM-02">CM-02 (High Potency)</option>
                                        <option value="CM-03">CM-03 (Premium)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-forest-muted uppercase tracking-wider mb-1.5 font-medium">Substrate</label>
                                    <select value={form.substrate} onChange={(e) => setForm({ ...form, substrate: e.target.value })} className="input-scada w-full">
                                        <option value="Rice">Rice</option>
                                        <option value="Brown Rice">Brown Rice</option>
                                        <option value="Wheat">Wheat</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-forest-muted uppercase tracking-wider mb-1.5 font-medium">Jars Count</label>
                                <input type="number" min="1" value={form.jars_count} onChange={(e) => setForm({ ...form, jars_count: parseInt(e.target.value) || 1 })} className="input-scada w-full" />
                            </div>
                            <div>
                                <label className="block text-xs text-forest-muted uppercase tracking-wider mb-1.5 font-medium">Notes (optional)</label>
                                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-scada w-full resize-none" rows={3} />
                            </div>
                            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                                <TreePine className="w-4 h-4" /> Create Batch
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Batch Detail Modal */}
            {selectedBatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-darkest/85 backdrop-blur-md" onClick={() => setSelectedBatch(null)}>
                    <div className="rounded-3xl p-8 max-w-2xl w-full border border-forest-border/25 max-h-[85vh] overflow-y-auto page-enter"
                        style={{
                            background: 'linear-gradient(135deg, rgba(19, 42, 19, 0.97), rgba(10, 23, 10, 0.99))',
                            boxShadow: '0 30px 100px rgba(0,0,0,0.6), 0 0 60px rgba(74, 222, 128, 0.04)',
                        }}
                        onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-forest-cream font-display">{selectedBatch.batch_id}</h2>
                                <p className="text-sm text-forest-muted mt-1">🧬 {selectedBatch.strain} • {selectedBatch.substrate} • {selectedBatch.jars_count} jars</p>
                            </div>
                            <button onClick={() => setSelectedBatch(null)} className="text-forest-muted hover:text-forest-cream p-1"><X className="w-5 h-5" /></button>
                        </div>

                        {/* Stage Progress */}
                        <div className="mb-6">
                            <div className="flex items-center gap-1">
                                {STAGES_ORDER.map((stage, i) => {
                                    const conf = STAGE_CONFIG[stage];
                                    const isActive = stage === selectedBatch.stage;
                                    const isPast = STAGES_ORDER.indexOf(selectedBatch.stage) > i;
                                    return (
                                        <div key={stage} className="flex-1">
                                            <div className={`h-2 rounded-full transition-all ${isPast ? 'bg-emerald-500' : isActive ? 'bg-emerald-400 animate-pulse' : ''}`}
                                                style={!isPast && !isActive ? { background: 'rgba(5, 13, 5, 0.5)' } : undefined} />
                                            <p className={`text-[10px] mt-1 text-center ${isActive ? conf.color + ' font-bold' : 'text-forest-muted/30'}`}>{conf.label}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Environmental Requirements */}
                        {ENV_REQS[selectedBatch.stage] && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-forest-cream mb-3 flex items-center gap-2"><Leaf className="w-4 h-4 text-emerald-400" /> Optimal Conditions</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {ENV_REQS[selectedBatch.stage].map((req, i) => (
                                        <div key={i} className="p-4 rounded-xl border border-forest-border/12 text-center"
                                            style={{ background: 'linear-gradient(135deg, rgba(15, 33, 15, 0.3), rgba(10, 23, 10, 0.2))' }}>
                                            <span className="text-lg block mb-1">{req.icon}</span>
                                            <p className="text-xs text-forest-muted">{req.label}</p>
                                            <p className="text-sm font-bold text-forest-cream mt-0.5">{req.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {selectedBatch.notes && (
                            <div className="mb-6 p-4 rounded-xl border border-forest-border/12"
                                style={{ background: 'linear-gradient(135deg, rgba(26, 58, 26, 0.15), rgba(19, 42, 19, 0.1))' }}>
                                <p className="text-xs text-forest-muted uppercase tracking-wider mb-1 font-medium">Notes</p>
                                <p className="text-sm text-forest-mist/80">{selectedBatch.notes}</p>
                            </div>
                        )}

                        {/* Advance Button */}
                        {selectedBatch.stage !== 'COMPLETED' && selectedBatch.stage !== 'FAILED' && (
                            <button
                                onClick={() => {
                                    const idx = STAGES_ORDER.indexOf(selectedBatch.stage);
                                    if (idx < STAGES_ORDER.length - 1) handleAdvance(selectedBatch.id, STAGES_ORDER[idx + 1]);
                                }}
                                className="w-full py-3.5 rounded-xl font-semibold text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                style={{
                                    background: 'linear-gradient(135deg, #1b4332, #2d6a4f, #40916c)',
                                    boxShadow: '0 4px 25px rgba(74, 222, 128, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                                }}>
                                <TreePine className="w-4 h-4" /> Advance to Next Stage →
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
