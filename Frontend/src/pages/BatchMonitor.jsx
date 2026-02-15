import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Beaker, Syringe, Moon, Sun, Scissors, CheckCircle, AlertTriangle, Plus, ChevronRight, Clock, Thermometer, Droplets } from 'lucide-react';

const STAGE_CONFIG = {
    SUBSTRATE_PREP: { label: 'Substrate Prep', icon: Beaker, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', glow: 'shadow-blue-500/10', dayRange: 'Day 0' },
    INOCULATION: { label: 'Inoculation', icon: Syringe, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', glow: 'shadow-violet-500/10', dayRange: 'Day 1' },
    INCUBATION: { label: 'Dark Run', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', glow: 'shadow-indigo-500/10', dayRange: 'Days 2-10' },
    FRUITING: { label: 'Light Run', icon: Sun, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', glow: 'shadow-amber-500/10', dayRange: 'Days 11-45' },
    HARVEST: { label: 'Harvest', icon: Scissors, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/10', dayRange: 'Days 45-60' },
    COMPLETED: { label: 'Completed', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', glow: 'shadow-green-500/10', dayRange: 'Done' },
    FAILED: { label: 'Failed', icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', glow: 'shadow-rose-500/10', dayRange: '—' },
};

const ACTIVE_STAGES = ['SUBSTRATE_PREP', 'INOCULATION', 'INCUBATION', 'FRUITING', 'HARVEST'];

const BatchMonitor = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [viewMode, setViewMode] = useState('kanban'); // kanban or timeline

    useEffect(() => { fetchBatches(); }, []);

    const fetchBatches = async () => {
        try {
            const res = await api.get('/api/farm/batches/');
            setBatches(res.data);
        } catch (err) { console.error('Failed:', err); }
        finally { setLoading(false); }
    };

    const createBatch = async (data) => {
        try {
            await api.post('/api/farm/batches/', data);
            setShowCreate(false);
            fetchBatches();
        } catch (err) { console.error('Failed:', err); }
    };

    const advanceStage = async (batchId, newStage) => {
        try {
            await api.post(`/api/farm/batches/${batchId}/advance`, { new_stage: newStage });
            fetchBatches();
            setSelectedBatch(null);
        } catch (err) { console.error('Failed:', err); }
    };

    // Group batches by stage for Kanban view
    const batchesByStage = {};
    ACTIVE_STAGES.forEach(s => { batchesByStage[s] = []; });
    batches.forEach(b => {
        if (batchesByStage[b.current_stage]) batchesByStage[b.current_stage].push(b);
    });

    if (loading) return <div className="flex items-center justify-center h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-scada-accent"></div></div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Batch Monitor</h1>
                    <p className="text-sm text-slate-400 mt-1">{batches.length} total batches • {batches.filter(b => !['COMPLETED', 'FAILED'].includes(b.current_stage)).length} active</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex rounded-lg bg-white/5 border border-white/5 p-0.5">
                        <button onClick={() => setViewMode('kanban')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'kanban' ? 'bg-scada-accent text-white' : 'text-slate-400 hover:text-white'}`}>Kanban</button>
                        <button onClick={() => setViewMode('timeline')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'timeline' ? 'bg-scada-accent text-white' : 'text-slate-400 hover:text-white'}`}>Timeline</button>
                    </div>
                    <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm" id="create-batch-btn">
                        <Plus className="w-4 h-4" /> New Batch
                    </button>
                </div>
            </div>

            {/* Kanban View */}
            {viewMode === 'kanban' && (
                <div className="grid grid-cols-5 gap-4 min-h-[60vh]">
                    {ACTIVE_STAGES.map(stage => {
                        const cfg = STAGE_CONFIG[stage];
                        const Icon = cfg.icon;
                        const items = batchesByStage[stage] || [];
                        return (
                            <div key={stage} className="flex flex-col">
                                <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-xl ${cfg.bg} border ${cfg.border}`}>
                                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                                    <span className={`text-xs font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                                    <span className="ml-auto text-[10px] text-slate-500">{cfg.dayRange}</span>
                                    <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-white">{items.length}</span>
                                </div>
                                <div className="space-y-2 flex-1">
                                    {items.map((batch, idx) => (
                                        <motion.div key={batch.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                            className={`p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/8 hover:${cfg.border} cursor-pointer transition-all group`}
                                            onClick={() => setSelectedBatch(batch)}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs font-bold text-white">{batch.batch_number}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${batch.batch_status === 'AT_RISK' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                    {batch.batch_status === 'AT_RISK' ? '⚠️' : '✓'}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-400 mb-1">Strain: {batch.strain}</p>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                                <Clock className="w-3 h-3" /> Day {batch.current_day}
                                                <span>•</span>
                                                <span>{batch.jar_count} jars</span>
                                            </div>
                                            <ChevronRight className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3" />
                                        </motion.div>
                                    ))}
                                    {items.length === 0 && <div className="flex items-center justify-center h-24 rounded-xl border border-dashed border-white/5 text-xs text-slate-600">Empty</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Timeline View */}
            {viewMode === 'timeline' && (
                <div className="space-y-3">
                    {batches.map((batch, idx) => {
                        const cfg = STAGE_CONFIG[batch.current_stage] || STAGE_CONFIG.COMPLETED;
                        const Icon = cfg.icon;
                        const progress = Math.min((batch.current_day / 60) * 100, 100);
                        return (
                            <motion.div key={batch.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                                className="glass-panel p-5 rounded-2xl hover:bg-white/5 cursor-pointer transition-all"
                                onClick={() => setSelectedBatch(batch)}>
                                <div className="flex items-center gap-4 mb-3">
                                    <div className={`p-2.5 rounded-xl ${cfg.bg} border ${cfg.border}`}><Icon className={`w-5 h-5 ${cfg.color}`} /></div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white">{batch.batch_number}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} font-semibold`}>{cfg.label}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-0.5">{batch.stage_display} • Strain: {batch.strain} • {batch.jar_count} jars</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-white">Day {batch.current_day}</p>
                                        <p className="text-[10px] text-slate-500">of ~60 days</p>
                                    </div>
                                </div>
                                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, delay: idx * 0.1 }}
                                        className={`h-full rounded-full bg-gradient-to-r ${batch.current_stage === 'INCUBATION' ? 'from-indigo-600 to-indigo-400' : batch.current_stage === 'FRUITING' ? 'from-amber-600 to-amber-400' : 'from-emerald-600 to-emerald-400'}`} />
                                </div>
                            </motion.div>
                        );
                    })}
                    {batches.length === 0 && <div className="text-center py-20 text-slate-500">No batches yet. Create your first batch!</div>}
                </div>
            )}

            {/* Create Batch Modal */}
            {showCreate && <CreateBatchModal onClose={() => setShowCreate(false)} onCreate={createBatch} />}

            {/* Batch Detail Modal */}
            {selectedBatch && <BatchDetailModal batch={selectedBatch} onClose={() => setSelectedBatch(null)} onAdvance={advanceStage} />}
        </div>
    );
};


const CreateBatchModal = ({ onClose, onCreate }) => {
    const [form, setForm] = useState({ batch_number: '', strain: 'CM-1', substrate: 'Brown Rice + Peptone', jar_count: 12, spore_source: '', notes: '', is_public: false });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[#1e293b] rounded-2xl border border-white/10 max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-white mb-6">🧬 Create New Batch</h2>
                <div className="space-y-4">
                    <div><label className="text-xs text-slate-400 mb-1 block">Batch Number *</label><input value={form.batch_number} onChange={e => setForm({ ...form, batch_number: e.target.value })} className="input-scada w-full" placeholder="BATCH-2026-001" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs text-slate-400 mb-1 block">Strain</label><input value={form.strain} onChange={e => setForm({ ...form, strain: e.target.value })} className="input-scada w-full" /></div>
                        <div><label className="text-xs text-slate-400 mb-1 block">Jar Count</label><input type="number" value={form.jar_count} onChange={e => setForm({ ...form, jar_count: parseInt(e.target.value) || 1 })} className="input-scada w-full" /></div>
                    </div>
                    <div><label className="text-xs text-slate-400 mb-1 block">Substrate</label><input value={form.substrate} onChange={e => setForm({ ...form, substrate: e.target.value })} className="input-scada w-full" /></div>
                    <div><label className="text-xs text-slate-400 mb-1 block">Spore Source</label><input value={form.spore_source} onChange={e => setForm({ ...form, spore_source: e.target.value })} className="input-scada w-full" placeholder="Optional" /></div>
                    <div><label className="text-xs text-slate-400 mb-1 block">Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input-scada w-full h-20 resize-none" /></div>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_public} onChange={e => setForm({ ...form, is_public: e.target.checked })} className="rounded" /><span className="text-sm text-slate-400">Make batch data public (visible on store)</span></label>
                </div>
                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 text-sm font-medium transition-all">Cancel</button>
                    <button onClick={() => onCreate(form)} disabled={!form.batch_number} className="flex-1 btn-primary text-sm disabled:opacity-50">Create & Generate Schedule</button>
                </div>
            </div>
        </div>
    );
};


const BatchDetailModal = ({ batch, onClose, onAdvance }) => {
    const cfg = STAGE_CONFIG[batch.current_stage] || STAGE_CONFIG.COMPLETED;
    const Icon = cfg.icon;
    const stageOrder = ['SUBSTRATE_PREP', 'INOCULATION', 'INCUBATION', 'FRUITING', 'HARVEST', 'COMPLETED'];
    const currentIdx = stageOrder.indexOf(batch.current_stage);
    const nextStage = currentIdx < stageOrder.length - 1 ? stageOrder[currentIdx + 1] : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[#1e293b] rounded-2xl border border-white/10 max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${cfg.bg} border ${cfg.border}`}><Icon className={`w-6 h-6 ${cfg.color}`} /></div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{batch.batch_number}</h2>
                            <p className={`text-sm ${cfg.color} font-semibold`}>{batch.stage_display}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 text-lg">✕</button>
                </div>

                {/* Stage Progress */}
                <div className="flex items-center gap-1 mb-6 px-1">
                    {stageOrder.slice(0, -1).map((s, i) => {
                        const sc = STAGE_CONFIG[s];
                        const done = i < currentIdx;
                        const active = i === currentIdx;
                        return (
                            <div key={s} className="flex-1 flex flex-col items-center">
                                <div className={`w-full h-1.5 rounded-full ${done ? 'bg-emerald-500' : active ? `bg-gradient-to-r from-emerald-500 to-slate-700` : 'bg-white/5'}`} />
                                <span className={`text-[9px] mt-1 ${done ? 'text-emerald-400' : active ? sc.color : 'text-slate-600'} font-medium`}>{sc.label}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Batch Details Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5"><p className="text-[10px] text-slate-500 uppercase">Strain</p><p className="text-sm font-semibold text-white">{batch.strain}</p></div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5"><p className="text-[10px] text-slate-500 uppercase">Jars</p><p className="text-sm font-semibold text-white">{batch.jar_count}</p></div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5"><p className="text-[10px] text-slate-500 uppercase">Day</p><p className="text-sm font-semibold text-white">{batch.current_day} / 60</p></div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5"><p className="text-[10px] text-slate-500 uppercase">Substrate</p><p className="text-sm font-semibold text-white truncate">{batch.substrate}</p></div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5"><p className="text-[10px] text-slate-500 uppercase">Status</p><p className={`text-sm font-semibold ${batch.batch_status === 'HEALTHY' ? 'text-emerald-400' : 'text-amber-400'}`}>{batch.batch_status}</p></div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5"><p className="text-[10px] text-slate-500 uppercase">Started</p><p className="text-sm font-semibold text-white">{new Date(batch.started_at).toLocaleDateString()}</p></div>
                </div>

                {/* Environmental Requirements */}
                {batch.current_stage === 'INCUBATION' && (
                    <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 mb-4">
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">🌑 Dark Run Requirements</p>
                        <div className="flex gap-4 text-sm">
                            <span className="flex items-center gap-1 text-slate-300"><Thermometer className="w-3.5 h-3.5 text-indigo-400" /> 20°C</span>
                            <span className="flex items-center gap-1 text-slate-300"><Droplets className="w-3.5 h-3.5 text-indigo-400" /> 65%</span>
                            <span className="text-rose-400 font-semibold">NO LIGHT</span>
                        </div>
                    </div>
                )}
                {batch.current_stage === 'FRUITING' && (
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 mb-4">
                        <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">☀️ Light Run Requirements</p>
                        <div className="flex gap-4 text-sm">
                            <span className="flex items-center gap-1 text-slate-300"><Thermometer className="w-3.5 h-3.5 text-amber-400" /> 16-18°C</span>
                            <span className="flex items-center gap-1 text-slate-300"><Droplets className="w-3.5 h-3.5 text-amber-400" /> 80%</span>
                            <span className="text-amber-400 font-semibold">12h/12h Light</span>
                        </div>
                    </div>
                )}

                {/* Advance Stage Button */}
                {nextStage && batch.current_stage !== 'COMPLETED' && batch.current_stage !== 'FAILED' && (
                    <button onClick={() => onAdvance(batch.id, nextStage)} className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold text-sm hover:from-emerald-500 hover:to-emerald-400 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20">
                        Advance to {STAGE_CONFIG[nextStage]?.label || nextStage} →
                    </button>
                )}
            </div>
        </div>
    );
};

export default BatchMonitor;
