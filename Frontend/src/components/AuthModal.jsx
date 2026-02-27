import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TreePine, Leaf, Eye, EyeOff, X, User, ShieldCheck, Sparkles, KeyRound, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authAPI } from '../services/api';

/* ═══════════════════════════════════════════════════════
   🌿 AUTH MODAL — Premium Login / Signup Popup
   Shows when a customer or owner visits the page.
   Glassmorphic forest-themed design with tabbed interface.
   ═══════════════════════════════════════════════════════ */

export default function AuthModal({ open, onClose, onLogin }) {
    const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup' | 'forgot'
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Login fields
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Signup fields
    const [signupForm, setSignupForm] = useState({
        first_name: '', last_name: '', email: '', mobile_number: '', password: ''
    });

    // Forgot password fields
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotStep, setForgotStep] = useState(1); // 1 = enter email, 2 = enter OTP + new password
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleSignupChange = (e) => {
        setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
    };

    const switchTab = (tab) => {
        setActiveTab(tab);
        setError('');
        setSuccess('');
        setShowPassword(false);
        if (tab !== 'forgot') {
            setForgotStep(1);
            setOtp('');
            setNewPassword('');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await authAPI.login({ email: loginEmail, password: loginPassword });
            const { access_token, user } = res.data;
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));
            if (onLogin) onLogin(user, access_token);
            onClose();
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await authAPI.signup(signupForm);
            const { access_token, user } = res.data;
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));
            if (onLogin) onLogin(user, access_token);
            onClose();
        } catch (err) {
            setError(err.response?.data?.detail || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ─── Forgot Password: Step 1 — Send OTP ───
    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const res = await authAPI.forgotPassword({ email: forgotEmail });
            const msg = res.data?.message || 'OTP sent to your email! Check your inbox.';
            setSuccess(msg);
            // If backend returns OTP directly (dev mode / email not configured), auto-fill it
            if (res.data?.otp) {
                setOtp(res.data.otp);
            }
            setForgotStep(2);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to send OTP. Please check your email.');
        } finally {
            setLoading(false);
        }
    };

    // ─── Forgot Password: Step 2 — Reset with OTP ───
    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            await authAPI.resetPasswordOTP({ email: forgotEmail, otp, new_password: newPassword, confirm_password: newPassword });
            setSuccess('Password reset successfully! You can now sign in.');
            setTimeout(() => {
                switchTab('login');
                setSuccess('');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Reset failed. Please check your OTP.');
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    /* shared input style — bigger, clearer */
    const inputClass = "input-scada w-full text-lg py-3.5 px-4";

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    style={{ background: 'rgba(2, 8, 2, 0.8)', backdropFilter: 'blur(16px)' }}
                    onClick={onClose}
                >
                    {/* Ambient glow behind the modal */}
                    <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] rounded-full blur-[200px] pointer-events-none"
                        style={{ background: 'rgba(74, 222, 128, 0.06)' }} />
                    <div className="absolute bottom-[15%] right-[20%] w-[30%] h-[30%] rounded-full blur-[160px] pointer-events-none"
                        style={{ background: 'rgba(245, 124, 0, 0.04)' }} />

                    <motion.div
                        initial={{ scale: 0.88, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.88, opacity: 0, y: 30 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                        className="relative w-full max-w-2xl rounded-[2rem] border overflow-hidden max-h-[95vh] overflow-y-auto custom-scrollbar"
                        style={{
                            background: 'linear-gradient(145deg, rgba(15, 38, 15, 0.96), rgba(8, 20, 8, 0.98))',
                            borderColor: 'rgba(74, 222, 128, 0.12)',
                            boxShadow: '0 40px 120px rgba(0,0,0,0.75), 0 0 100px rgba(74, 222, 128, 0.05), inset 0 1px 0 rgba(74, 222, 128, 0.1)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* ═══ Decorative top bar ═══ */}
                        <div className="h-1.5 w-full"
                            style={{ background: 'linear-gradient(90deg, #1b4332, #2d6a4f, #40916c, #52b788, #f57c00, #ff9800)' }} />

                        {/* ═══ Close Button ═══ */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-3 rounded-xl text-forest-muted/60 hover:text-forest-cream hover:bg-forest-card/30 transition-all z-10"
                            id="auth-modal-close"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* ═══ Header / Logo ═══ */}
                        <div className="px-12 pt-12 pb-4">
                            <div className="flex items-center justify-center mb-7">
                                <img
                                    src="/assets/kvedaa-logo.png"
                                    alt="KiranVedaa — Pure Cultivation"
                                    className="h-24 w-auto object-contain"
                                    style={{
                                        filter: 'drop-shadow(0 0 12px rgba(124, 179, 66, 0.35)) brightness(1.1)',
                                    }}
                                />
                            </div>
                            <p className="text-lg text-forest-muted mb-7 text-center leading-relaxed">
                                {activeTab === 'login'
                                    ? 'Welcome back! Sign in to access your dashboard.'
                                    : 'Create an account to explore our farm products.'}
                            </p>
                        </div>

                        {/* ═══ Tab Switcher ═══ */}
                        <div className="px-12 mb-8">
                            <div className="flex rounded-2xl p-1.5 border"
                                style={{
                                    background: 'rgba(5, 15, 5, 0.6)',
                                    borderColor: 'rgba(74, 222, 128, 0.1)',
                                }}>
                                <button
                                    onClick={() => switchTab('login')}
                                    className={`flex-1 py-3.5 rounded-xl text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2.5 ${activeTab === 'login'
                                        ? 'text-white'
                                        : 'text-forest-muted hover:text-forest-cream'
                                        }`}
                                    style={activeTab === 'login' ? {
                                        background: 'linear-gradient(135deg, #1b4332, #2d6a4f)',
                                        boxShadow: '0 4px 20px rgba(74, 222, 128, 0.2)',
                                    } : {}}
                                    id="auth-tab-login"
                                >
                                    <ShieldCheck className="w-5 h-5" /> Sign In
                                </button>
                                <button
                                    onClick={() => switchTab('signup')}
                                    className={`flex-1 py-3.5 rounded-xl text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2.5 ${activeTab === 'signup'
                                        ? 'text-white'
                                        : 'text-forest-muted hover:text-forest-cream'
                                        }`}
                                    style={activeTab === 'signup' ? {
                                        background: 'linear-gradient(135deg, #1b4332, #2d6a4f)',
                                        boxShadow: '0 4px 20px rgba(74, 222, 128, 0.2)',
                                    } : {}}
                                    id="auth-tab-signup"
                                >
                                    <User className="w-5 h-5" /> Sign Up
                                </button>
                            </div>
                        </div>

                        {/* ═══ Error Message ═══ */}
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="mx-12 mb-5 bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-3.5 rounded-xl text-base flex items-center gap-2"
                                >
                                    <span>⚠️</span> {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ═══ LOGIN FORM ═══ */}
                        <AnimatePresence mode="wait">
                            {activeTab === 'login' && (
                                <motion.form
                                    key="login-form"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.25 }}
                                    onSubmit={handleLogin}
                                    className="px-12 pb-12 space-y-7"
                                >
                                    <div>
                                        <label className="block text-base text-forest-muted mb-2.5 font-medium">Email</label>
                                        <input
                                            type="email"
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                            className={inputClass}
                                            placeholder="your@email.com"
                                            required
                                            id="auth-login-email"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-base text-forest-muted mb-2.5 font-medium">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={loginPassword}
                                                onChange={(e) => setLoginPassword(e.target.value)}
                                                className={`${inputClass} pr-12`}
                                                placeholder="••••••••"
                                                required
                                                id="auth-login-password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-forest-muted/50 hover:text-forest-cream transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Forgot Password Link */}
                                    <div className="flex justify-end -mt-2">
                                        <button
                                            type="button"
                                            onClick={() => switchTab('forgot')}
                                            className="text-sm text-forest-spring/70 hover:text-forest-spring font-medium transition-colors"
                                            id="auth-forgot-link"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-5 rounded-2xl font-bold disabled:opacity-50 transition-all active:scale-[0.98] text-white text-xl relative overflow-hidden"
                                        style={{
                                            background: 'linear-gradient(135deg, #1b4332, #2d6a4f, #40916c)',
                                            boxShadow: '0 6px 30px rgba(74, 222, 128, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
                                        }}
                                        id="auth-login-submit"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Entering the forest...
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                <TreePine className="w-5 h-5" /> Sign In
                                            </span>
                                        )}
                                    </button>

                                    <p className="text-center text-sm text-forest-muted/60 pt-2">
                                        Don't have an account?{' '}
                                        <button type="button" onClick={() => switchTab('signup')}
                                            className="text-forest-spring hover:text-forest-accent font-semibold transition-colors text-base">
                                            Sign Up
                                        </button>
                                    </p>
                                </motion.form>
                            )}

                            {/* ═══ FORGOT PASSWORD FORM ═══ */}
                            {activeTab === 'forgot' && (
                                <motion.div
                                    key="forgot-form"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.25 }}
                                    className="px-12 pb-12"
                                >
                                    {/* Back to login */}
                                    <button
                                        type="button"
                                        onClick={() => switchTab('login')}
                                        className="flex items-center gap-2 text-sm text-forest-muted hover:text-forest-cream transition-colors mb-6 font-medium"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Back to Sign In
                                    </button>

                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.1), rgba(45, 106, 79, 0.15))',
                                                border: '1px solid rgba(74, 222, 128, 0.15)',
                                            }}>
                                            <KeyRound className="w-6 h-6 text-forest-spring" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-forest-cream font-display">
                                                {forgotStep === 1 ? 'Forgot Password' : 'Reset Password'}
                                            </h3>
                                            <p className="text-sm text-forest-muted">
                                                {forgotStep === 1 ? 'We\'ll send you an OTP to reset it.' : 'Enter the OTP and your new password.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Success message */}
                                    {success && (
                                        <div className="mb-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-5 py-3.5 rounded-xl text-base flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> {success}
                                        </div>
                                    )}

                                    {forgotStep === 1 ? (
                                        /* Step 1: Enter email */
                                        <form onSubmit={handleForgotSubmit} className="space-y-6 mt-6">
                                            <div>
                                                <label className="block text-base text-forest-muted mb-2.5 font-medium">Email Address</label>
                                                <div className="relative">
                                                    <input
                                                        type="email"
                                                        value={forgotEmail}
                                                        onChange={(e) => setForgotEmail(e.target.value)}
                                                        className={inputClass}
                                                        placeholder="your@email.com"
                                                        required
                                                        id="auth-forgot-email"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full py-5 rounded-2xl font-bold disabled:opacity-50 transition-all active:scale-[0.98] text-white text-xl relative overflow-hidden"
                                                style={{
                                                    background: 'linear-gradient(135deg, #1b4332, #2d6a4f, #40916c)',
                                                    boxShadow: '0 6px 30px rgba(74, 222, 128, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
                                                }}
                                                id="auth-forgot-submit"
                                            >
                                                {loading ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Sending OTP...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <Mail className="w-5 h-5" /> Send OTP
                                                    </span>
                                                )}
                                            </button>
                                        </form>
                                    ) : (
                                        /* Step 2: Enter OTP + New Password */
                                        <form onSubmit={handleResetSubmit} className="space-y-6 mt-6">
                                            <div>
                                                <label className="block text-base text-forest-muted mb-2.5 font-medium">OTP Code</label>
                                                <input
                                                    type="text"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    className={inputClass}
                                                    placeholder="Enter 6-digit OTP"
                                                    required
                                                    id="auth-reset-otp"
                                                    style={{ letterSpacing: '0.3em', textAlign: 'center', fontWeight: 700 }}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-base text-forest-muted mb-2.5 font-medium">New Password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        className={`${inputClass} pr-12`}
                                                        placeholder="Min 8 characters"
                                                        required
                                                        minLength={8}
                                                        id="auth-reset-password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-forest-muted/50 hover:text-forest-cream transition-colors"
                                                    >
                                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full py-5 rounded-2xl font-bold disabled:opacity-50 transition-all active:scale-[0.98] text-white text-xl relative overflow-hidden"
                                                style={{
                                                    background: 'linear-gradient(135deg, #1b4332, #2d6a4f, #40916c)',
                                                    boxShadow: '0 6px 30px rgba(74, 222, 128, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
                                                }}
                                                id="auth-reset-submit"
                                            >
                                                {loading ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Resetting...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <KeyRound className="w-5 h-5" /> Reset Password
                                                    </span>
                                                )}
                                            </button>

                                            <p className="text-center text-sm text-forest-muted/50">
                                                Didn't receive OTP?{' '}
                                                <button type="button" onClick={() => { setForgotStep(1); setError(''); setSuccess(''); }}
                                                    className="text-forest-spring hover:text-forest-accent font-semibold transition-colors">
                                                    Resend
                                                </button>
                                            </p>
                                        </form>
                                    )}
                                </motion.div>
                            )}


                            {/* ═══ SIGNUP FORM ═══ */}
                            {activeTab === 'signup' && (
                                <motion.form
                                    key="signup-form"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.25 }}
                                    onSubmit={handleSignup}
                                    className="px-12 pb-12 space-y-6"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-base text-forest-muted mb-2 font-medium">First Name</label>
                                            <input
                                                name="first_name"
                                                value={signupForm.first_name}
                                                onChange={handleSignupChange}
                                                className={inputClass}
                                                placeholder="John"
                                                required
                                                id="auth-signup-firstname"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-base text-forest-muted mb-2 font-medium">Last Name</label>
                                            <input
                                                name="last_name"
                                                value={signupForm.last_name}
                                                onChange={handleSignupChange}
                                                className={inputClass}
                                                placeholder="Doe"
                                                required
                                                id="auth-signup-lastname"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-base text-forest-muted mb-2 font-medium">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={signupForm.email}
                                            onChange={handleSignupChange}
                                            className={inputClass}
                                            placeholder="your@email.com"
                                            required
                                            id="auth-signup-email"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-base text-forest-muted mb-2 font-medium">Mobile</label>
                                        <input
                                            name="mobile_number"
                                            value={signupForm.mobile_number}
                                            onChange={handleSignupChange}
                                            className={inputClass}
                                            placeholder="+91 98765 43210"
                                            required
                                            id="auth-signup-mobile"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-base text-forest-muted mb-2 font-medium">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={signupForm.password}
                                                onChange={handleSignupChange}
                                                className={`${inputClass} pr-12`}
                                                placeholder="Min 8 characters"
                                                required
                                                minLength={8}
                                                id="auth-signup-password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-forest-muted/50 hover:text-forest-cream transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-5 rounded-2xl font-bold disabled:opacity-50 transition-all active:scale-[0.98] text-white text-xl relative overflow-hidden"
                                        style={{
                                            background: 'linear-gradient(135deg, #1b4332, #2d6a4f, #40916c)',
                                            boxShadow: '0 6px 30px rgba(74, 222, 128, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
                                        }}
                                        id="auth-signup-submit"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Growing your roots...
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                <Leaf className="w-5 h-5" /> Create Account
                                            </span>
                                        )}
                                    </button>

                                    <p className="text-center text-sm text-forest-muted/60 pt-1">
                                        Already have an account?{' '}
                                        <button type="button" onClick={() => switchTab('login')}
                                            className="text-forest-spring hover:text-forest-accent font-semibold transition-colors text-base">
                                            Sign In
                                        </button>
                                    </p>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        {/* ═══ Bottom trust strip ═══ */}
                        <div className="px-12 pb-10">
                            <div className="flex items-center justify-center gap-5 text-xs text-forest-muted/40 uppercase tracking-wider">
                                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Secure</span>
                                <span>•</span>
                                <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> Encrypted</span>
                                <span>•</span>
                                <span className="flex items-center gap-1.5"><Leaf className="w-4 h-4" /> KVedaa</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
