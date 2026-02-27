import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { TreePine, Leaf, Eye, EyeOff } from 'lucide-react';

export default function Signup({ onLogin }) {
    const [form, setForm] = useState({
        first_name: '', last_name: '', email: '', mobile_number: '', password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
        <div className="min-h-screen flex items-center justify-center bg-forest-darkest relative overflow-hidden">
            {/* ═══ Forest Ambient ═══ */}
            <div className="absolute inset-0">
                <div className="absolute top-[-20%] right-[15%] w-[55%] h-[55%] rounded-full bg-emerald-700/[0.06] blur-[200px] animate-bio-glow" />
                <div className="absolute bottom-[-15%] left-[10%] w-[45%] h-[40%] rounded-full bg-forest-gold/[0.04] blur-[160px] animate-bio-glow" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[60%] right-[-5%] w-[30%] h-[30%] rounded-full bg-emerald-900/[0.07] blur-[120px] animate-bio-glow" style={{ animationDelay: '4s' }} />

                <div className="absolute top-0 left-[25%] w-[20%] h-[65%] animate-sun-stream opacity-12"
                    style={{
                        background: 'linear-gradient(170deg, rgba(230, 180, 34, 0.1), transparent 60%)',
                        transformOrigin: 'top center',
                    }} />

                <div className="absolute inset-0 opacity-[0.02] nature-dots" />
            </div>

            {/* Floating decorations */}
            <div className="absolute top-12 right-12 text-5xl opacity-[0.06] animate-gentle-float">🌿</div>
            <div className="absolute bottom-20 left-16 text-4xl opacity-[0.06] animate-gentle-float" style={{ animationDelay: '4s' }}>🍃</div>
            <div className="absolute top-[50%] left-8 text-3xl opacity-[0.04] animate-drift" style={{ animationDelay: '6s' }}>🌱</div>

            {/* Card */}
            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="rounded-3xl p-8 border border-forest-border/25"
                    style={{
                        background: 'linear-gradient(135deg, rgba(19, 42, 19, 0.8), rgba(10, 23, 10, 0.9))',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 50px rgba(74, 222, 128, 0.03), inset 0 1px 0 rgba(74, 222, 128, 0.06)',
                    }}>

                    {/* Brand */}
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
                            <h1 className="text-2xl font-bold text-forest-cream font-display">Create Account</h1>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-forest-spring font-bold flex items-center gap-1">
                                <Leaf className="w-2.5 h-2.5" /> Join the Forest
                            </p>
                        </div>
                    </div>

                    <p className="text-forest-muted mb-6 text-sm">Join KVedaa Cordyceps Farm and start managing your cultivation.</p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm text-forest-muted mb-1.5 font-medium">First Name</label>
                                <input name="first_name" value={form.first_name} onChange={handleChange}
                                    className="input-scada w-full" required />
                            </div>
                            <div>
                                <label className="block text-sm text-forest-muted mb-1.5 font-medium">Last Name</label>
                                <input name="last_name" value={form.last_name} onChange={handleChange}
                                    className="input-scada w-full" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-forest-muted mb-1.5 font-medium">Email</label>
                            <input type="email" name="email" value={form.email} onChange={handleChange}
                                className="input-scada w-full" required />
                        </div>
                        <div>
                            <label className="block text-sm text-forest-muted mb-1.5 font-medium">Mobile</label>
                            <input name="mobile_number" value={form.mobile_number} onChange={handleChange}
                                className="input-scada w-full" required />
                        </div>
                        <div>
                            <label className="block text-sm text-forest-muted mb-1.5 font-medium">Password</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                                    className="input-scada w-full pr-11" required minLength={8} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-muted/50 hover:text-forest-cream transition-colors">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full py-3.5 rounded-xl font-semibold disabled:opacity-50 transition-all active:scale-[0.98] text-white relative overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, #1b4332, #2d6a4f, #40916c)',
                                boxShadow: '0 4px 25px rgba(74, 222, 128, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                            }}>
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Growing your roots...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Leaf className="w-4 h-4" /> Create Account
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-forest-border/15">
                        <p className="text-center text-sm text-forest-muted">
                            Already have an account?{' '}
                            <Link to="/login" className="text-forest-spring hover:text-forest-accent font-semibold transition-colors">Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
