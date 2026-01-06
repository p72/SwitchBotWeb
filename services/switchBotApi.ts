import { API_BASE_URL, CORS_PROXY_URL, FAN_MAPPING, MODE_MAPPING } from '../constants';
import { AcState, ApiResponse, DeviceListResponse, MeterStatusResponse, SwitchBotCredentials, SwitchBotDevice } from '../types';
import { generateHeaders } from '../utils/security';

// Helper to construct URL with optional proxy
const getUrl = (endpoint: string, useProxy: boolean = false) => {
  const url = `${API_BASE_URL}${endpoint}`;
  return useProxy ? `${CORS_PROXY_URL}${encodeURIComponent(url)}` : url;
};

interface CategorizedDevices {
  ac: SwitchBotDevice[];
  tv: SwitchBotDevice[];
  light: SwitchBotDevice[];
  meter: SwitchBotDevice[];
}

export const getDevices = async (
  token: string, 
  secret: string,
  useProxy: boolean = false
): Promise<{ success: boolean; message: string; devices: CategorizedDevices }> => {
  try {
    const headers = await generateHeaders(token, secret);
    const url = getUrl('/devices', useProxy);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    const data: DeviceListResponse = await response.json();

    if (data.statusCode === 100) {
      const devices: CategorizedDevices = {
        ac: [],
        tv: [],
        light: [],
        meter: []
      };

      // Process IR Devices (Virtual)
      data.body.infraredRemoteList.forEach(d => {
        if (d.remoteType === 'Air Conditioner') devices.ac.push(d);
        if (d.remoteType === 'TV' || d.remoteType === 'IPTV' || d.remoteType === 'Set Top Box') devices.tv.push(d);
        if (d.remoteType === 'Light') devices.light.push(d);
      });

      // Process Physical Devices
      data.body.deviceList.forEach(d => {
        // Physical lights (Bot, Plug, Color Bulb, Strip Light, Ceiling Light)
        // Simplified check: if it has "Light" or "Bulb" or "Strip" or is a Bot/Plug (often used for lights)
        // For strictness, let's look for known types or just generic mapping
        const type = d.deviceType || '';
        if (type.includes('Light') || type.includes('Bulb') || type.includes('Strip') || type === 'Bot' || type === 'Plug') {
          devices.light.push(d);
        }
        
        // Meters and Hubs with Meter capabilities
        if (type.includes('Meter') || type.includes('Hub 2')) {
          devices.meter.push(d);
        }
      });
      
      return {
        success: true,
        message: 'Devices fetched successfully',
        devices
      };
    } else {
      return {
        success: false,
        message: `API Error (${data.statusCode}): ${data.message}`,
        devices: { ac: [], tv: [], light: [], meter: [] }
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Network Error: ${error.message}. Try enabling CORS Proxy.`,
      devices: { ac: [], tv: [], light: [], meter: [] }
    };
  }
};

export const sendCommand = async (
  credentials: SwitchBotCredentials,
  targetDeviceId: string,
  command: string,
  parameter: string = 'default',
  commandType: string = 'command'
): Promise<{ success: boolean; message: string }> => {
  const { token, secret, useProxy } = credentials;

  try {
    const headers = await generateHeaders(token, secret);
    const url = getUrl(`/devices/${targetDeviceId}/commands`, useProxy);

    const body = { command, parameter, commandType };

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });

    const data: ApiResponse = await response.json();

    if (data.statusCode === 100) {
      return { success: true, message: 'Success' };
    } else {
      return { success: false, message: `Error ${data.statusCode}: ${data.message}` };
    }
  } catch (error: any) {
    return { success: false, message: `Network Error: ${error.message}` };
  }
};

export const getMeterStatus = async (
  credentials: SwitchBotCredentials,
  meterDeviceId: string
): Promise<{ success: boolean; message: string; data?: { temp: number; humidity: number } }> => {
  const { token, secret, useProxy } = credentials;

  try {
    const headers = await generateHeaders(token, secret);
    const url = getUrl(`/devices/${meterDeviceId}/status`, useProxy);

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    const data: MeterStatusResponse = await response.json();

    if (data.statusCode === 100) {
      return {
        success: true,
        message: 'Success',
        data: {
          temp: data.body.temperature,
          humidity: data.body.humidity
        }
      };
    } else {
      return { success: false, message: `Error ${data.statusCode}: ${data.message}` };
    }
  } catch (error: any) {
    return { success: false, message: `Network Error: ${error.message}` };
  }
};

// AC Specific Wrapper (keeping existing signature for compatibility)
export const sendAirConditionerCommand = async (
  credentials: SwitchBotCredentials,
  state: AcState
): Promise<{ success: boolean; message: string; payload: string }> => {
  const { deviceId } = credentials;
  
  // Map parameters
  const tempParam = state.temperature;
  const modeParam = MODE_MAPPING[state.mode];
  const fanParam = FAN_MAPPING[state.fanSpeed];
  const powerParam = state.power;
  const parameterString = `${tempParam},${modeParam},${fanParam},${powerParam}`;

  const result = await sendCommand(credentials, deviceId, 'setAll', parameterString, 'command');

  return {
    success: result.success,
    message: result.message,
    payload: parameterString
  };
};
