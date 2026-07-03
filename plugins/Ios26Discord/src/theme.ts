import { getAccentSetting, getIntensitySetting } from './settings';

export const ACCENTS = {
  iosBlue: {
    label: 'iOS Blue',
    accent: '#8EA1FF',
    accentStrong: '#6F84FF',
    accentSoft: 'rgba(142, 161, 255, 0.18)',
    bubbleA: 'rgba(142, 161, 255, 0.24)',
    bubbleB: 'rgba(110, 132, 255, 0.16)',
  },
  aqua: {
    label: 'Aqua',
    accent: '#67D8FF',
    accentStrong: '#35BDF2',
    accentSoft: 'rgba(103, 216, 255, 0.18)',
    bubbleA: 'rgba(103, 216, 255, 0.23)',
    bubbleB: 'rgba(43, 188, 221, 0.16)',
  },
  mint: {
    label: 'Mint',
    accent: '#70E0AF',
    accentStrong: '#35C98B',
    accentSoft: 'rgba(112, 224, 175, 0.17)',
    bubbleA: 'rgba(112, 224, 175, 0.22)',
    bubbleB: 'rgba(53, 201, 139, 0.15)',
  },
  pink: {
    label: 'Pink',
    accent: '#FFA7CA',
    accentStrong: '#FF6FA9',
    accentSoft: 'rgba(255, 167, 202, 0.18)',
    bubbleA: 'rgba(255, 167, 202, 0.22)',
    bubbleB: 'rgba(255, 111, 169, 0.14)',
  },
  graphite: {
    label: 'Graphite',
    accent: '#DCE3F8',
    accentStrong: '#AEB9D7',
    accentSoft: 'rgba(220, 227, 248, 0.14)',
    bubbleA: 'rgba(220, 227, 248, 0.16)',
    bubbleB: 'rgba(133, 146, 177, 0.12)',
  },
};

const INTENSITY = {
  soft: {
    label: 'Soft',
    shellAlpha: 0.54,
    coreAlpha: 0.68,
    borderAlpha: 0.12,
    radius: 18,
    islandScale: 0.92,
  },
  balanced: {
    label: 'Balanced',
    shellAlpha: 0.68,
    coreAlpha: 0.76,
    borderAlpha: 0.18,
    radius: 22,
    islandScale: 1,
  },
  peak: {
    label: 'Peak',
    shellAlpha: 0.78,
    coreAlpha: 0.84,
    borderAlpha: 0.26,
    radius: 26,
    islandScale: 1.08,
  },
};

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

export function alpha(hex: string, opacity = 1) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, opacity))})`;
}

export function colorToDiscordInt(hex: string, opacity = 1) {
  const { r, g, b } = hexToRgb(hex);
  const value = ((Math.max(0, Math.min(255, Math.round(255 * opacity))) << 24) | (r << 16) | (g << 8) | b) >>> 0;
  return value > 0x7fffffff ? value - 0x100000000 : value;
}

export function getTheme() {
  const accent = ACCENTS[getAccentSetting()];
  const intensity = INTENSITY[getIntensitySetting()];
  return {
    ...accent,
    ...intensity,
    screen: 'rgba(7, 10, 18, 0.72)',
    text: '#F4F7FF',
    muted: '#AAB4CA',
    panel: `rgba(22, 27, 39, ${intensity.coreAlpha})`,
    panelStrong: `rgba(31, 37, 52, ${intensity.coreAlpha})`,
    shell: `rgba(255, 255, 255, ${intensity.shellAlpha * 0.1})`,
    hairline: `rgba(244, 247, 255, ${intensity.borderAlpha})`,
    shadow: '#030712',
    island: 'rgba(9, 12, 20, 0.88)',
    islandMuted: '#C7D0E6',
    label: `${accent.label} / ${intensity.label}`,
  };
}
