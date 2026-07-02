export const THEME_KEYS = ['vscodeDark', 'vscodeLight', 'githubDark', 'oneDark', 'monokai'] as const;

export type EditorThemeKey = (typeof THEME_KEYS)[number];

export type EditorTheme = {
  label: string;
  description: string;
  isDark: boolean;
  accent: string;
  accentSoft: string;
  screen: string;
  screenSolid: string;
  shell: string;
  core: string;
  coreStrong: string;
  text: string;
  muted: string;
  editor: string;
  editorSolid: string;
  editorText: string;
  editorMuted: string;
  lineRail: string;
  border: string;
  hairline: string;
  chatCard: string;
  chatBorder: string;
  chatButton: string;
  chatTitle: string;
  bubbleA: string;
  bubbleB: string;
  bubbleC: string;
  shadow: string;
  swatches: string[];
};

export const EDITOR_THEMES: Record<EditorThemeKey, EditorTheme> = {
  vscodeDark: {
    label: 'VS Code Dark+',
    description: 'Classic editor contrast with blue command accents.',
    isDark: true,
    accent: '#3794ff',
    accentSoft: 'rgba(55, 148, 255, 0.18)',
    screen: 'rgba(12, 16, 23, 0.72)',
    screenSolid: '#0f1117',
    shell: 'rgba(37, 37, 38, 0.62)',
    core: 'rgba(30, 30, 30, 0.82)',
    coreStrong: 'rgba(45, 45, 48, 0.92)',
    text: '#f3f6fb',
    muted: '#9ba6b7',
    editor: 'rgba(30, 30, 30, 0.88)',
    editorSolid: '#1e1e1e',
    editorText: '#d4d4d4',
    editorMuted: '#858585',
    lineRail: 'rgba(37, 37, 38, 0.78)',
    border: 'rgba(255, 255, 255, 0.12)',
    hairline: 'rgba(255, 255, 255, 0.18)',
    chatCard: '#252526',
    chatBorder: '#3c3c3c',
    chatButton: '#0e639c',
    chatTitle: '#cccccc',
    bubbleA: 'rgba(55, 148, 255, 0.20)',
    bubbleB: 'rgba(197, 134, 192, 0.16)',
    bubbleC: 'rgba(78, 201, 176, 0.12)',
    shadow: '#02040a',
    swatches: ['#1e1e1e', '#252526', '#3794ff', '#d4d4d4'],
  },
  vscodeLight: {
    label: 'VS Code Light+',
    description: 'Clean light editor with restrained blue accents.',
    isDark: false,
    accent: '#006ab1',
    accentSoft: 'rgba(0, 106, 177, 0.12)',
    screen: 'rgba(230, 235, 242, 0.62)',
    screenSolid: '#f3f6fb',
    shell: 'rgba(255, 255, 255, 0.68)',
    core: 'rgba(255, 255, 255, 0.88)',
    coreStrong: 'rgba(246, 248, 252, 0.96)',
    text: '#172033',
    muted: '#5f6f86',
    editor: 'rgba(255, 255, 255, 0.90)',
    editorSolid: '#ffffff',
    editorText: '#1f2328',
    editorMuted: '#6e7781',
    lineRail: 'rgba(246, 248, 252, 0.86)',
    border: 'rgba(63, 83, 120, 0.18)',
    hairline: 'rgba(63, 83, 120, 0.22)',
    chatCard: '#f6f8fa',
    chatBorder: '#d8dee4',
    chatButton: '#0969da',
    chatTitle: '#24292f',
    bubbleA: 'rgba(0, 106, 177, 0.16)',
    bubbleB: 'rgba(130, 80, 223, 0.12)',
    bubbleC: 'rgba(31, 136, 61, 0.10)',
    shadow: '#6b7892',
    swatches: ['#ffffff', '#f6f8fa', '#0969da', '#24292f'],
  },
  githubDark: {
    label: 'GitHub Dark',
    description: 'Neutral devtool dark with strong readable text.',
    isDark: true,
    accent: '#58a6ff',
    accentSoft: 'rgba(88, 166, 255, 0.17)',
    screen: 'rgba(13, 17, 23, 0.76)',
    screenSolid: '#0d1117',
    shell: 'rgba(22, 27, 34, 0.68)',
    core: 'rgba(22, 27, 34, 0.86)',
    coreStrong: 'rgba(33, 38, 45, 0.94)',
    text: '#f0f6fc',
    muted: '#8b949e',
    editor: 'rgba(13, 17, 23, 0.90)',
    editorSolid: '#0d1117',
    editorText: '#c9d1d9',
    editorMuted: '#8b949e',
    lineRail: 'rgba(22, 27, 34, 0.82)',
    border: 'rgba(139, 148, 158, 0.22)',
    hairline: 'rgba(240, 246, 252, 0.13)',
    chatCard: '#161b22',
    chatBorder: '#30363d',
    chatButton: '#238636',
    chatTitle: '#f0f6fc',
    bubbleA: 'rgba(88, 166, 255, 0.18)',
    bubbleB: 'rgba(188, 140, 255, 0.14)',
    bubbleC: 'rgba(63, 185, 80, 0.12)',
    shadow: '#010409',
    swatches: ['#0d1117', '#161b22', '#58a6ff', '#3fb950'],
  },
  oneDark: {
    label: 'One Dark Pro',
    description: 'Soft dark palette with warm syntax-like accents.',
    isDark: true,
    accent: '#61afef',
    accentSoft: 'rgba(97, 175, 239, 0.17)',
    screen: 'rgba(20, 24, 33, 0.74)',
    screenSolid: '#1f2329',
    shell: 'rgba(40, 44, 52, 0.66)',
    core: 'rgba(40, 44, 52, 0.86)',
    coreStrong: 'rgba(53, 59, 69, 0.94)',
    text: '#f0f2f7',
    muted: '#abb2bf',
    editor: 'rgba(40, 44, 52, 0.90)',
    editorSolid: '#282c34',
    editorText: '#abb2bf',
    editorMuted: '#6f7682',
    lineRail: 'rgba(33, 37, 43, 0.84)',
    border: 'rgba(171, 178, 191, 0.18)',
    hairline: 'rgba(255, 255, 255, 0.12)',
    chatCard: '#282c34',
    chatBorder: '#3e4451',
    chatButton: '#61afef',
    chatTitle: '#d7dae0',
    bubbleA: 'rgba(97, 175, 239, 0.18)',
    bubbleB: 'rgba(198, 120, 221, 0.14)',
    bubbleC: 'rgba(152, 195, 121, 0.12)',
    shadow: '#080a10',
    swatches: ['#282c34', '#3e4451', '#61afef', '#c678dd'],
  },
  monokai: {
    label: 'Monokai',
    description: 'High-contrast dark with warmer code colors.',
    isDark: true,
    accent: '#a6e22e',
    accentSoft: 'rgba(166, 226, 46, 0.16)',
    screen: 'rgba(20, 20, 16, 0.74)',
    screenSolid: '#1b1c17',
    shell: 'rgba(39, 40, 34, 0.68)',
    core: 'rgba(39, 40, 34, 0.88)',
    coreStrong: 'rgba(53, 54, 47, 0.94)',
    text: '#f8f8f2',
    muted: '#c8c8bd',
    editor: 'rgba(39, 40, 34, 0.91)',
    editorSolid: '#272822',
    editorText: '#f8f8f2',
    editorMuted: '#90908a',
    lineRail: 'rgba(30, 31, 27, 0.84)',
    border: 'rgba(248, 248, 242, 0.16)',
    hairline: 'rgba(248, 248, 242, 0.14)',
    chatCard: '#272822',
    chatBorder: '#49483e',
    chatButton: '#66d9ef',
    chatTitle: '#f8f8f2',
    bubbleA: 'rgba(166, 226, 46, 0.14)',
    bubbleB: 'rgba(249, 38, 114, 0.14)',
    bubbleC: 'rgba(102, 217, 239, 0.12)',
    shadow: '#090a07',
    swatches: ['#272822', '#a6e22e', '#f92672', '#66d9ef'],
  },
};

export function normalizeThemeKey(value: unknown): EditorThemeKey {
  return THEME_KEYS.includes(value as EditorThemeKey) ? (value as EditorThemeKey) : 'vscodeDark';
}

export function colorToDiscordInt(hex: string, alpha = 1) {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const a = Math.max(0, Math.min(255, Math.round(alpha * 255)));
  const color = ((a << 24) | (r << 16) | (g << 8) | b) >>> 0;
  return color > 0x7fffffff ? color - 0x100000000 : color;
}
