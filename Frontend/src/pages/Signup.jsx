import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function Signup({ onLogin }) {
    const [form, setForm] = useState({
        first_name: '', last_name: '', email: '', mobile_number: '', password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await authAPI.signup(form);
            const { access_token, user } = res.data;
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));
            onLogin(user, access_token);
        } catch (err) {
            setError(err.response?.data?.detail || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-scada-dark">
            <div className="bg-scada-panel border border-scada-border rounded-lg p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-scada-text mb-2">Create Account</h1>
                <p className="text-scada-muted mb-6">Join KVedaa SCADA Platform</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm text-scada-muted mb-1">First Name</label>
                            <input name="first_name" value={form.first_name} onChange={handleChange}
                                className="w-full px-3 py-2 bg-scada-dark border border-scada-border rounded text-scada-text focus:border-scada-accent focus:outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm text-scada-muted mb-1">Last Name</label>
                            <input name="last_name" value={form.last_name} onChange={handleChange}
                                className="w-full px-3 py-2 bg-scada-dark border border-scada-border rounded text-scada-text focus:border-scada-accent focus:outline-none" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-scada-muted mb-1">Email</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange}
                            className="w-full px-3 py-2 bg-scada-dark border border-scada-border rounded text-scada-text focus:border-scada-accent focus:outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm text-scada-muted mb-1">Mobile</label>
                        <input name="mobile_number" value={form.mobile_number} onChange={handleChange}
                            className="w-full px-3 py-2 bg-scada-dark border border-scada-border rounded text-scada-text focus:border-scada-accent focus:outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm text-scada-muted mb-1">Password</label>
                        <input type="password" name="password" value={form.password} onChange={handleChange}
                            className="w-full px-3 py-2 bg-scada-dark border border-scada-border rounded text-scada-text focus:border-scada-accent focus:outline-none" required minLength={8} />
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full py-2 bg-scada-accent hover:bg-blue-600 text-white rounded font-medium disabled:opacity-50">
                        {loading ? 'Creating...' : 'Create Account'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-scada-muted">
                    Already have an account?{' '}
                    <Link to="/login" className="text-scada-accent hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
}
