import React from 'react';
import { sendCommand } from '../services/switchBotApi';
import { SwitchBotCredentials } from '../types';

interface TvPanelProps {
  credentials: SwitchBotCredentials;
  onLog: (type: 'success' | 'error', message: string) => void;
}

export const TvPanel: React.FC<TvPanelProps> = ({ credentials, onLog }) => {
  const handleCommand = async (command: string) => {
    if (!credentials.tvDeviceId) {
      onLog('error', 'No TV configured.');
      return;
    }

    const result = await sendCommand(credentials, credentials.tvDeviceId, command);
    if (result.success) {
      onLog('success', `TV Command sent: ${command}`);
    } else {
      onLog('error', result.message);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        📺 TV Control
      </h3>
      
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
