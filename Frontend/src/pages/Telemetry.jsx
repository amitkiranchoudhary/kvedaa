import { useState, useEffect } from 'react';
import { telemetryAPI, deviceAPI } from '../services/api';

export default function Telemetry() {
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState('');
    const [telemetryData, setTelemetryData] = useState([]);
    const [latestReading, setLatestReading] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Push telemetry form
    const [showPush, setShowPush] = useState(false);
    const [pushForm, setPushForm] = useState({
        device_id: '', api_key: '', metric_type: 'energy',
        voltage: '', amperage: '', kwh: '',
        temperature_c: '', co2_ppm: '', humidity_pct: ''
    });

    useEffect(() => {
        deviceAPI.getAll().then(res => setDevices(res.data.devices || [])).catch(() => { });
    }, []);

    const fetchTelemetry = async (deviceId) => {
        try {
            setLoading(true);
            setSelectedDevice(deviceId);
            const [dataRes, latestRes] = await Promise.allSettled([
                telemetryAPI.getByDevice(deviceId, 20),
                telemetryAPI.getLatest(deviceId)
            ]);
            if (dataRes.status === 'fulfilled') setTelemetryData(dataRes.value.data.data || []);
            if (latestRes.status === 'fulfilled') setLatestReading(latestRes.value.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load telemetry');
        } finally {
            setLoading(false);
        }
    };

    const handlePush = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        try {
            const payload = { device_id: pushForm.device_id };
            if (pushForm.metric_type === 'energy') {
                payload.metrics = {};
                if (pushForm.voltage) payload.metrics.voltage = parseFloat(pushForm.voltage);
                if (pushForm.amperage) payload.metrics.amperage = parseFloat(pushForm.amperage);
                if (pushForm.kwh) payload.metrics.kwh = parseFloat(pushForm.kwh);
            } else {
                payload.readings = {};
                if (pushForm.temperature_c) payload.readings.temperature_c = parseFloat(pushForm.temperature_c);
                if (pushForm.co2_ppm) payload.readings.co2_ppm = parseFloat(pushForm.co2_ppm);
                if (pushForm.humidity_pct) payload.readings.humidity_pct = parseFloat(pushForm.humidity_pct);
            }

            await telemetryAPI.push(payload, pushForm.api_key);
            setSuccess('Telemetry data pushed successfully!');
            if (selectedDevice) fetchTelemetry(selectedDevice);
        } catch (err) {
            setError(err.response?.data?.detail || 'Push failed');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-scada-text">Telemetry</h1>
                <button onClick={() => setShowPush(!showPush)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium">
                    {showPush ? 'Cancel' : '📡 Push Test Data'}
                </button>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded mb-4 text-sm">{error}
                <button onClick={() => setError('')} className="ml-2">✕</button></div>}
            {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2 rounded mb-4 text-sm">{success}
                <button onClick={() => setSuccess('')} className="ml-2">✕</button></div>}

            {/* Push Test Data Form */}
            {showPush && (
                <div className="bg-scada-panel border border-scada-border rounded-lg p-4 mb-6">
                    <h2 className="text-lg font-medium text-scada-text mb-3">Push Test Telemetry Data</h2>
                    <p className="text-xs text-scada-muted mb-3">Simulate an IoT device sending data. You need the device's hardware ID and API key.</p>
                    <form onSubmit={handlePush} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input placeholder="Hardware Device ID (MAC)" value={pushForm.device_id}
                                onChange={(e) => setPushForm({ ...pushForm, device_id: e.target.value })}
                                className="px-3 py-2 bg-scada-dark border border-scada-border rounded text-scada-text" required />
                            <input placeholder="API Key" value={pushForm.api_key}
                                onChange={(e) => setPushForm({ ...pushForm, api_key: e.target.value })}
                                className="px-3 py-2 bg-scada-dark border border-scada-border rounded text-scada-text" required />
                            <select value={pushForm.metric_type}
                                onChange={(e) => setPushForm({ ...pushForm, metric_type: e.target.value })}
                                className="px-3 py-2 bg-scada-dark border border-scada-border rounded text-scada-text">
                                <option value="energy">Energy Metrics</option>
                                <option value="environment">Environmental Readings</option>
                            </select>
                        </div>
                        {pushForm.metric_type === 'energy' ? (
                            <div className="grid grid-cols-3 gap-3">
                                <input type="number" step="0.01" placeholder="Voltage (V)" value={pushForm.voltage}
                                    onChange={(e) => setPushForm({ ...pushForm, voltage: e.target.value })}
                                    className="px-3 py-2 bg-scada-dark border border-scada-border rounded text-scada-text" />
                                <input type="number" step="0.01" placeholder="Amperage (A)" value={pushForm.amperage}
                                    onChange={(e) => setPushForm({ ...pushForm, amperage: e.target.value })}
                                    className="px-3 py-2 bg-scada-dark border border-scada-border rounded text-scada-text" />
                                <input type="number" step="0.01" placeholder="kWh" value={pushForm.kwh}
                                    onChange={(e) => setPushForm({ ...pushForm, kwh: e.target.value })}
                                    className="px-3 py-2 bg-scada-dark border border-scada-border rounded text-scada-text" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-3">
                                <input type="number" step="0.1" placeholder="Temperature (°C)" value={pushForm.temperature_c}
                                    onChange={(e) => setPushForm({ ...pushForm, temperature_c: e.target.value })}
                                    className="px-3 py-2 bg-scada-dark border border-scada-border rounded text-scada-text" />
                                <input type="number" step="1" placeholder="CO₂ (ppm)" value={pushForm.co2_ppm}
                                    onChange={(e) => setPushForm({ ...pushForm, co2_ppm: e.target.value })}
                                    className="px-3 py-2 bg-scada-dark border border-scada-border rounded text-scada-text" />
                                <input type="number" step="0.1" placeholder="Humidity (%)" value={pushForm.humidity_pct}
                                    onChange={(e) => setPushForm({ ...pushForm, humidity_pct: e.target.value })}
                                    className="px-3 py-2 bg-scada-dark border border-scada-border rounded text-scada-text" />
                            </div>
                        )}
                        <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium">
                            Push Data
                        </button>
                    </form>
                </div>
            )}

            {/* Device Selector */}
            <div className="bg-scada-panel border border-scada-border rounded-lg p-4 mb-6">
                <h2 className="text-sm font-medium text-scada-muted mb-2">Select a device to view telemetry</h2>
                <div className="flex flex-wrap gap-2">
                    {devices.map(d => (
                        <button key={d.id} onClick={() => fetchTelemetry(d.id)}
                            className={`px-3 py-1 rounded text-sm border ${selectedDevice === d.id
                                ? 'bg-scada-accent border-scada-accent text-white'
                                : 'bg-scada-dark border-scada-border text-scada-muted hover:text-scada-text'}`}>
                            {d.name}
                        </button>
                    ))}
                    {devices.length === 0 && <p className="text-scada-muted text-sm">No devices found. Register devices first.</p>}
                </div>
            </div>

            {/* Latest Reading */}
            {latestReading && (
                <div className="bg-scada-panel border border-scada-border rounded-lg p-4 mb-6">
                    <h2 className="text-lg font-medium text-scada-text mb-2">Latest Reading</h2>
                    <div className="text-xs text-scada-muted mb-2">{new Date(latestReading.timestamp).toLocaleString()}</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {latestReading.metrics && Object.entries(latestReading.metrics).map(([k, v]) => (
                            <div key={k} className="bg-scada-dark p-3 rounded border border-scada-border">
                                <div className="text-xs text-scada-muted">{k}</div>
                                <div className="text-xl font-bold text-cyan-400">{v}</div>
                            </div>
                        ))}
                        {latestReading.readings && Object.entries(latestReading.readings).map(([k, v]) => (
                            <div key={k} className="bg-scada-dark p-3 rounded border border-scada-border">
                                <div className="text-xs text-scada-muted">{k}</div>
                                <div className="text-xl font-bold text-green-400">{v}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Telemetry History */}
            {loading ? (
                <p className="text-scada-muted">Loading telemetry...</p>
            ) : telemetryData.length > 0 && (
                <div className="bg-scada-panel border border-scada-border rounded-lg p-4">
                    <h2 className="text-lg font-medium text-scada-text mb-2">History (Last {telemetryData.length})</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-scada-border text-left">
                                    <th className="py-2 px-3 text-scada-muted font-medium">Timestamp</th>
                                    <th className="py-2 px-3 text-scada-muted font-medium">Metrics</th>
                                    <th className="py-2 px-3 text-scada-muted font-medium">Readings</th>
                                </tr>
                            </thead>
                            <tbody>
                                {telemetryData.map((t, i) => (
                                    <tr key={i} className="border-b border-scada-border/50">
                                        <td className="py-2 px-3 text-scada-muted text-xs">{new Date(t.timestamp).toLocaleString()}</td>
                                        <td className="py-2 px-3 text-scada-text text-xs">
                                            {t.metrics ? Object.entries(t.metrics).map(([k, v]) => `${k}: ${v}`).join(', ') : '—'}
                                        </td>
                                        <td className="py-2 px-3 text-scada-text text-xs">
                                            {t.readings ? Object.entries(t.readings).map(([k, v]) => `${k}: ${v}`).join(', ') : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
