export enum AcMode {
  AUTO = 'auto',
  COOL = 'cool',
  DRY = 'dry',
  FAN = 'fan',
  HEAT = 'heat'
}

export enum FanSpeed {
  AUTO = 'auto',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum PowerState {
  ON = 'on',
  OFF = 'off'
}

export interface AcState {
  temperature: number;
  mode: AcMode;
  fanSpeed: FanSpeed;
  power: PowerState;
}

export interface SwitchBotCredentials {
  token: string;
  secret: string;
  useProxy?: boolean;
  // Device IDs
  deviceId: string; // Keep for backward compatibility (AC)
  tvDeviceId?: string;
  lightDeviceId?: string;
  meterDeviceId?: string;
}

export interface ApiResponse {
  statusCode: number;
  message: string;
  body?: any;
}

export interface SwitchBotDevice {
  deviceId: string;
  deviceName: string;
  remoteType: string;
  deviceType?: string; // For physical devices
  hubDeviceId?: string;
}

export interface DeviceListResponse {
  statusCode: number;
  message: string;
  body: {
    deviceList: SwitchBotDevice[];
    infraredRemoteList: SwitchBotDevice[];
  };
}

export interface MeterStatus {
  deviceId: string;
  deviceType: string;
  hubDeviceId: string;
  humidity: number;
  temperature: number;
}

export interface MeterStatusResponse {
  statusCode: number;
  message: string;
  body: MeterStatus;
}
