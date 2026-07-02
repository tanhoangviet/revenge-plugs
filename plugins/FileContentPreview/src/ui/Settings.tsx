import { React, ReactNative, constants } from '@vendetta/metro/common';
import { storage } from '@vendetta/plugin';
import { useProxy } from '@vendetta/storage';
import { General } from '@vendetta/ui/components';
import { DEFAULT_CHUNK_SIZE, ensureSettings, resetSettings } from '../settings';
import { BubbleField, GlassPanel, getGlassColors } from './glass';

const { ScrollView, StyleSheet } = ReactNative;
const { View, Text, TouchableOpacity } = General;

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

const ToggleRow: any = ({ settingKey, colors }) => {
  const [title, body] = settingsCopy[settingKey];
  const enabled = storage[settingKey] !== false;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={() => {
        storage[settingKey] = !enabled;
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

const ChunkSelector: any = ({ colors }) => {
  const current = Number(storage.chunkSize) || DEFAULT_CHUNK_SIZE;

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
                storage.chunkSize = preset.value;
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
  useProxy(storage);

  const colors = getGlassColors();
  const bubblesEnabled = storage.bubbleEffects !== false && storage.liquidGlass !== false;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.screen }} contentContainerStyle={styles.container}>
      <BubbleField colors={colors} enabled={bubblesEnabled} />
      <GlassPanel colors={colors} style={styles.headerShell} innerStyle={styles.headerCore}>
        <Text style={[styles.kicker, { color: colors.accent }]}>Configure</Text>
        <Text style={[styles.title, { color: colors.text }]}>FileContentPreview</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Liquid glass controls for previews, loading size, and default reader behavior.</Text>
      </GlassPanel>

      <GlassPanel colors={colors} style={styles.panel}>
        <ToggleRow colors={colors} settingKey="liquidGlass" />
        <ToggleRow colors={colors} settingKey="transparentPreview" />
        <ToggleRow colors={colors} settingKey="bubbleEffects" />
      </GlassPanel>

      <GlassPanel colors={colors} style={styles.panel}>
        <ToggleRow colors={colors} settingKey="defaultWordWrap" />
        <ToggleRow colors={colors} settingKey="defaultMonospace" />
        <ToggleRow colors={colors} settingKey="showLineNumbers" />
      </GlassPanel>

      <GlassPanel colors={colors} style={styles.panel} innerStyle={{ padding: 16 }}>
        <ChunkSelector colors={colors} />
      </GlassPanel>

      <TouchableOpacity
        activeOpacity={0.84}
        onPress={resetSettings}
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
