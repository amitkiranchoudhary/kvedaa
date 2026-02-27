import { Store, Phone, Mail, MapPin, Leaf, TreePine } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
    return (
        <div className="min-h-screen bg-forest-darkest text-forest-text font-sans relative overflow-hidden pt-32 pb-24">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[10%] w-[50%] h-[50%] rounded-full bg-emerald-700/[0.04] blur-[150px]" />
                <div className="absolute bottom-[0%] left-[5%] w-[40%] h-[40%] rounded-full bg-forest-gold/[0.03] blur-[120px]" />
                <div className="absolute inset-0 opacity-[0.02] nature-dots" />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-forest-border/20 shadow-lg"
                style={{ background: 'linear-gradient(180deg, rgba(5, 13, 5, 0.95), rgba(5, 13, 5, 0.88))', backdropFilter: 'blur(20px)' }}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/store" className="flex items-center">
                        <img src="/assets/kvedaa-logo.png" alt="KiranVedaa" className="h-28 w-auto object-contain"
                            style={{ filter: 'drop-shadow(0 0 10px rgba(124, 179, 66, 0.35)) brightness(1.1)' }} />
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link to="/store" className="text-sm text-forest-muted hover:text-forest-cream transition-colors">Home</Link>
                        <Link to="/products" className="text-sm text-forest-muted hover:text-forest-cream transition-colors">Products</Link>
                        <Link to="/quality" className="text-sm text-forest-muted hover:text-forest-cream transition-colors">Quality</Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <span className="text-5xl block mb-4">🌿</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-forest-cream font-display mb-4">About KiranVedaa</h1>
                    <p className="text-lg text-forest-muted">Pioneering pure cultivation and advanced agricultural practices.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div className="p-8 rounded-3xl border border-forest-border/20"
                        style={{ background: 'linear-gradient(135deg, rgba(26, 58, 26, 0.3), rgba(15, 33, 15, 0.25))' }}>
                        <h2 className="text-2xl font-bold text-forest-cream mb-4 font-display flex items-center gap-2">
                            <TreePine className="w-6 h-6 text-forest-spring" /> Our Story
                        </h2>
                        <p className="text-forest-muted leading-relaxed mb-4">
                            KiranVedaa (KVedaa) was founded with a singular vision: to bridge the gap between ancient natural wellness and modern precision agriculture. We specialize in the controlled cultivation of high-value medicinal flora, notably Cordyceps Militaris and Black Turmeric.
                        </p>
                        <p className="text-forest-muted leading-relaxed">
                            Through our advanced SCADA-driven Antigravity Hub, we ensure perfect environmental conditions for every batch, guaranteeing unprecedented purity and potency.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl border border-forest-border/20"
                        style={{ background: 'linear-gradient(135deg, rgba(26, 58, 26, 0.3), rgba(15, 33, 15, 0.25))' }}>
                        <h2 className="text-2xl font-bold text-forest-cream mb-6 font-display flex items-center gap-2">
                            <Phone className="w-6 h-6 text-forest-gold" /> Contact Info
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-forest-muted">
                                <div className="p-3 rounded-full bg-forest-card/30"><MapPin className="w-5 h-5 text-forest-spring" /></div>
                                <div>
                                    <p className="font-bold text-forest-cream text-sm">Main Facility</p>
                                    <p className="text-sm">Sector 42, Green Valley, India</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-forest-muted">
                                <div className="p-3 rounded-full bg-forest-card/30"><Mail className="w-5 h-5 text-forest-spring" /></div>
                                <div>
                                    <p className="font-bold text-forest-cream text-sm">Email Support</p>
                                    <p className="text-sm">contact@kvedaa.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-forest-muted">
                                <div className="p-3 rounded-full bg-forest-card/30"><Phone className="w-5 h-5 text-forest-spring" /></div>
                                <div>
                                    <p className="font-bold text-forest-cream text-sm">Phone Inquiries</p>
                                    <p className="text-sm">+91 98765 43210</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
