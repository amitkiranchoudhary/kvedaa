import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await authAPI.login({ email, password });
            const { access_token, user } = res.data;
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));
            onLogin(user, access_token);
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-scada-dark">
            <div className="bg-scada-panel border border-scada-border rounded-lg p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-scada-text mb-2">KVedaa SCADA</h1>
                <p className="text-scada-muted mb-6">Sign in to your account</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-scada-muted mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-scada-dark border border-scada-border rounded text-scada-text focus:border-scada-accent focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-scada-muted mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-scada-dark border border-scada-border rounded text-scada-text focus:border-scada-accent focus:outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-scada-accent hover:bg-blue-600 text-white rounded font-medium disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-scada-muted">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-scada-accent hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}
