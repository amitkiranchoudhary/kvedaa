import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building, Radio, Activity, Bell, BarChart2, LogOut, Beaker, Package, Store, TreePine, Leaf, Sparkles } from 'lucide-react';

const Sidebar = ({ user, onLogout }) => {
    const location = useLocation();
    const activePath = location.pathname;

    const FARM_ITEMS = [
        { key: '/batches', label: 'Batches', icon: Beaker },
        { key: '/antennary', label: 'Antigravity', icon: Sparkles },
    ];

    const SCADA_ITEMS = [
        { key: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { key: '/buildings', label: 'Buildings', icon: Building },
        { key: '/devices', label: 'Devices', icon: Radio },
        { key: '/telemetry', label: 'Telemetry', icon: Activity },
        { key: '/alerts', label: 'Alerts', icon: Bell },
        { key: '/analytics', label: 'Analytics', icon: BarChart2 },
    ];

    const renderNavItem = (item) => {
        const Icon = item.icon;
        const isActive = activePath === item.key;
        return (
            <Link
                key={item.key}
                to={item.key}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden ${isActive
                    ? 'text-emerald-300 border border-emerald-500/15'
                    : 'text-forest-muted hover:text-forest-text hover:bg-forest-card/30'
                    }`}
                style={isActive ? {
                    background: 'linear-gradient(135deg, rgba(27, 67, 50, 0.35), rgba(45, 106, 79, 0.15))',
                    boxShadow: 'inset 3px 0 0 0 #4ade80, 0 0 20px rgba(74, 222, 128, 0.06)',
                } : undefined}
            >
                <Icon className={`w-5 h-5 transition-all duration-300 ${isActive
                    ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]'
                    : 'text-forest-muted/60 group-hover:text-forest-sage'
                    }`} />
                <span className="tracking-wide">{item.label}</span>
                {isActive && (
                    <>
                        <div className="absolute inset-0 bg-emerald-500/[0.02] pointer-events-none" />
                        <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-live-pulse" />
                    </>
                )}
            </Link>
        );
    };

    return (
        <aside className="w-64 h-full flex flex-col border-r border-forest-border/20 relative z-20 transition-all duration-300"
            style={{
                background: 'linear-gradient(180deg, rgba(10, 23, 10, 0.92), rgba(5, 13, 5, 0.98))',
                backdropFilter: 'blur(20px)',
                boxShadow: '1px 0 30px rgba(0, 0, 0, 0.3)',
            }}>

            {/* ═══ Ambient sidebar glow ═══ */}
            <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% -20%, rgba(74, 222, 128, 0.06), transparent 70%)' }} />

            {/* ═══ Header — KiranVedaa Brand ═══ */}
            <div className="p-5 border-b border-forest-border/15 flex items-center justify-center relative">
                <img src="/assets/kvedaa-logo.png" alt="KiranVedaa — Pure Cultivation"
                    className="h-14 w-auto object-contain"
                    style={{
                        filter: 'drop-shadow(0 0 10px rgba(124, 179, 66, 0.3)) brightness(1.1)',
                    }} />
            </div>

            {/* ═══ Navigation ═══ */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                {/* Farm Section */}
                <p className="text-[10px] font-bold text-forest-moss/70 uppercase tracking-[0.18em] px-4 pt-3 pb-1.5 flex items-center gap-1.5">
                    <span className="text-xs">🌱</span> Farm
                </p>
                {FARM_ITEMS.map(renderNavItem)}

                {/* Forest Divider */}
                <div className="my-4 forest-divider" />

                {/* SCADA Section */}
                <p className="text-[10px] font-bold text-forest-moss/70 uppercase tracking-[0.18em] px-4 pt-1 pb-1.5 flex items-center gap-1.5">
                    <span className="text-xs">🌿</span> SCADA
                </p>
                {SCADA_ITEMS.map(renderNavItem)}

                {/* Forest Divider */}
                <div className="my-4 forest-divider" />

                {/* Store Link */}
                <a href="/store" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-forest-gold hover:text-amber-300 transition-all group"
                    style={{ background: 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(230, 180, 34, 0.06)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <Store className="w-5 h-5 text-forest-gold/80 group-hover:text-amber-400 group-hover:drop-shadow-[0_0_8px_rgba(230,180,34,0.4)] transition-all duration-300" />
                    <span>View Store</span>
                    <span className="ml-auto text-[10px] text-forest-muted/40 group-hover:text-forest-gold/60 transition-colors">↗</span>
                </a>
            </nav>

            {/* ═══ User Footer ═══ */}
            <div className="p-4 border-t border-forest-border/15 relative"
                style={{ background: 'linear-gradient(180deg, transparent, rgba(5, 13, 5, 0.5))' }}>
                <div className="flex items-center gap-3 mb-3 px-2 p-2.5 rounded-xl border border-forest-border/15 transition-all hover:border-forest-border/30"
                    style={{ background: 'linear-gradient(135deg, rgba(26, 58, 26, 0.25), rgba(19, 42, 19, 0.2))' }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-emerald-200 font-bold text-sm"
                        style={{
                            background: 'linear-gradient(135deg, #1b4332, #2d6a4f)',
                            border: '1px solid rgba(74, 222, 128, 0.15)',
                            boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.2)',
                        }}>
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-forest-cream truncate">{user?.first_name} {user?.last_name}</p>
                        <p className="text-[11px] text-forest-muted truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:text-white transition-all bg-rose-500/[0.08] border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/40 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
