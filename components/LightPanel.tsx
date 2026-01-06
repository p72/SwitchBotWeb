import React from 'react';
import { sendCommand } from '../services/switchBotApi';
import { SwitchBotCredentials, SwitchBotDevice } from '../types';

interface LightPanelProps {
  devices: SwitchBotDevice[];
  credentials: SwitchBotCredentials;
  onLog: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const LightPanel: React.FC<LightPanelProps> = ({ devices, credentials, onLog }) => {
  
  const handleCommand = async (device: SwitchBotDevice, command: string) => {
    const result = await sendCommand(credentials, device.deviceId, command);
    if (result.success) {
      onLog('success', `${device.deviceName}: ${command === 'turnOn' ? 'ON' : 'OFF'}`);
    } else {
      onLog('error', `${device.deviceName}: Failed - ${result.message}`);
    }
  };

  if (devices.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center text-gray-500">
        No Light devices found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4 px-2">
         💡 Lights ({devices.length})
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {devices.map((device) => (
          <div key={device.deviceId} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col justify-between h-40">
             <div className="mb-2">
               <h4 className="font-bold text-lg text-gray-800 truncate" title={device.deviceName}>{device.deviceName}</h4>
               <span className="text-xs text-gray-400 uppercase">{device.deviceType || device.remoteType}</span>
             </div>
             
             <div className="flex gap-2">
                <button
                  onClick={() => handleCommand(device, 'turnOn')}
                  className="flex-1 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg font-bold transition flex items-center justify-center gap-2"
                >
                  ☀️ ON
                </button>
                <button
                  onClick={() => handleCommand(device, 'turnOff')}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition flex items-center justify-center gap-2"
                >
                  🌑 OFF
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};