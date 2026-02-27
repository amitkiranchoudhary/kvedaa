import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { TreePine, Leaf, Eye, EyeOff } from 'lucide-react';

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
        <div className="min-h-screen flex items-center justify-center bg-forest-darkest relative overflow-hidden">
            {/* ═══ Immersive Forest Background ═══ */}
            <div className="absolute inset-0">
                {/* Large ambient orbs */}
                <div className="absolute top-[-25%] left-[15%] w-[65%] h-[55%] rounded-full bg-emerald-700/[0.06] blur-[200px] animate-bio-glow" />
                <div className="absolute bottom-[-15%] right-[5%] w-[45%] h-[45%] rounded-full bg-forest-gold/[0.04] blur-[160px] animate-bio-glow" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[55%] left-[-10%] w-[35%] h-[35%] rounded-full bg-emerald-900/[0.08] blur-[120px] animate-bio-glow" style={{ animationDelay: '4s' }} />

                {/* Sun ray from top-right */}
                <div className="absolute top-0 right-[20%] w-[25%] h-[70%] animate-sun-stream opacity-15"
                    style={{
                        background: 'linear-gradient(165deg, rgba(230, 180, 34, 0.1), transparent 60%)',
                        transformOrigin: 'top center',
                    }} />

                {/* Nature dots overlay */}
                <div className="absolute inset-0 opacity-[0.02] nature-dots" />
            </div>

            {/* Floating nature elements */}
            <div className="absolute top-16 left-16 text-5xl opacity-[0.07] animate-gentle-float">🍃</div>
            <div className="absolute bottom-28 right-20 text-4xl opacity-[0.06] animate-gentle-float" style={{ animationDelay: '3s' }}>🌿</div>
            <div className="absolute top-36 right-32 text-3xl opacity-[0.05] animate-gentle-float" style={{ animationDelay: '5s' }}>🍂</div>
            <div className="absolute bottom-16 left-32 text-3xl opacity-[0.04] animate-drift" style={{ animationDelay: '7s' }}>🌱</div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="rounded-3xl p-8 border border-forest-border/25"
                    style={{
                        background: 'linear-gradient(135deg, rgba(19, 42, 19, 0.8), rgba(10, 23, 10, 0.9))',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 50px rgba(74, 222, 128, 0.03), inset 0 1px 0 rgba(74, 222, 128, 0.06)',
                    }}>

                    {/* Logo/Brand */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-13 h-13 rounded-2xl flex items-center justify-center relative overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, #1b4332, #2d6a4f, #40916c)',
                                boxShadow: '0 0 30px rgba(74, 222, 128, 0.25), 0 4px 15px rgba(0,0,0,0.3)',
                                width: '52px',
                                height: '52px',
                            }}>
                            <TreePine className="w-7 h-7 text-emerald-200 relative z-10" />
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-forest-cream font-display">KVedaa</h1>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-forest-spring font-bold flex items-center gap-1">
                                <Leaf className="w-2.5 h-2.5" /> Cordyceps Farm
                            </p>
                        </div>
                    </div>

                    <p className="text-forest-muted mb-8 text-sm">Welcome back! Sign in to your farm dashboard.</p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm text-forest-muted mb-2 font-medium">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-scada w-full text-base"
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-forest-muted mb-2 font-medium">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-scada w-full pr-11 text-base"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-muted/50 hover:text-forest-cream transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl font-semibold disabled:opacity-50 transition-all active:scale-[0.98] text-white text-base relative overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, #1b4332, #2d6a4f, #40916c)',
                                boxShadow: '0 4px 25px rgba(74, 222, 128, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                            }}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Entering the forest...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <TreePine className="w-4.5 h-4.5" /> Sign In
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-forest-border/15">
                        <p className="text-center text-sm text-forest-muted">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-forest-spring hover:text-forest-accent font-semibold transition-colors">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
