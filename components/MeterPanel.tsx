import React, { useState, useEffect } from 'react';
import { getMeterStatus } from '../services/switchBotApi';
import { SwitchBotCredentials } from '../types';

interface MeterPanelProps {
  credentials: SwitchBotCredentials;
  onLog: (type: 'success' | 'error', message: string) => void;
}

export const MeterPanel: React.FC<MeterPanelProps> = ({ credentials, onLog }) => {
  const [data, setData] = useState<{ temp: number; humidity: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    if (!credentials.meterDeviceId) {
      onLog('error', 'No Meter configured.');
      return;
    }

    setIsLoading(true);
    const result = await getMeterStatus(credentials, credentials.meterDeviceId);
    setIsLoading(false);

    if (result.success && result.data) {
      setData(result.data);
      onLog('success', 'Meter status updated.');
    } else {
      onLog('error', result.message);
    }
  };

  useEffect(() => {
    // Initial fetch if available
    if (credentials.meterDeviceId) {
      fetchData();
    }
  }, [credentials.meterDeviceId]);

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          🌡️ Meter Status
        </h3>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-blue-600 transition disabled:opacity-50"
          title="Refresh"
        >
          <svg className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
        </button>
      </div>

      {!credentials.meterDeviceId ? (
         <div className="text-center text-gray-400 py-8">
            No Meter device configured.
         </div>
      ) : data ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-6 rounded-2xl text-center border border-blue-100">
             <span className="block text-4xl mb-2">🌡️</span>
             <span className="block text-gray-500 text-sm font-bold uppercase">Temperature</span>
             <span className="block text-3xl font-extrabold text-blue-600 mt-1">{data.temp}°C</span>
          </div>
          <div className="bg-indigo-50 p-6 rounded-2xl text-center border border-indigo-100">
             <span className="block text-4xl mb-2">💧</span>
             <span className="block text-gray-500 text-sm font-bold uppercase">Humidity</span>
             <span className="block text-3xl font-extrabold text-indigo-600 mt-1">{data.humidity}%</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
           {isLoading ? 'Loading...' : 'Click refresh to get data'}
        </div>
      )}
    </div>
  );
};
