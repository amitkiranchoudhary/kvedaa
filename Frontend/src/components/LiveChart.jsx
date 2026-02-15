import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/50 p-3 rounded-lg shadow-xl shadow-black/50">
                <p className="text-slate-400 text-xs font-medium mb-1 uppercase tracking-wider">{label}</p>
                <p className="text-white text-lg font-bold flex items-end gap-1">
                    {payload[0].value} <span className="text-xs text-slate-500 font-medium mb-1">{payload[0].unit}</span>
                </p>
            </div>
        );
    }
    return null;
};

const LiveChart = ({ data, metric, color = "#3B82F6", unit = "" }) => {
    return (
        <div className="h-[320px] w-full flex flex-col">
            <div className="flex justify-between items-center mb-6 pl-4 pr-4 pt-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{metric}</h3>
                <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Live</span>
                </div>
            </div>

            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`color${metric}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                        <XAxis
                            dataKey="timestamp"
                            hide
                            padding={{ left: 0, right: 0 }}
                        />
                        <YAxis
                            stroke="#64748b"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            width={40}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeDasharray: '4 4' }} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill={`url(#color${metric})`}
                            unit={unit}
                            isAnimationActive={false}
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#fff', shadow: '0 0 10px white' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default LiveChart;
