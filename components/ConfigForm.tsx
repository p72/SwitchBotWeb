import React, { useState, useEffect } from 'react';
import { SwitchBotCredentials } from '../types';

interface ConfigFormProps {
  onSave: (creds: SwitchBotCredentials) => void;
  initialCredentials?: Partial<SwitchBotCredentials>;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({ onSave, initialCredentials }) => {
  const [token, setToken] = useState('');
  const [secret, setSecret] = useState('');
  const [useProxy, setUseProxy] = useState(true);

  useEffect(() => {
    if (initialCredentials) {
      if (initialCredentials.token) setToken(initialCredentials.token);
      if (initialCredentials.secret) setSecret(initialCredentials.secret);
      if (initialCredentials.useProxy !== undefined) setUseProxy(initialCredentials.useProxy);
    }
  }, [initialCredentials]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ token, secret, useProxy });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-200">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
        <span>⚙️</span> API Settings
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Enter your SwitchBot API Token and Secret. The app will automatically fetch all available devices (AC, TV, Lights, Meters).
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Token</label>
            <input
              type="password"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Your Open Token"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secret</label>
            <input
              type="password"
              required
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Your Secret Key"
            />
          </div>
        </div>

        <div>
           <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-100">
            <input
              type="checkbox"
              checked={useProxy}
              onChange={(e) => setUseProxy(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-900">Enable CORS Proxy</span>
              <p className="text-xs text-gray-500 mt-1">Required for web browsers to bypass "Network Error". Disabling this will cause requests to fail unless you are in a non-browser environment.</p>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={!token || !secret}
          className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-md transition duration-200"
        >
          Save & Fetch Devices
        </button>
      </form>
    </div>
  );
};
