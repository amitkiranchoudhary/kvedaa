import { Wifi, WifiOff, MapPin, Cpu, Key } from 'lucide-react';

const DeviceCard = ({ device, onRegenerateKey }) => {
    const isOnline = device.status === 'ONLINE';

    return (
        <div className="glass-card p-6 rounded-2xl group border border-forest-border/15 hover:border-forest-spring/25 relative overflow-hidden">
            {/* Nature glow */}
            <div className={`absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12 opacity-0 group-hover:opacity-50 transition-opacity duration-500
                ${isOnline ? 'bg-emerald-500/15' : 'bg-rose-500/10'}`} />

            <div className="flex justify-between items-start mb-5 relative z-10">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-transform duration-300 group-hover:scale-110 ${isOnline
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                        }`}
                        style={{
                            background: isOnline
                                ? 'linear-gradient(135deg, rgba(82, 183, 136, 0.12), rgba(45, 106, 79, 0.08))'
                                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(185, 28, 28, 0.06))',
                            border: isOnline
                                ? '1px solid rgba(82, 183, 136, 0.15)'
                                : '1px solid rgba(239, 68, 68, 0.12)',
                        }}>
                        <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-forest-cream text-lg tracking-tight group-hover:text-forest-glow transition-colors">{device.name}</h3>
                        <p className="text-xs text-forest-muted/50 font-mono tracking-wide mt-0.5 uppercase">{device.device_id}</p>
                    </div>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-sm ${isOnline
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15'
                    : 'bg-rose-500/8 text-rose-400 border-rose-500/15'
                    }`}
                    style={isOnline ? { boxShadow: '0 0 14px rgba(74, 222, 128, 0.18)' } : {}}>
                    {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {device.status}
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                <div className="flex items-center text-sm text-forest-muted">
                    <MapPin className="w-4 h-4 mr-2.5 text-forest-moss" />
                    <span className="font-medium">{device.location}</span>
                </div>

                <div className="rounded-xl p-3.5 border border-forest-border/15 transition-all group-hover:border-forest-border/25"
                    style={{ background: 'linear-gradient(135deg, rgba(5, 13, 5, 0.45), rgba(10, 23, 10, 0.35))' }}>
                    <div className="flex items-center gap-2 mb-1.5">
                        <Key className="w-3 h-3 text-forest-moss/60" />
                        <span className="text-[10px] uppercase font-bold text-forest-muted/50 tracking-wider">API Key</span>
                    </div>
                    <p className="text-xs font-mono text-forest-mist/70 break-all select-all selection:bg-emerald-500/30 selection:text-white">
                        {device.api_key}
                    </p>
                </div>
            </div>

            {onRegenerateKey && (
                <button
                    onClick={() => onRegenerateKey(device.id)}
                    className="mt-5 w-full py-2.5 text-xs font-semibold uppercase tracking-wider text-forest-muted hover:text-forest-cream rounded-xl border border-transparent hover:border-forest-border/25 transition-all"
                    style={{ background: 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(26, 58, 26, 0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    Regenerate Credentials
                </button>
            )}
        </div>
    );
};

export default DeviceCard;
