import React, { useState, useEffect } from 'react';
import { sendCommand } from '../services/switchBotApi';
import { SwitchBotCredentials, SwitchBotDevice } from '../types';

interface TvPanelProps {
  devices: SwitchBotDevice[];
  credentials: SwitchBotCredentials;
  onLog: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const TvPanel: React.FC<TvPanelProps> = ({ devices, credentials, onLog }) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  useEffect(() => {
    if (devices.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(devices[0].deviceId);
    }
  }, [devices, selectedDeviceId]);

  const handleCommand = async (command: string) => {
    if (!selectedDeviceId) {
      onLog('error', 'No TV selected.');
      return;
    }

    const deviceName = devices.find(d => d.deviceId === selectedDeviceId)?.deviceName || 'TV';

    const result = await sendCommand(credentials, selectedDeviceId, command);
    if (result.success) {
      onLog('success', `${deviceName}: Command sent (${command})`);
    } else {
      onLog('error', result.message);
    }
  };

  if (devices.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center text-gray-500">
        No TV devices found.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 relative">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          📺 TV Control
        </h3>
        
        {devices.length > 1 && (
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
          >
            {devices.map(d => (
              <option key={d.deviceId} value={d.deviceId}>{d.deviceName}</option>
            ))}
          </select>
        )}
        {devices.length === 1 && <span className="text-sm text-gray-500 font-medium py-2">{devices[0].deviceName}</span>}
      </div>
      
      <div className="grid grid-cols-2 gap-6 max-w-sm mx-auto">
        {/* Power */}
        <div className="col-span-2 flex justify-center gap-4 mb-4">
          <button
            onClick={() => handleCommand('turnOn')}
            className="w-32 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-md transition transform active:scale-95"
          >
            ON
          </button>
          <button
            onClick={() => handleCommand('turnOff')}
            className="w-32 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-md transition transform active:scale-95"
          >
            OFF
          </button>
        </div>

        {/* Channel */}
        <div className="flex flex-col gap-3">
          <span className="text-center text-sm font-semibold text-gray-500 uppercase">Channel</span>
          <button
            onClick={() => handleCommand('channelAdd')}
            className="h-16 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-2xl transition"
          >
            +
          </button>
          <button
            onClick={() => handleCommand('channelSub')}
            className="h-16 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-2xl transition"
          >
            -
          </button>
        </div>

        {/* Volume */}
        <div className="flex flex-col gap-3">
          <span className="text-center text-sm font-semibold text-gray-500 uppercase">Volume</span>
          <button
            onClick={() => handleCommand('volumeAdd')}
            className="h-16 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-2xl transition"
          >
            +
          </button>
          <button
            onClick={() => handleCommand('volumeSub')}
            className="h-16 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-2xl transition"
          >
            -
          </button>
        </div>
      </div>
    </div>
  );
};