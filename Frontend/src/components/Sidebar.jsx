import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building, Radio, Activity, Bell, BarChart2, LogOut, Beaker, Package, Store, Leaf } from 'lucide-react';

const Sidebar = ({ user, onLogout }) => {
    const location = useLocation();
    const activePath = location.pathname;

    const FARM_ITEMS = [
        { key: '/batches', label: 'Batches', icon: Beaker },
        { key: '/antennary', label: 'Antennary', icon: Package },
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
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden ${isActive
                    ? 'bg-gradient-to-r from-blue-600/20 to-blue-500/5 text-blue-400 border border-blue-500/10 shadow-[inset_2px_0_0_0_#3b82f6]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
            >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span>{item.label}</span>
                {isActive && (
                    <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
                )}
            </Link>
        );
    };

    return (
        <aside className="w-64 h-full flex flex-col glass-panel border-r border-white/5 bg-slate-900/50 backdrop-blur-xl relative z-20 transition-all duration-300">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <Leaf className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">KVedaa</h1>
                    <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold opacity-80">Cordyceps Farm</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                {/* Farm Section */}
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider px-4 pt-2 pb-1">🌱 Farm</p>
                {FARM_ITEMS.map(renderNavItem)}

                {/* Divider */}
                <div className="my-3 border-t border-white/5" />

                {/* SCADA Section */}
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider px-4 pt-1 pb-1">⚡ SCADA</p>
                {SCADA_ITEMS.map(renderNavItem)}

                {/* Divider */}
                <div className="my-3 border-t border-white/5" />

                {/* Store Link */}
                <a href="/store" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all group">
                    <Store className="w-5 h-5 text-emerald-500 group-hover:text-emerald-400" />
                    <span>View Store</span>
                    <span className="ml-auto text-[10px] text-slate-600">↗</span>
                </a>
            </nav>

            {/* User Footer */}
            <div className="p-4 border-t border-white/5 bg-black/20">
                <div className="flex items-center gap-3 mb-4 px-2 p-2 rounded-lg bg-white/5 border border-white/5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-white truncate">{user?.first_name} {user?.last_name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg text-sm text-slate-400 hover:text-red-400 transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

