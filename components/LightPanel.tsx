import React from 'react';
import { sendCommand } from '../services/switchBotApi';
import { SwitchBotCredentials } from '../types';

interface LightPanelProps {
  credentials: SwitchBotCredentials;
  onLog: (type: 'success' | 'error', message: string) => void;
}

export const LightPanel: React.FC<LightPanelProps> = ({ credentials, onLog }) => {
  const handleCommand = async (command: string) => {
    if (!credentials.lightDeviceId) {
      onLog('error', 'No Light configured.');
      return;
    }

    const result = await sendCommand(credentials, credentials.lightDeviceId, command);
    if (result.success) {
      onLog('success', `Light Command sent: ${command}`);
    } else {
      onLog('error', result.message);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center text-center">
      <h3 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-2">
        💡 Light Control
      </h3>
      
      <div className="flex gap-6 w-full max-w-sm">
        <button
          onClick={() => handleCommand('turnOn')}
          className="flex-1 py-12 bg-yellow-400 hover:bg-yellow-500 text-white rounded-2xl font-bold text-2xl shadow-lg transition transform active:scale-95 flex flex-col items-center justify-center gap-2"
        >
          <span>☀️</span>
          ON
        </button>
        <button
          onClick={() => handleCommand('turnOff')}
          className="flex-1 py-12 bg-gray-700 hover:bg-gray-800 text-white rounded-2xl font-bold text-2xl shadow-lg transition transform active:scale-95 flex flex-col items-center justify-center gap-2"
        >
          <span>🌑</span>
          OFF
        </button>
      </div>
    </div>
  );
};
