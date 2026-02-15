import { useState, useEffect } from 'react';
import { buildingAPI } from '../services/api';

export default function Buildings() {
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', address: '', floors: 1, description: '' });

    const fetchBuildings = async () => {
        try {
            setLoading(true);
            const res = await buildingAPI.getAll();
            setBuildings(res.data.buildings || []);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load buildings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBuildings(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await buildingAPI.update(editId, form);
            } else {
                await buildingAPI.create(form);
            }
            setShowForm(false);
            setEditId(null);
            setForm({ name: '', address: '', floors: 1, description: '' });
            fetchBuildings();
        } catch (err) {
            setError(err.response?.data?.detail || 'Operation failed');
        }
    };

    const handleEdit = (b) => {
        setForm({ name: b.name, address: b.address, floors: b.floors, description: b.description || '' });
        setEditId(b.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this building?')) return;
        try {
            await buildingAPI.delete(id);
            fetchBuildings();
        } catch (err) {
            setError(err.response?.data?.detail || 'Delete failed');
        }
    };

    const handleChange = (e) => {
        const val = e.target.name === 'floors' ? parseInt(e.target.value) || 1 : e.target.value;
        setForm({ ...form, [e.target.name]: val });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-scada-text">Buildings</h1>
                <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', address: '', floors: 1, description: '' }); }}
                    className="px-4 py-2 bg-scada-accent hover:bg-blue-600 text-white rounded text-sm font-medium">
                    {showForm ? 'Cancel' : '+ Add Building'}
                </button>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded mb-4 text-sm">{error}</div>}

            {showForm && (
                <div className="bg-scada-panel border border-scada-border rounded-lg p-4 mb-6">
                    <h2 className="text-lg font-medium text-scada-text mb-3">{editId ? 'Edit Building' : 'New Building'}</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input name="name" placeholder="Building Name" value={form.name} onChange={handleChange}
                            className="px-3 py-2 bg-scada-dark border border-scada-border rounded text-scada-text" required />
                        <input name="address" placeholder="Address" value={form.address} onChange={handleChange}
                            className="px-3 py-2 bg-scada-dark border border-scada-border rounded text-scada-text" required />
                        <input name="floors" type="number" placeholder="Floors" value={form.floors} onChange={handleChange} min="1"
                            className="px-3 py-2 bg-scada-dark border border-scada-border rounded text-scada-text" />
                        <input name="description" placeholder="Description (optional)" value={form.description} onChange={handleChange}
                            className="px-3 py-2 bg-scada-dark border border-scada-border rounded text-scada-text" />
                        <button type="submit" className="px-4 py-2 bg-scada-accent hover:bg-blue-600 text-white rounded font-medium">
                            {editId ? 'Update' : 'Create'}
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <p className="text-scada-muted">Loading...</p>
            ) : buildings.length === 0 ? (
                <p className="text-scada-muted">No buildings yet. Add one to get started.</p>
            ) : (
                <div className="grid gap-4">
                    {buildings.map((b) => (
                        <div key={b.id} className="bg-scada-panel border border-scada-border rounded-lg p-4 flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold text-scada-text">{b.name}</h3>
                                <p className="text-sm text-scada-muted">{b.address}</p>
                                <div className="flex gap-4 mt-2 text-xs text-scada-muted">
                                    <span>Floors: {b.floors}</span>
                                    {b.description && <span>• {b.description}</span>}
                                    <span>• ID: {b.id}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(b)} className="px-3 py-1 bg-scada-card border border-scada-border rounded text-sm text-scada-muted hover:text-scada-text">Edit</button>
                                <button onClick={() => handleDelete(b.id)} className="px-3 py-1 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-400 hover:bg-red-500/20">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
