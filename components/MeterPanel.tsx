import React, { useState, useEffect } from 'react';
import { getMeterStatus } from '../services/switchBotApi';
import { SwitchBotCredentials, SwitchBotDevice } from '../types';

interface MeterPanelProps {
  devices: SwitchBotDevice[];
  credentials: SwitchBotCredentials;
  onLog: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const MeterPanel: React.FC<MeterPanelProps> = ({ devices, credentials, onLog }) => {
  // Store data per device ID
  const [meterData, setMeterData] = useState<Record<string, { temp: number; humidity: number }>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const fetchSingleMeter = async (device: SwitchBotDevice) => {
    setLoadingStates(prev => ({ ...prev, [device.deviceId]: true }));
    
    const result = await getMeterStatus(credentials, device.deviceId);
    
    setLoadingStates(prev => ({ ...prev, [device.deviceId]: false }));

    if (result.success && result.data) {
      setMeterData(prev => ({ ...prev, [device.deviceId]: result.data! }));
    } else {
      onLog('error', `${device.deviceName}: Failed to update status.`);
    }
  };

  const fetchAll = () => {
    onLog('info', 'Updating all meters...');
    devices.forEach(d => fetchSingleMeter(d));
  };

  useEffect(() => {
    if (devices.length > 0) {
      fetchAll();
    }
  }, [devices]); // Re-fetch when device list loads

  if (devices.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center text-gray-500">
        No Meter/Hub devices found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          🌡️ Meters ({devices.length})
        </h3>
        <button
          onClick={fetchAll}
          className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium transition"
        >
          Refresh All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {devices.map(device => {
           const data = meterData[device.deviceId];
           const isLoading = loadingStates[device.deviceId];

           return (
             <div key={device.deviceId} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
               <div className="flex justify-between items-start mb-4">
                 <h4 className="font-bold text-lg text-gray-800 truncate flex-1" title={device.deviceName}>
                   {device.deviceName}
                 </h4>
                 <button 
                   onClick={() => fetchSingleMeter(device)}
                   disabled={isLoading}
                   className="ml-2 text-gray-400 hover:text-blue-500 transition"
                 >
                   <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                   </svg>
                 </button>
               </div>

               {data ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-xl text-center">
                    <span className="block text-gray-500 text-xs font-bold uppercase mb-1">Temp</span>
                    <span className="block text-2xl font-extrabold text-blue-600">{data.temp}°C</span>
                  </div>
                  <div className="bg-indigo-50 p-3 rounded-xl text-center">
                    <span className="block text-gray-500 text-xs font-bold uppercase mb-1">Humidity</span>
                    <span className="block text-2xl font-extrabold text-indigo-600">{data.humidity}%</span>
                  </div>
                </div>
               ) : (
                 <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-xl">
                   {isLoading ? 'Loading data...' : 'No Data'}
                 </div>
               )}
             </div>
           );
        })}
      </div>
    </div>
  );
};