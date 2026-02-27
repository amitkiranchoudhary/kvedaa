import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Droplets, Microscope } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QUALITY_DATA = [
    {
        id: 'cordyceps',
        title: 'Cordyceps Militaris',
        icon: '🍄',
        info: 'Our Cordyceps militaris is grown in our state-of-the-art Antigravity Hub under highly precise, computer-controlled SCADA parameters. This ensures optimal fruiting body development, free from heavy metals or contaminations.',
        benefits: ['High Cordycepin levels', '100% sterile indoor cultivation', 'Lab-verified active compounds', 'Sustainably harvested'],
        image: 'https://images.unsplash.com/photo-1614059438018-87ddf3b17431?w=600&h=400&fit=crop',
    },
    {
        id: 'turmeric',
        title: 'Black Turmeric',
        icon: '🌑',
        info: 'KiranVedaa Black Turmeric (Curcuma caesia) is known for its intense dark hue and high concentration of unique antioxidants. We cultivate it using organic soil amendments without any harsh chemical fertilizers.',
        benefits: ['Pesticide-free organic growth', 'Premium soil nutrition', 'Deep blue-black rhizomes', 'Intact essential oils'],
        image: 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=600&h=400&fit=crop',
    },
    {
        id: 'musli',
        title: 'White Musli',
        icon: '🪴',
        info: 'Safed Musli is carefully nurtured to ensure the maximum development of active saponins. The roots are meticulously hand-harvested and sun-dried to lock in their adaptogenic properties.',
        benefits: ['High saponin content', 'Traditional sun-drying process', 'Non-GMO seeds', 'Exceptional purity'],
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=400&fit=crop',
    },
    {
        id: 'cannabis',
        title: 'Medical Cannabis',
        icon: '🌿',
        info: 'Cultivated strictly under regulatory compliance, our medical cannabis emphasizes stable cannabinoid profiles and complete absence of molds or pathogens, ensuring safety for clinical use.',
        benefits: ['Strict SCADA environmental control', 'Consistent Cannabinoid Profiles', 'Pathogen and Mold Free', 'Medical-Grade Quality'],
        image: 'https://images.unsplash.com/photo-1603903631889-b5f3ba4d5b9b?w=600&h=400&fit=crop',
    },
];

export default function Quality() {
    const [activeTab, setActiveTab] = useState(QUALITY_DATA[0]);

    return (
        <div className="min-h-screen bg-forest-darkest text-forest-text font-sans relative overflow-hidden pt-32 pb-24">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-forest-gold/[0.04] blur-[150px]" />
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
                        <Link to="/about" className="text-sm text-forest-muted hover:text-forest-cream transition-colors">About Us</Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <span className="text-5xl block mb-4">✨</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-forest-cream font-display mb-4">Quality & Purity</h1>
                    <p className="text-lg text-forest-muted max-w-2xl mx-auto">
                        Explore our commitment to excellence across our major product lines. We merge rigorous lab testing with advanced SCADA monitoring.
                    </p>
                </div>

                {/* Tabs Array */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
                    {QUALITY_DATA.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${activeTab.id === tab.id
                                ? 'bg-forest-card/60 text-forest-spring border border-forest-spring/40 shadow-lg scale-105'
                                : 'bg-transparent text-forest-muted border border-forest-border/20 hover:text-forest-cream hover:bg-forest-card/30'
                                }`}
                        >
                            <span className="text-xl">{tab.icon}</span> {tab.title}
                        </button>
                    ))}
                </div>

                {/* Tab Content Area */}
                <div className="relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="absolute inset-0"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-forest-card/20 border border-forest-border/20 rounded-3xl p-8 overflow-hidden relative">
                                {/* Decor */}
                                <div className="absolute -top-32 -right-32 w-64 h-64 bg-forest-spring/10 blur-[100px] rounded-full pointer-events-none" />

                                <div className="space-y-6">
                                    <h2 className="text-3xl font-display font-bold text-forest-cream flex items-center gap-3">
                                        <span className="text-4xl">{activeTab.icon}</span> {activeTab.title}
                                    </h2>
                                    <p className="text-forest-muted text-lg leading-relaxed">{activeTab.info}</p>

                                    <div className="mt-8 space-y-4">
                                        <h3 className="text-sm font-bold tracking-widest text-forest-spring uppercase">Key Quality Metrics</h3>
                                        <ul className="space-y-3">
                                            {activeTab.benefits.map((benefit, i) => (
                                                <li key={i} className="flex items-center gap-3 text-forest-mist">
                                                    <div className="p-1.5 rounded-full bg-forest-spring/20 text-forest-spring">
                                                        <Shield className="w-3.5 h-3.5" />
                                                    </div>
                                                    {benefit}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="rounded-2xl overflow-hidden border border-forest-border/30 h-80 md:h-full relative shadow-2xl">
                                    <img src={activeTab.image} alt={activeTab.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-forest-darkest/80 TO-transparent" />
                                    <div className="absolute bottom-6 left-6 flex gap-3">
                                        <div className="bg-forest-darkest/80 border border-forest-spring/30 backdrop-blur-md p-3 rounded-xl flex items-center gap-2">
                                            <Microscope className="w-5 h-5 text-emerald-400" />
                                            <span className="text-xs font-bold text-forest-cream uppercase tracking-wider">Tested</span>
                                        </div>
                                        <div className="bg-forest-darkest/80 border border-forest-gold/30 backdrop-blur-md p-3 rounded-xl flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-amber-400" />
                                            <span className="text-xs font-bold text-forest-cream uppercase tracking-wider">Premium</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
