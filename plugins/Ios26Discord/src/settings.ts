import { storage } from '@vendetta/plugin';

export const DEFAULT_SETTINGS = {
  dynamicIsland: true,
  glassCards: true,
  liquidMotion: true,
  bubbleField: true,
  compactIsland: false,
  reduceNoise: false,
  accent: 'iosBlue',
  intensity: 'balanced',
};

export type Ios26Settings = typeof DEFAULT_SETTINGS;
export type BooleanSettingKey =
  | 'dynamicIsland'
  | 'glassCards'
  | 'liquidMotion'
  | 'bubbleField'
  | 'compactIsland'
  | 'reduceNoise';

export type AccentKey = 'iosBlue' | 'aqua' | 'mint' | 'pink' | 'graphite';
export type IntensityKey = 'soft' | 'balanced' | 'peak';

const fallbackStorage: Record<string, any> = {};

export function getStorage() {
  return storage ?? fallbackStorage;
}

export function ensureSettings() {
  const store = getStorage();
  for (const key in DEFAULT_SETTINGS) {
    if (store[key] === undefined || store[key] === null) {
      store[key] = DEFAULT_SETTINGS[key];
    }
  }
}

export function resetSettings() {
  const store = getStorage();
  for (const key in DEFAULT_SETTINGS) {
    store[key] = DEFAULT_SETTINGS[key];
  }
}

export function getBooleanSetting(key: BooleanSettingKey) {
  ensureSettings();
  return getStorage()[key] !== false;
}

export function getAccentSetting(): AccentKey {
  ensureSettings();
  const value = String(getStorage().accent ?? DEFAULT_SETTINGS.accent);
  return ['iosBlue', 'aqua', 'mint', 'pink', 'graphite'].includes(value) ? (value as AccentKey) : 'iosBlue';
}

export function getIntensitySetting(): IntensityKey {
  ensureSettings();
  const value = String(getStorage().intensity ?? DEFAULT_SETTINGS.intensity);
  return ['soft', 'balanced', 'peak'].includes(value) ? (value as IntensityKey) : 'balanced';
}
