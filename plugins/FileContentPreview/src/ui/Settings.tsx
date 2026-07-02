import { React, ReactNative, constants } from '@vendetta/metro/common';
import { General } from '@vendetta/ui/components';
import { DEFAULT_CHUNK_SIZE, ensureSettings, getStorage, resetSettings } from '../settings';
import { EDITOR_THEMES, THEME_KEYS } from '../themes';
import { BubbleField, GlassPanel, getGlassColors } from './glass';

const { ScrollView, StyleSheet, TouchableOpacity } = ReactNative;
const { View, Text } = General;

const chunkPresets = [
  { label: '32 KB', value: 32 * 1024 },
  { label: '60 KB', value: DEFAULT_CHUNK_SIZE },
  { label: '128 KB', value: 128 * 1024 },
  { label: '256 KB', value: 256 * 1024 },
];

const settingsCopy = {
  liquidGlass: ['Liquid Glass', 'Layered transparent preview panels with soft refraction.'],
  transparentPreview: ['Transparency', 'Let the file viewer float over a translucent surface.'],
  bubbleEffects: ['Bubble effect', 'Slow liquid bubbles behind Configure and preview surfaces.'],
  defaultWordWrap: ['Word wrap', 'Open files with wrapping enabled by default.'],
  defaultMonospace: ['Monospace', 'Open files with code-style text by default.'],
  showLineNumbers: ['Line numbers', 'Show the compact line rail in previews.'],
};

const ToggleRow: any = ({ settingKey, colors, store, onChange }) => {
  const [title, body] = settingsCopy[settingKey];
  const enabled = store[settingKey] !== false;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={() => {
        onChange(settingKey, !enabled);
      }}
      style={styles.row}>
      <View style={{ flex: 1, paddingRight: 14 }}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.rowBody, { color: colors.muted }]}>{body}</Text>
      </View>
      <View
        style={[
          styles.switchTrack,
          {
            backgroundColor: enabled ? colors.accentSoft : colors.coreStrong,
            borderColor: enabled ? colors.accent : colors.border,
          },
        ]}>
        <View
          style={[
            styles.switchKnob,
            {
              alignSelf: enabled ? 'flex-end' : 'flex-start',
              backgroundColor: enabled ? colors.accent : colors.muted,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const ThemeSelector: any = ({ colors, store, onChange }) => {
  const current = store.editorTheme;

  return (
    <View style={styles.themeWrap}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Editor theme</Text>
      <Text style={[styles.sectionBody, { color: colors.muted }]}>VS Code-style palettes for Configure, chat previews, and file reading.</Text>
      <View style={styles.themeList}>
        {THEME_KEYS.map((themeKey) => {
          const theme = EDITOR_THEMES[themeKey];
          const active = current === themeKey;
          return (
            <TouchableOpacity
              key={themeKey}
              activeOpacity={0.84}
              onPress={() => onChange('editorTheme', themeKey)}
              style={[
                styles.themeOption,
                {
                  backgroundColor: active ? colors.accentSoft : colors.core,
                  borderColor: active ? colors.accent : colors.border,
                },
              ]}>
              <View style={styles.swatches}>
                {theme.swatches.map((swatch) => (
                  <View key={swatch} style={[styles.swatch, { backgroundColor: swatch }]} />
                ))}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.themeTitle, { color: colors.text }]}>{theme.label}</Text>
                <Text style={[styles.themeBody, { color: colors.muted }]}>{theme.description}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const ChunkSelector: any = ({ colors, store, onChange }) => {
  const current = Number(store.chunkSize) || DEFAULT_CHUNK_SIZE;

  return (
    <View style={styles.chunkWrap}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Preview chunk</Text>
      <Text style={[styles.sectionBody, { color: colors.muted }]}>Higher values load larger files faster, but use more memory.</Text>
      <View style={styles.presets}>
        {chunkPresets.map((preset) => {
          const active = current === preset.value;
          return (
            <TouchableOpacity
              key={preset.label}
              activeOpacity={0.84}
              onPress={() => {
                onChange('chunkSize', preset.value);
              }}
              style={[
                styles.preset,
                {
                  backgroundColor: active ? colors.accentSoft : colors.core,
                  borderColor: active ? colors.accent : colors.border,
                },
              ]}>
              <Text style={[styles.presetText, { color: active ? colors.text : colors.muted }]}>{preset.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export const Settings: any = () => {
  ensureSettings();
  const [, rerender] = React.useReducer((value) => value + 1, 0);
  const store = getStorage();

  const colors = getGlassColors();
  const bubblesEnabled = store.bubbleEffects !== false && store.liquidGlass !== false;
  const updateSetting = (key: string, value: any) => {
    store[key] = value;
    rerender();
  };
  const reset = () => {
    resetSettings();
    rerender();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.screen }} contentContainerStyle={styles.container}>
      <BubbleField colors={colors} enabled={bubblesEnabled} />
      <GlassPanel colors={colors} style={styles.headerShell} innerStyle={styles.headerCore}>
        <Text style={[styles.kicker, { color: colors.accent }]}>Configure</Text>
        <Text style={[styles.title, { color: colors.text }]}>FileContentPreview</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>VS Code-style preview themes with readable transparent surfaces.</Text>
      </GlassPanel>

      <GlassPanel colors={colors} style={styles.panel} innerStyle={{ padding: 16 }}>
        <ThemeSelector colors={colors} store={store} onChange={updateSetting} />
      </GlassPanel>

      <GlassPanel colors={colors} style={styles.panel}>
        <ToggleRow colors={colors} store={store} onChange={updateSetting} settingKey="liquidGlass" />
        <ToggleRow colors={colors} store={store} onChange={updateSetting} settingKey="transparentPreview" />
        <ToggleRow colors={colors} store={store} onChange={updateSetting} settingKey="bubbleEffects" />
      </GlassPanel>

      <GlassPanel colors={colors} style={styles.panel}>
        <ToggleRow colors={colors} store={store} onChange={updateSetting} settingKey="defaultWordWrap" />
        <ToggleRow colors={colors} store={store} onChange={updateSetting} settingKey="defaultMonospace" />
        <ToggleRow colors={colors} store={store} onChange={updateSetting} settingKey="showLineNumbers" />
      </GlassPanel>

      <GlassPanel colors={colors} style={styles.panel} innerStyle={{ padding: 16 }}>
        <ChunkSelector colors={colors} store={store} onChange={updateSetting} />
      </GlassPanel>

      <TouchableOpacity
        activeOpacity={0.84}
        onPress={reset}
        style={[
          styles.reset,
          {
            backgroundColor: colors.coreStrong,
            borderColor: colors.border,
          },
        ]}>
        <Text style={[styles.resetText, { color: colors.text }]}>Reset defaults</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 36,
    gap: 14,
  },
  headerShell: {
    marginTop: 8,
  },
  headerCore: {
    padding: 18,
  },
  panel: {
    marginTop: 2,
  },
  kicker: {
    fontSize: 11,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
    letterSpacing: 0,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    minHeight: 74,
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTitle: {
    fontSize: 16,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
  },
  rowBody: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
  },
  switchTrack: {
    width: 50,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    padding: 3,
    justifyContent: 'center',
  },
  switchKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  chunkWrap: {
    gap: 8,
  },
  themeWrap: {
    gap: 10,
  },
  themeList: {
    gap: 9,
    marginTop: 4,
  },
  themeOption: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  swatches: {
    width: 42,
    height: 42,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  swatch: {
    width: 21,
    height: 21,
  },
  themeTitle: {
    fontSize: 14,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
  },
  themeBody: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
  },
  sectionBody: {
    fontSize: 12,
    lineHeight: 17,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  preset: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  presetText: {
    fontSize: 13,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
  },
  reset: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 2,
  },
  resetText: {
    fontSize: 15,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
  },
});

export default Settings;
