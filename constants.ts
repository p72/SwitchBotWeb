import { AcMode, FanSpeed, PowerState } from './types';

// Map UI values to SwitchBot API numeric values
export const MODE_MAPPING: Record<AcMode, number> = {
  [AcMode.AUTO]: 1,
  [AcMode.COOL]: 2,
  [AcMode.DRY]: 3,
  [AcMode.FAN]: 4,
  [AcMode.HEAT]: 5,
};

export const FAN_MAPPING: Record<FanSpeed, number> = {
  [FanSpeed.AUTO]: 1,
  [FanSpeed.LOW]: 2,
  [FanSpeed.MEDIUM]: 3,
  [FanSpeed.HIGH]: 4,
};

// UI Labels and Icons
export const MODE_LABELS: Record<AcMode, { label: string; icon: string }> = {
  [AcMode.AUTO]: { label: '自動 (Auto)', icon: '🔄' },
  [AcMode.COOL]: { label: '冷房 (Cool)', icon: '❄️' },
  [AcMode.DRY]: { label: '除湿 (Dry)', icon: '💧' },
  [AcMode.FAN]: { label: '送風 (Fan)', icon: '🌪️' },
  [AcMode.HEAT]: { label: '暖房 (Heat)', icon: '🔥' },
};

export const FAN_LABELS: Record<FanSpeed, { label: string; icon: string }> = {
  [FanSpeed.AUTO]: { label: '自動 (Auto)', icon: '🔄' },
  [FanSpeed.LOW]: { label: '弱風 (Low)', icon: '💨' },
  [FanSpeed.MEDIUM]: { label: '中風 (Med)', icon: '💨' },
  [FanSpeed.HIGH]: { label: '強風 (High)', icon: '🌪️' },
};

export const DEFAULT_STATE = {
  temperature: 26,
  mode: AcMode.COOL,
  fanSpeed: FanSpeed.AUTO,
  power: PowerState.ON,
};

export const API_BASE_URL = 'https://api.switch-bot.com/v1.1';
export const CORS_PROXY_URL = 'https://corsproxy.io/?';