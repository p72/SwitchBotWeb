import React, { useState, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel'; 
import { TvPanel } from './components/TvPanel';
import { LightPanel } from './components/LightPanel';
import { MeterPanel } from './components/MeterPanel';
import { ConfigForm } from './components/ConfigForm';
import { AcState, SwitchBotCredentials, SwitchBotDevice } from './types';
import { DEFAULT_STATE } from './constants';
import { sendAirConditionerCommand, getDevices, CategorizedDevices } from './services/switchBotApi';

// Helper to safely access env vars
const getEnvCredentials = (): Partial<SwitchBotCredentials> => {
  return {
    token: process.env.REACT_APP_SWITCHBOT_TOKEN || '',
    secret: process.env.REACT_APP_SWITCHBOT_SECRET || '',
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
  
  // Devices State
  const [devices, setDevices] = useState<CategorizedDevices>({ ac: [], tv: [], light: [], meter: [] });
  const [isFetchingDevices, setIsFetchingDevices] = useState(false);

  // AC State (Shared across ACs for now, or per device logic handled in component?)
  // For now, we keep one UI state and apply it to the selected device.
  const [acState, setAcState] = useState<AcState>(DEFAULT_STATE);
  const [isSendingAc, setIsSendingAc] = useState(false);
  
  // Logs
  const [log, setLog] = useState<{ type: 'success' | 'error' | 'info'; message: string; command?: string } | null>(null);

  // Initial Load
  useEffect(() => {
    const storedCreds = localStorage.getItem('sb_credentials');
    const envCreds = getEnvCredentials();

    if (storedCreds) {
      try {
        const parsed = JSON.parse(storedCreds);
        setCredentials(parsed);
      } catch (e) {
        if (envCreds.token && envCreds.secret) {
           setCredentials(envCreds as SwitchBotCredentials);
        }
      }
    } else if (envCreds.token && envCreds.secret) {
      setCredentials(envCreds as SwitchBotCredentials);
    }
  }, []);

  // Fetch devices when credentials change
  useEffect(() => {
    if (credentials) {
      fetchDevices(credentials);
    }
  }, [credentials]);

  const fetchDevices = async (creds: SwitchBotCredentials) => {
    setIsFetchingDevices(true);
    const result = await getDevices(creds.token, creds.secret, creds.useProxy);
    setIsFetchingDevices(false);
    
    if (result.success) {
       setDevices(result.devices);
       // Auto-switch tabs if no devices in default tab?
       // Optional improvement
    } else {
       handleLog('error', `Failed to fetch devices: ${result.message}`);
    }
  };

  const handleSaveCredentials = (creds: SwitchBotCredentials) => {
    setCredentials(creds);
    localStorage.setItem('sb_credentials', JSON.stringify(creds));
    handleLog('success', 'Credentials saved. Connecting...');
    // fetchDevices is triggered by useEffect
  };

  const handleAcApply = async (deviceId: string) => {
    if (!credentials || !deviceId) return;
    setIsSendingAc(true);
    setLog({ type: 'info', message: 'Sending AC command...' });
    try {
      const result = await sendAirConditionerCommand(credentials, deviceId, acState);
      if (result.success) {
        setLog({ type: 'success', message: 'AC Updated', command: result.payload });
      } else {
        setLog({ type: 'error', message: result.message });
      }
    } catch (e) {
      setLog({ type: 'error', message: 'Failed to send AC command' });
    } finally {
      setIsSendingAc(false);
    }
  };

  const handleLog = (type: 'success' | 'error' | 'info', message: string) => {
    setLog({ type, message });
  };

  const getStoredOrEnvCredentials = (): Partial<SwitchBotCredentials> => {
    try {
      const stored = localStorage.getItem('sb_credentials');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return getEnvCredentials();
  };

  const TabButton = ({ tab, label, icon, count }: { tab: Tab, label: string, icon: string, count?: number }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 py-3 px-2 text-sm md:text-base font-medium transition-colors border-b-2 flex items-center justify-center gap-1 ${
        activeTab === tab
          ? 'border-blue-500 text-blue-600 bg-blue-50'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      <span>{icon}</span> 
      <span className="hidden sm:inline">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="bg-gray-200 text-gray-600 text-xs rounded-full px-2 py-0.5 ml-1">{count}</span>
      )}
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
               <div className="flex items-center gap-3">
                 <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                 <span className="text-sm font-medium text-gray-600">Connected</span>
                 {isFetchingDevices && <span className="text-xs text-blue-500 animate-pulse">Syncing devices...</span>}
               </div>
               
               <div className="flex gap-2">
                 <button 
                    onClick={() => fetchDevices(credentials)}
                    className="text-xs text-gray-500 hover:text-blue-600 font-semibold px-3 py-1 rounded hover:bg-gray-50 transition"
                    title="Refresh Devices"
                 >
                   🔄
                 </button>
                 <button 
                    onClick={() => setCredentials(null)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-3 py-1 rounded hover:bg-blue-50 transition"
                 >
                   ⚙️ Settings
                 </button>
               </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-t-xl shadow-sm border border-gray-200 flex overflow-hidden">
               <TabButton tab={Tab.AC} label="AC" icon="❄️" count={devices.ac.length} />
               <TabButton tab={Tab.TV} label="TV" icon="📺" count={devices.tv.length} />
               <TabButton tab={Tab.LIGHT} label="Light" icon="💡" count={devices.light.length} />
               <TabButton tab={Tab.METER} label="Meter" icon="🌡️" count={devices.meter.length} />
            </div>

            {/* Tab Content */}
            <div className="relative">
              {activeTab === Tab.AC && (
                <ControlPanel 
                  devices={devices.ac}
                  state={acState} 
                  onChange={setAcState} 
                  onApply={handleAcApply} 
                  isLoading={isSendingAc} 
                />
              )}
              {activeTab === Tab.TV && (
                <TvPanel devices={devices.tv} credentials={credentials} onLog={handleLog} />
              )}
              {activeTab === Tab.LIGHT && (
                <LightPanel devices={devices.light} credentials={credentials} onLog={handleLog} />
              )}
              {activeTab === Tab.METER && (
                <MeterPanel devices={devices.meter} credentials={credentials} onLog={handleLog} />
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