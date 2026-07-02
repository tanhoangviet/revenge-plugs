import { storage } from '@vendetta/plugin';

export const DEFAULT_CHUNK_SIZE = 60 * 1024;

export const DEFAULT_SETTINGS = {
  chunkSize: DEFAULT_CHUNK_SIZE,
  liquidGlass: true,
  transparentPreview: true,
  bubbleEffects: true,
  defaultWordWrap: false,
  defaultMonospace: true,
  showLineNumbers: true,
};

export type FileContentPreviewSettings = typeof DEFAULT_SETTINGS;

export function ensureSettings() {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    if (storage[key] === undefined || storage[key] === null) {
      storage[key] = value;
    }
  }
}

export function resetSettings() {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    storage[key] = value;
  }
}

export function getBooleanSetting(key: keyof FileContentPreviewSettings) {
  ensureSettings();
  return storage[key] !== false;
}

export function getChunkSize() {
  ensureSettings();
  const configuredChunkSize = Number(storage.chunkSize);
  return Number.isFinite(configuredChunkSize) && configuredChunkSize > 0
    ? Math.floor(configuredChunkSize)
    : DEFAULT_CHUNK_SIZE;
}
