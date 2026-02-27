import { useState, useEffect } from 'react';
import { buildingAPI } from '../services/api';
import { Building, Plus, Pencil, Trash2, X, MapPin, Layers, TreePine, Leaf } from 'lucide-react';

export default function Buildings() {
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: '', address: '', floors: 1, description: '' });

    const fetchBuildings = async () => {
        try {
            const res = await buildingAPI.getAll();
            const data = res.data;
            setBuildings(Array.isArray(data) ? data : (data?.buildings || []));
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchBuildings(); }, []);

    const openCreate = () => {
        setForm({ name: '', address: '', floors: 1, description: '' });
        setEditing(null);
        setShowForm(true);
    };

    const openEdit = (b) => {
        setForm({ name: b.name, address: b.address, floors: b.floors, description: b.description || '' });
        setEditing(b);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await buildingAPI.update(editing.id, form);
            } else {
                await buildingAPI.create(form);
            }
            setShowForm(false);
            fetchBuildings();
        } catch (err) { setError(err.response?.data?.detail || 'Failed'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this building?')) return;
        try { await buildingAPI.delete(id); fetchBuildings(); }
        catch (err) { setError(err.response?.data?.detail || 'Failed'); }
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
                        <Building className="w-7 h-7 text-forest-spring" />
                        Buildings
                    </h1>
                    <p className="text-sm text-forest-muted mt-1.5">Manage your farm's growing facilities</p>
                </div>
                <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4" /> Add Building
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
                </div>
            )}

            {buildings.length === 0 ? (
                <div className="glass-panel rounded-2xl p-16 text-center">
                    <span className="text-6xl block mb-4">🏗️</span>
                    <h3 className="text-xl font-semibold text-forest-cream font-display mb-2">No Buildings Yet</h3>
                    <p className="text-forest-muted text-sm">Add your first growing facility to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {buildings.map((b) => (
                        <div key={b.id} className="glass-card rounded-2xl p-6 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-forest-spring/[0.05] blur-3xl pointer-events-none -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="flex items-start justify-between mb-5 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl"
                                        style={{ background: 'linear-gradient(135deg, rgba(82, 183, 136, 0.12), rgba(45, 106, 79, 0.08))', border: '1px solid rgba(82, 183, 136, 0.15)' }}>
                                        <Building className="w-5 h-5 text-forest-spring" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-forest-cream text-lg group-hover:text-forest-glow transition-colors">{b.name}</h3>
                                        <p className="text-xs text-forest-muted/60 uppercase tracking-wider mt-0.5 font-medium">Facility</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 relative z-10">
                                <div className="flex items-center text-sm text-forest-muted">
                                    <MapPin className="w-4 h-4 mr-2 text-forest-moss" />
                                    <span>{b.address}</span>
                                </div>
                                <div className="flex items-center text-sm text-forest-muted">
                                    <Layers className="w-4 h-4 mr-2 text-forest-moss" />
                                    <span>{b.floors} Floor{b.floors > 1 ? 's' : ''}</span>
                                </div>
                                {b.description && (
                                    <p className="text-xs text-forest-muted/50 pt-1 line-clamp-2">{b.description}</p>
                                )}
                            </div>

                            <div className="mt-5 pt-4 border-t border-forest-border/15 flex items-center gap-2 relative z-10">
                                <button onClick={() => openEdit(b)}
                                    className="flex-1 py-2 rounded-lg text-xs font-medium text-forest-muted hover:text-forest-cream hover:bg-forest-card/40 border border-transparent hover:border-forest-border/20 transition-all flex items-center justify-center gap-1">
                                    <Pencil className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button onClick={() => handleDelete(b.id)}
                                    className="flex-1 py-2 rounded-lg text-xs font-medium text-forest-muted hover:text-red-400 hover:bg-red-500/[0.06] border border-transparent hover:border-red-500/15 transition-all flex items-center justify-center gap-1">
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-darkest/85 backdrop-blur-md" onClick={() => setShowForm(false)}>
                    <div className="rounded-3xl p-8 max-w-lg w-full border border-forest-border/25 page-enter"
                        style={{
                            background: 'linear-gradient(135deg, rgba(19, 42, 19, 0.97), rgba(10, 23, 10, 0.99))',
                            boxShadow: '0 30px 100px rgba(0,0,0,0.6), 0 0 60px rgba(74, 222, 128, 0.04)',
                        }}
                        onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-forest-cream font-display flex items-center gap-2">
                                <Leaf className="w-5 h-5 text-forest-spring" />
                                {editing ? 'Edit Building' : 'Add Building'}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="text-forest-muted hover:text-forest-cream p-1 transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs text-forest-muted uppercase tracking-wider mb-1.5 font-medium">Name</label>
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-scada w-full" required />
                            </div>
                            <div>
                                <label className="block text-xs text-forest-muted uppercase tracking-wider mb-1.5 font-medium">Address</label>
                                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-scada w-full" required />
                            </div>
                            <div>
                                <label className="block text-xs text-forest-muted uppercase tracking-wider mb-1.5 font-medium">Floors</label>
                                <input type="number" min="1" value={form.floors} onChange={(e) => setForm({ ...form, floors: parseInt(e.target.value) || 1 })} className="input-scada w-full" />
                            </div>
                            <div>
                                <label className="block text-xs text-forest-muted uppercase tracking-wider mb-1.5 font-medium">Description</label>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-scada w-full resize-none" rows={3} />
                            </div>
                            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                                <TreePine className="w-4 h-4" />
                                {editing ? 'Update Building' : 'Create Building'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
