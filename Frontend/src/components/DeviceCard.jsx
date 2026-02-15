import { Wifi, WifiOff, MapPin, Cpu, Key } from 'lucide-react';

const DeviceCard = ({ device, onRegenerateKey }) => {
    const isOnline = device.status === 'ONLINE';

    return (
        <div className="glass-card p-6 rounded-2xl group border border-white/5 hover:border-scada-accent/40 relative overflow-hidden">
            {/* Status glow effect */}
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${isOnline ? 'from-emerald-500/20' : 'from-rose-500/20'} to-transparent blur-2xl rounded-full opacity-50 pointer-events-none -mr-10 -mt-10 group-hover:opacity-100 transition-opacity duration-500`} />

            <div className="flex justify-between items-start mb-5 relative z-10">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl shadow-lg ${isOnline ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 text-emerald-400' : 'bg-gradient-to-br from-rose-500/20 to-rose-600/10 text-rose-400'}`}>
                        <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg tracking-tight group-hover:text-blue-300 transition-colors">{device.name}</h3>
                        <p className="text-xs text-slate-500 font-mono tracking-wide mt-0.5 uppercase">{device.device_id}</p>
                    </div>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-sm ${isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                    {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {device.status}
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                <div className="flex items-center text-sm text-slate-400">
                    <MapPin className="w-4 h-4 mr-2.5 text-slate-500" />
                    <span className="font-medium">{device.location}</span>
                </div>

                <div className="bg-black/30 rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors group/key">
                    <div className="flex items-center gap-2 mb-1">
                        <Key className="w-3 h-3 text-slate-500" />
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">API Key</span>
                    </div>
                    <p className="text-xs font-mono text-slate-300 break-all select-all selection:bg-scada-accent selection:text-white">
                        {device.api_key}
                    </p>
                </div>
            </div>

            {onRegenerateKey && (
                <button
                    onClick={() => onRegenerateKey(device.id)}
                    className="mt-5 w-full py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition-all"
                >
                    Regenerate Credentials
                </button>
            )}
        </div>
    );
};

export default DeviceCard;
