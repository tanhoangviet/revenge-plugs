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

const holdPresets = [
  { label: '3s', value: 3000 },
  { label: '5s', value: 5000 },
  { label: '7s', value: 7000 },
];

const tabs = [
  { label: 'Theme', value: 'theme' },
  { label: 'Custom UI', value: 'custom' },
  { label: 'Reader', value: 'reader' },
];

const settingsCopy = {
  liquidGlass: ['Liquid Glass', 'Layered transparent preview panels with soft refraction.'],
  transparentPreview: ['Transparency', 'Let the file viewer float over a translucent surface.'],
  bubbleEffects: ['Bubble effect', 'Slow liquid bubbles behind Configure and preview surfaces.'],
  previewButtonLiquidZoom: ['Preview button', 'Press and hold controls use a liquid glass zoom response.'],
  textGlassZoom: ['Text glass zoom', 'Hold editor text to open a magnified glass reading layer.'],
  animatedReader: ['Reader animation', 'Animate panels and controls when a file opens.'],
  syntaxHighlight: ['Syntax highlight', 'Color keywords, strings, comments, numbers, and functions.'],
  codeInsights: ['Code insights', 'Show file metrics, signals, and local code explanation.'],
  defaultWordWrap: ['Word wrap', 'Open files with wrapping enabled by default.'],
  defaultMonospace: ['Monospace', 'Open files with code-style text by default.'],
  showLineNumbers: ['Line numbers', 'Show the compact line rail in previews.'],
};

const TabBar: any = ({ activeTab, colors, onChange }) => (
  <View style={[styles.tabs, { backgroundColor: colors.core, borderColor: colors.border }]}>
    {tabs.map((tab) => {
      const active = activeTab === tab.value;
      return (
        <TouchableOpacity
          key={tab.value}
          activeOpacity={0.84}
          onPress={() => onChange(tab.value)}
          style={[
            styles.tab,
            {
              backgroundColor: active ? colors.accentSoft : 'transparent',
              borderColor: active ? colors.accent : 'transparent',
            },
          ]}>
          <Text style={[styles.tabText, { color: active ? colors.text : colors.muted }]}>{tab.label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const HeaderPill: any = ({ colors, label, active = true }) => (
  <View
    style={{
      borderWidth: 1,
      borderColor: active ? colors.accent : colors.hairline,
      backgroundColor: active ? colors.accentSoft : colors.core,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 7,
    }}>
    <Text style={{ color: active ? colors.text : colors.muted, fontSize: 11, fontFamily: constants.Fonts.PRIMARY_BOLD }}>{label}</Text>
  </View>
);

const HeaderSummary: any = ({ colors, store }) => (
  <View style={styles.headerSummary}>
    <HeaderPill colors={colors} label={colors.themeLabel} />
    <HeaderPill colors={colors} label="Highlight" active={store.syntaxHighlight !== false} />
    <HeaderPill colors={colors} label="Explain" active={store.codeInsights !== false} />
  </View>
);

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
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <Text style={[styles.themeTitle, { color: colors.text }]} numberOfLines={1}>{theme.label}</Text>
                  {active && <Text style={[styles.selectedText, { color: colors.accent }]}>Selected</Text>}
                </View>
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

const HoldSelector: any = ({ colors, store, onChange }) => {
  const current = Number(store.textGlassZoomHoldMs) || 5000;

  return (
    <View style={styles.chunkWrap}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Glass zoom hold</Text>
      <Text style={[styles.sectionBody, { color: colors.muted }]}>Delay before editor text expands into the zoom layer.</Text>
      <View style={styles.presets}>
        {holdPresets.map((preset) => {
          const active = current === preset.value;
          return (
            <TouchableOpacity
              key={preset.label}
              activeOpacity={0.84}
              onPress={() => onChange('textGlassZoomHoldMs', preset.value)}
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

const PreviewPatchSample: any = ({ colors }) => (
  <View style={[styles.sampleWrap, { backgroundColor: colors.editor, borderColor: colors.border }]}>
    <View style={{ flex: 1 }}>
      <Text style={[styles.sampleMeta, { color: colors.muted }]}>FILE - 32 KB</Text>
      <Text numberOfLines={1} style={[styles.sampleName, { color: colors.text }]}>sample.lua</Text>
    </View>
    <View
      style={[
        styles.sampleButton,
        {
          backgroundColor: colors.accent,
          borderColor: colors.hairline,
          shadowColor: colors.shadow,
        },
      ]}>
      <Text style={[styles.sampleButtonText, { color: colors.isDark ? colors.editorSolid : '#ffffff' }]}>Preview</Text>
    </View>
  </View>
);

export const Settings: any = () => {
  ensureSettings();
  const [, rerender] = React.useReducer((value) => value + 1, 0);
  const [activeTab, setActiveTab] = React.useState('theme');
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
        <Text style={[styles.subtitle, { color: colors.muted }]}>VS Code-style themes, liquid controls, and reader zoom.</Text>
        <HeaderSummary colors={colors} store={store} />
      </GlassPanel>

      <TabBar activeTab={activeTab} colors={colors} onChange={setActiveTab} />

      {activeTab === 'theme' && (
      <GlassPanel colors={colors} style={styles.panel} innerStyle={{ padding: 16 }}>
        <ThemeSelector colors={colors} store={store} onChange={updateSetting} />
      </GlassPanel>
      )}

      {activeTab === 'custom' && (
        <>
      <GlassPanel colors={colors} style={styles.panel} innerStyle={{ padding: 16 }}>
        <PreviewPatchSample colors={colors} />
      </GlassPanel>

      <GlassPanel colors={colors} style={styles.panel}>
        <ToggleRow colors={colors} store={store} onChange={updateSetting} settingKey="liquidGlass" />
        <ToggleRow colors={colors} store={store} onChange={updateSetting} settingKey="transparentPreview" />
        <ToggleRow colors={colors} store={store} onChange={updateSetting} settingKey="bubbleEffects" />
        <ToggleRow colors={colors} store={store} onChange={updateSetting} settingKey="previewButtonLiquidZoom" />
        <ToggleRow colors={colors} store={store} onChange={updateSetting} settingKey="textGlassZoom" />
        <ToggleRow colors={colors} store={store} onChange={updateSetting} settingKey="animatedReader" />
      </GlassPanel>

      <GlassPanel colors={colors} style={styles.panel} innerStyle={{ padding: 16 }}>
        <HoldSelector colors={colors} store={store} onChange={updateSetting} />
      </GlassPanel>
        </>
      )}

      {activeTab === 'reader' && (
        <>
      <GlassPanel colors={colors} style={styles.panel}>
        <ToggleRow colors={colors} store={store} onChange={updateSetting} settingKey="syntaxHighlight" />
        <ToggleRow colors={colors} store={store} onChange={updateSetting} settingKey="codeInsights" />
        <ToggleRow colors={colors} store={store} onChange={updateSetting} settingKey="defaultWordWrap" />
        <ToggleRow colors={colors} store={store} onChange={updateSetting} settingKey="defaultMonospace" />
        <ToggleRow colors={colors} store={store} onChange={updateSetting} settingKey="showLineNumbers" />
      </GlassPanel>

      <GlassPanel colors={colors} style={styles.panel} innerStyle={{ padding: 16 }}>
        <ChunkSelector colors={colors} store={store} onChange={updateSetting} />
      </GlassPanel>
        </>
      )}

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
  tabs: {
    borderWidth: 1,
    borderRadius: 999,
    padding: 4,
    flexDirection: 'row',
    gap: 4,
  },
  tab: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
  },
  headerSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
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
    flex: 1,
    fontSize: 14,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
  },
  selectedText: {
    fontSize: 11,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
  },
  themeBody: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 16,
  },
  sampleWrap: {
    minHeight: 82,
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sampleMeta: {
    fontSize: 12,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
    textTransform: 'uppercase',
  },
  sampleName: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: constants.Fonts.CODE_NORMAL,
  },
  sampleButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  sampleButtonText: {
    fontSize: 16,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
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
