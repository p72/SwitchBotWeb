import React, { useState, useEffect } from 'react';
import { SwitchBotCredentials, SwitchBotDevice } from '../types';
import { getDevices } from '../services/switchBotApi';

interface ConfigFormProps {
  onSave: (creds: SwitchBotCredentials) => void;
  initialCredentials?: Partial<SwitchBotCredentials>;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({ onSave, initialCredentials }) => {
  const [token, setToken] = useState('');
  const [secret, setSecret] = useState('');
  const [useProxy, setUseProxy] = useState(true);
  
  // Device IDs
  const [acId, setAcId] = useState('');
  const [tvId, setTvId] = useState('');
  const [lightId, setLightId] = useState('');
  const [meterId, setMeterId] = useState('');

  // Device Lists
  const [deviceLists, setDeviceLists] = useState<{
    ac: SwitchBotDevice[];
    tv: SwitchBotDevice[];
    light: SwitchBotDevice[];
    meter: SwitchBotDevice[];
  }>({ ac: [], tv: [], light: [], meter: [] });

  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [deviceFetchError, setDeviceFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCredentials) {
      if (initialCredentials.token) setToken(initialCredentials.token);
      if (initialCredentials.secret) setSecret(initialCredentials.secret);
      if (initialCredentials.useProxy !== undefined) setUseProxy(initialCredentials.useProxy);
      
      if (initialCredentials.deviceId) setAcId(initialCredentials.deviceId);
      if (initialCredentials.tvDeviceId) setTvId(initialCredentials.tvDeviceId);
      if (initialCredentials.lightDeviceId) setLightId(initialCredentials.lightDeviceId);
      if (initialCredentials.meterDeviceId) setMeterId(initialCredentials.meterDeviceId);
    }
  }, [initialCredentials]);

  const handleFetchDevices = async () => {
    if (!token || !secret) {
      setDeviceFetchError('Please enter Token and Secret first.');
      return;
    }
    
    setIsLoadingDevices(true);
    setDeviceFetchError(null);
    
    try {
      const result = await getDevices(token, secret, useProxy);
      if (result.success) {
        setDeviceLists(result.devices);
        
        // Auto-select first devices if none selected
        if (!acId && result.devices.ac.length > 0) setAcId(result.devices.ac[0].deviceId);
        if (!tvId && result.devices.tv.length > 0) setTvId(result.devices.tv[0].deviceId);
        if (!lightId && result.devices.light.length > 0) setLightId(result.devices.light[0].deviceId);
        if (!meterId && result.devices.meter.length > 0) setMeterId(result.devices.meter[0].deviceId);
        
      } else {
        setDeviceFetchError(result.message);
      }
    } catch (e) {
      setDeviceFetchError('Failed to fetch devices.');
    } finally {
      setIsLoadingDevices(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
      token, 
      secret, 
      useProxy, 
      deviceId: acId, 
      tvDeviceId: tvId, 
      lightDeviceId: lightId, 
      meterDeviceId: meterId 
    });
  };

  const DeviceSelect = ({ label, value, onChange, options, placeholder }: any) => (
    <div className="mb-3">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={options.length === 0}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-50 text-sm"
        >
          <option value="">{options.length === 0 ? 'No devices found' : placeholder}</option>
          {options.map((d: SwitchBotDevice) => (
            <option key={d.deviceId} value={d.deviceId}>{d.deviceName}</option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-200">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
        <span>⚙️</span> Settings
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Token</label>
            <input
              type="password"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secret</label>
            <input
              type="password"
              required
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
            />
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-md border border-blue-100 flex items-center justify-between">
           <div className="text-sm text-blue-800">
              {isLoadingDevices ? 'Fetching devices...' : 'Configure your devices below'}
           </div>
           <button
             type="button"
             onClick={handleFetchDevices}
             disabled={isLoadingDevices || !token || !secret}
             className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition"
           >
             {isLoadingDevices ? 'Loading...' : '🔄 Refresh Device List'}
           </button>
        </div>

        {deviceFetchError && (
           <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{deviceFetchError}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 border-gray-100">
           <DeviceSelect 
             label="❄️ Air Conditioner" 
             value={acId} 
             onChange={setAcId} 
             options={deviceLists.ac} 
             placeholder="Select AC..." 
           />
           <DeviceSelect 
             label="📺 TV" 
             value={tvId} 
             onChange={setTvId} 
             options={deviceLists.tv} 
             placeholder="Select TV..." 
           />
           <DeviceSelect 
             label="💡 Light" 
             value={lightId} 
             onChange={setLightId} 
             options={deviceLists.light} 
             placeholder="Select Light..." 
           />
           <DeviceSelect 
             label="🌡️ Meter / Hub" 
             value={meterId} 
             onChange={setMeterId} 
             options={deviceLists.meter} 
             placeholder="Select Meter..." 
           />
        </div>

        <div>
           <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
            <input
              type="checkbox"
              checked={useProxy}
              onChange={(e) => setUseProxy(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            Enable CORS Proxy (Recommended for Web)
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-md transition duration-200"
        >
          Save & Connect
        </button>
      </form>
    </div>
  );
};
