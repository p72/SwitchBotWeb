import React, { useState, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel'; // Renaming mentally to AcPanel, but file stays ControlPanel for now
import { TvPanel } from './components/TvPanel';
import { LightPanel } from './components/LightPanel';
import { MeterPanel } from './components/MeterPanel';
import { ConfigForm } from './components/ConfigForm';
import { AcState, SwitchBotCredentials } from './types';
import { DEFAULT_STATE } from './constants';
import { sendAirConditionerCommand } from './services/switchBotApi';

// Helper to safely access env vars
const getEnvCredentials = (): Partial<SwitchBotCredentials> => {
  return {
    token: process.env.REACT_APP_SWITCHBOT_TOKEN || '',
    secret: process.env.REACT_APP_SWITCHBOT_SECRET || '',
    deviceId: process.env.REACT_APP_SWITCHBOT_DEVICE_ID || '', // AC
    tvDeviceId: process.env.REACT_APP_SWITCHBOT_TV_ID || '',
    lightDeviceId: process.env.REACT_APP_SWITCHBOT_LIGHT_ID || '',
    meterDeviceId: process.env.REACT_APP_SWITCHBOT_METER_ID || '',
  };
};

enum Tab {
  AC = 'AC',
  TV = 'TV',
  LIGHT = 'LIGHT',
  METER = 'METER'
}

const App: React.FC = () => {
  const [credentials, setCredentials] = useState<SwitchBotCredentials | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.AC);
  
  // AC State
  const [acState, setAcState] = useState<AcState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(false);
  
  // Logs
  const [log, setLog] = useState<{ type: 'success' | 'error' | 'info'; message: string; command?: string } | null>(null);

  useEffect(() => {
    const storedCreds = localStorage.getItem('sb_credentials');
    const envCreds = getEnvCredentials();

    if (storedCreds) {
      try {
        setCredentials(JSON.parse(storedCreds));
      } catch (e) {
        console.error("Failed to parse stored credentials", e);
        if (envCreds.token && envCreds.secret) {
           setCredentials(envCreds as SwitchBotCredentials);
        }
      }
    } else if (envCreds.token && envCreds.secret) {
      setCredentials(envCreds as SwitchBotCredentials);
    }
  }, []);

  const handleSaveCredentials = (creds: SwitchBotCredentials) => {
    setCredentials(creds);
    localStorage.setItem('sb_credentials', JSON.stringify(creds));
    setLog({ type: 'success', message: 'Settings saved to browser storage.' });
  };

  const handleAcApply = async () => {
    if (!credentials) return;
    setIsLoading(true);
    setLog({ type: 'info', message: 'Sending AC command...' });
    try {
      const result = await sendAirConditionerCommand(credentials, acState);
      if (result.success) {
        setLog({ type: 'success', message: 'AC Updated', command: result.payload });
      } else {
        setLog({ type: 'error', message: result.message });
      }
    } catch (e) {
      setLog({ type: 'error', message: 'Failed to send AC command' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLog = (type: 'success' | 'error', message: string) => {
    setLog({ type, message });
  };

  const getStoredOrEnvCredentials = (): Partial<SwitchBotCredentials> => {
    try {
      const stored = localStorage.getItem('sb_credentials');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error reading storage", e);
    }
    return getEnvCredentials();
  };

  const TabButton = ({ tab, label, icon }: { tab: Tab, label: string, icon: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 py-3 px-2 text-sm md:text-base font-medium transition-colors border-b-2 ${
        activeTab === tab
          ? 'border-blue-500 text-blue-600 bg-blue-50'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      <span className="mr-1">{icon}</span> {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <header className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">SwitchBot Controller</h1>
          <p className="text-gray-500">Universal Remote & Monitor</p>
        </header>

        {!credentials ? (
          <ConfigForm onSave={handleSaveCredentials} initialCredentials={getStoredOrEnvCredentials()} />
        ) : (
          <>
            <div className="flex justify-between items-center bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200">
               <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-green-500"></span>
                 Connected
               </span>
               <button 
                  onClick={() => setCredentials(null)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-3 py-1 rounded hover:bg-blue-50 transition"
               >
                 ⚙️ Settings
               </button>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-t-xl shadow-sm border border-gray-200 flex overflow-hidden">
               <TabButton tab={Tab.AC} label="AC" icon="❄️" />
               <TabButton tab={Tab.TV} label="TV" icon="📺" />
               <TabButton tab={Tab.LIGHT} label="Light" icon="💡" />
               <TabButton tab={Tab.METER} label="Meter" icon="🌡️" />
            </div>

            {/* Tab Content */}
            <div className="relative">
              {activeTab === Tab.AC && (
                <ControlPanel 
                  state={acState} 
                  onChange={setAcState} 
                  onApply={handleAcApply} 
                  isLoading={isLoading} 
                />
              )}
              {activeTab === Tab.TV && (
                <TvPanel credentials={credentials} onLog={handleLog} />
              )}
              {activeTab === Tab.LIGHT && (
                <LightPanel credentials={credentials} onLog={handleLog} />
              )}
              {activeTab === Tab.METER && (
                <MeterPanel credentials={credentials} onLog={handleLog} />
              )}
            </div>
          </>
        )}

        {/* Global Log */}
        {log && (
           <div className={`p-4 rounded-lg border flex items-center gap-3 shadow-sm ${
             log.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
             log.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
             'bg-blue-50 border-blue-200 text-blue-800'
           }`}>
             <span className="text-lg">
               {log.type === 'success' ? '✅' : log.type === 'error' ? '❌' : 'ℹ️'}
             </span>
             <div className="flex-1">
               <p className="font-medium text-sm">{log.message}</p>
               {log.command && <p className="text-xs opacity-75 font-mono mt-1">{log.command}</p>}
             </div>
             <button onClick={() => setLog(null)} className="text-gray-400 hover:text-gray-600">×</button>
           </div>
        )}

      </div>
    </div>
  );
};

export default App;