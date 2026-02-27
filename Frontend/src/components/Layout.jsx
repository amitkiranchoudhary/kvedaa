import Sidebar from './Sidebar';

const Layout = ({ children, user, onLogout }) => {
    return (
        <div className="flex h-screen overflow-hidden font-sans text-forest-text bg-forest-darkest relative">
            {/* ═══ Ambient Forest Background Layers ═══ */}

            {/* Canopy light filtering through */}
            <div className="absolute top-[-20%] left-[5%] w-[55%] h-[55%] rounded-full bg-emerald-600/[0.06] blur-[180px] pointer-events-none animate-bio-glow" />
            <div className="absolute top-[15%] right-[-8%] w-[40%] h-[45%] rounded-full bg-forest-gold/[0.04] blur-[140px] pointer-events-none animate-bio-glow" style={{ animationDelay: '2.5s' }} />
            <div className="absolute bottom-[-15%] left-[25%] w-[45%] h-[40%] rounded-full bg-emerald-800/[0.07] blur-[160px] pointer-events-none animate-bio-glow" style={{ animationDelay: '5s' }} />

            {/* Secondary subtle orbs */}
            <div className="absolute top-[50%] left-[60%] w-[25%] h-[25%] rounded-full bg-forest-spring/[0.03] blur-[120px] pointer-events-none animate-bio-glow" style={{ animationDelay: '3.5s' }} />

            {/* Subtle mist layer */}
            <div className="absolute inset-0 pointer-events-none animate-mist opacity-15"
                style={{ background: 'radial-gradient(ellipse at 30% 70%, rgba(149, 213, 178, 0.08), transparent 65%)' }} />

            {/* Sun ray streaks from top */}
            <div className="absolute top-0 left-[40%] w-[30%] h-[60%] pointer-events-none animate-sun-stream opacity-10"
                style={{
                    background: 'linear-gradient(175deg, rgba(230, 180, 34, 0.12), transparent 70%)',
                    transformOrigin: 'top center',
                }} />

            {/* Nature dot pattern overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.025] nature-dots" />

            <Sidebar user={user} onLogout={onLogout} />

            <main className="flex-1 overflow-y-auto relative z-10 w-full h-full">
                <div className="max-w-7xl mx-auto p-6 md:p-8 page-enter">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
