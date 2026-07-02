import { storage } from '@vendetta/plugin';
import { EDITOR_THEMES, normalizeThemeKey } from './themes';

export const DEFAULT_CHUNK_SIZE = 60 * 1024;

export const DEFAULT_SETTINGS = {
  chunkSize: DEFAULT_CHUNK_SIZE,
  editorTheme: 'vscodeDark',
  liquidGlass: true,
  transparentPreview: true,
  bubbleEffects: true,
  defaultWordWrap: false,
  defaultMonospace: true,
  showLineNumbers: true,
};

export type FileContentPreviewSettings = typeof DEFAULT_SETTINGS;
export type BooleanSettingKey = 'liquidGlass' | 'transparentPreview' | 'bubbleEffects' | 'defaultWordWrap' | 'defaultMonospace' | 'showLineNumbers';

const fallbackStorage: Record<string, any> = {};

export function getStorage() {
  return storage ?? fallbackStorage;
}

export function ensureSettings() {
  const store = getStorage();
  for (const key in DEFAULT_SETTINGS) {
    const value = DEFAULT_SETTINGS[key];
    if (store[key] === undefined || store[key] === null) {
      store[key] = value;
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

export function getThemeSetting() {
  ensureSettings();
  const store = getStorage();
  const themeKey = normalizeThemeKey(store.editorTheme);
  if (store.editorTheme !== themeKey) {
    store.editorTheme = themeKey;
  }
  return themeKey;
}

export function getEditorTheme() {
  return EDITOR_THEMES[getThemeSetting()];
}

export function getChunkSize() {
  ensureSettings();
  const configuredChunkSize = Number(getStorage().chunkSize);
  return Number.isFinite(configuredChunkSize) && configuredChunkSize > 0
    ? Math.floor(configuredChunkSize)
    : DEFAULT_CHUNK_SIZE;
}
