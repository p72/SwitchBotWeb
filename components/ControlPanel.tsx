import React, { useState, useEffect } from 'react';
import { AcMode, AcState, FanSpeed, PowerState, SwitchBotDevice } from '../types';
import { MODE_LABELS, FAN_LABELS } from '../constants';

interface ControlPanelProps {
  devices: SwitchBotDevice[];
  state: AcState;
  onChange: (newState: AcState) => void;
  onApply: (deviceId: string) => void;
  isLoading: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ devices, state, onChange, onApply, isLoading }) => {
  
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  useEffect(() => {
    if (devices.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(devices[0].deviceId);
    }
  }, [devices, selectedDeviceId]);

  const updateState = (key: keyof AcState, value: any) => {
    onChange({ ...state, [key]: value });
  };

  // Temperature Controls
  const handleTempChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateState('temperature', parseInt(e.target.value, 10));
  };
  
  const incrementTemp = () => {
    if (state.temperature < 30) updateState('temperature', state.temperature + 1);
  };

  const decrementTemp = () => {
    if (state.temperature > 16) updateState('temperature', state.temperature - 1);
  };

  const getActiveClass = (isActive: boolean, colorClass: string) => 
    isActive 
      ? `${colorClass} text-white shadow-md transform scale-105` 
      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50';

  if (devices.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center text-gray-500">
        No Air Conditioner devices found. Check your SwitchBot app to ensure you have an AC configured via Hub.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl space-y-8 border border-gray-100 relative">
      
      {/* Device Selector */}
      <div className="absolute top-6 right-6 z-10">
        <select
          value={selectedDeviceId}
          onChange={(e) => setSelectedDeviceId(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 font-medium"
        >
          {devices.map(d => (
            <option key={d.deviceId} value={d.deviceId}>Target: {d.deviceName}</option>
          ))}
        </select>
      </div>

      {/* 1. Temperature Section */}
      <section className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
            🌡️ Temperature
          </h3>
          <span className="text-3xl font-extrabold text-brand-temp">
            {state.temperature}°C
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={decrementTemp}
            className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 transition"
          >-</button>
          <input
            type="range"
            min="16"
            max="30"
            value={state.temperature}
            onChange={handleTempChange}
            className="flex-grow h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <button 
            onClick={incrementTemp}
            className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 transition"
          >+</button>
        </div>
      </section>

      {/* 2. Mode Section */}
      <section>
        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          🔄 Mode
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {Object.values(AcMode).map((mode) => (
            <button
              key={mode}
              onClick={() => updateState('mode', mode)}
              className={`py-3 px-2 rounded-xl text-sm font-semibold flex flex-col items-center justify-center gap-1 transition-all duration-200 ${getActiveClass(state.mode === mode, 'bg-green-500')}`}
            >
              <span className="text-xl">{MODE_LABELS[mode].icon}</span>
              <span>{MODE_LABELS[mode].label.split('(')[0]}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Fan Speed Section */}
      <section>
        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          🌪️ Fan Speed
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.values(FanSpeed).map((speed) => (
            <button
              key={speed}
              onClick={() => updateState('fanSpeed', speed)}
              className={`py-3 px-2 rounded-xl text-sm font-semibold flex flex-col items-center justify-center gap-1 transition-all duration-200 ${getActiveClass(state.fanSpeed === speed, 'bg-orange-400')}`}
            >
              <span className="text-xl">{FAN_LABELS[speed].icon}</span>
              <span>{FAN_LABELS[speed].label.split('(')[0]}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Power Section */}
      <section>
        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          🔌 Power
        </h3>
        <div className="flex gap-4">
          <button
            onClick={() => updateState('power', PowerState.ON)}
            className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              state.power === PowerState.ON 
                ? 'bg-red-500 text-white shadow-lg' 
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            <span>⚡</span> ON
          </button>
          <button
            onClick={() => updateState('power', PowerState.OFF)}
            className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              state.power === PowerState.OFF 
                ? 'bg-gray-600 text-white shadow-lg' 
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
             <span>🚫</span> OFF
          </button>
        </div>
      </section>

      {/* 5. Action Button */}
      <div className="pt-4">
        <button
          onClick={() => onApply(selectedDeviceId)}
          disabled={isLoading || !selectedDeviceId}
          className={`w-full py-4 rounded-xl font-bold text-xl text-white shadow-lg transition-all duration-200 transform active:scale-95 flex items-center justify-center gap-3
            ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}
          `}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending to {devices.find(d => d.deviceId === selectedDeviceId)?.deviceName || 'AC'}...
            </>
          ) : (
            <>
              <span>🎯</span> Apply Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
};
