import { React, ReactNative, constants } from '@vendetta/metro/common';
import { getStorage, resetSettings } from '../settings';
import { ACCENTS, getTheme } from '../theme';
import { GlassPanel } from './glass';
import { IslandPreviewCard } from './DynamicIsland';

const { ScrollView, StyleSheet, TouchableOpacity } = ReactNative;
const { View, Text } = ReactNative;

const toggles = {
  dynamicIsland: ['Dynamic Island', 'Floating iOS-style island overlay on top of Discord.'],
  glassCards: ['Glass cards', 'Restyle rich links and attachment cards with liquid glass colors.'],
  liquidMotion: ['Liquid motion', 'Use spring-like pulse and soft movement for the island.'],
  bubbleField: ['Bubble field', 'Subtle liquid bubbles inside glass surfaces.'],
  compactIsland: ['Compact island', 'Use a smaller island when collapsed.'],
  reduceNoise: ['Clean mode', 'Reduce decorative alpha for a calmer look.'],
  diagnostics: ['Diagnostics', 'Expose patch status for Evaluate JavaScript and log host patches.'],
};

const intensityOptions = [
  ['soft', 'Soft'],
  ['balanced', 'Balanced'],
  ['peak', 'Peak'],
];

const ToggleRow: any = ({ settingKey, store, onChange, colors }) => {
  const [title, body] = toggles[settingKey];
  const enabled = store[settingKey] !== false;
  return (
    <TouchableOpacity activeOpacity={0.82} onPress={() => onChange(settingKey, !enabled)} style={styles.row}>
      <View style={{ flex: 1, paddingRight: 14 }}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.rowBody, { color: colors.muted }]}>{body}</Text>
      </View>
      <View
        style={[
          styles.switchTrack,
          {
            backgroundColor: enabled ? colors.accentSoft : 'rgba(255,255,255,0.06)',
            borderColor: enabled ? colors.accent : colors.hairline,
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

const Segment: any = ({ value, label, active, onPress, colors }) => (
  <TouchableOpacity
    activeOpacity={0.82}
    onPress={onPress}
    style={[
      styles.segment,
      {
        backgroundColor: active ? colors.accentSoft : 'rgba(255,255,255,0.045)',
        borderColor: active ? colors.accent : colors.hairline,
      },
    ]}>
    <Text style={[styles.segmentText, { color: active ? colors.text : colors.muted }]}>{label}</Text>
  </TouchableOpacity>
);

export default function Settings() {
  const [, forceUpdate] = React.useReducer((value) => value + 1, 0);
  const store = getStorage();
  const colors = getTheme();

  const setValue = (key: string, value: any) => {
    store[key] = value;
    forceUpdate();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.screen }} contentContainerStyle={styles.container}>
      <GlassPanel colors={colors} innerStyle={styles.header}>
        <Text style={[styles.kicker, { color: colors.accent }]}>Configure</Text>
        <Text style={[styles.title, { color: colors.text }]}>iOS 26 Discord</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Liquid glass styling, Dynamic Island controls, and Discord card polish.
        </Text>
        <View style={[styles.statusBar, { borderColor: colors.hairline, backgroundColor: colors.accentSoft }]}>
          <Text style={[styles.statusText, { color: colors.accent }]}>{colors.label}</Text>
        </View>
      </GlassPanel>

      <IslandPreviewCard />

      <GlassPanel colors={colors}>
        {Object.keys(toggles).map((key) => (
          <ToggleRow key={key} settingKey={key} store={store} onChange={setValue} colors={colors} />
        ))}
      </GlassPanel>

      <GlassPanel colors={colors} innerStyle={styles.panel}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Accent</Text>
        <View style={styles.swatchGrid}>
          {Object.entries(ACCENTS).map(([key, accent]) => {
            const active = store.accent === key;
            return (
              <TouchableOpacity
                activeOpacity={0.82}
                key={key}
                onPress={() => setValue('accent', key)}
                style={[
                  styles.swatchOption,
                  {
                    borderColor: active ? colors.accent : colors.hairline,
                    backgroundColor: active ? colors.accentSoft : 'rgba(255,255,255,0.045)',
                  },
                ]}>
                <View style={[styles.swatch, { backgroundColor: accent.accent }]} />
                <Text style={[styles.swatchText, { color: colors.text }]}>{accent.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </GlassPanel>

      <GlassPanel colors={colors} innerStyle={styles.panel}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Intensity</Text>
        <View style={styles.segments}>
          {intensityOptions.map(([value, label]) => (
            <Segment
              key={value}
              value={value}
              label={label}
              active={store.intensity === value}
              onPress={() => setValue('intensity', value)}
              colors={colors}
            />
          ))}
        </View>
      </GlassPanel>

      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => {
          resetSettings();
          forceUpdate();
        }}
        style={[styles.reset, { backgroundColor: colors.panelStrong, borderColor: colors.hairline }]}>
        <Text style={[styles.resetText, { color: colors.text }]}>Reset defaults</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 36,
    gap: 14,
  },
  header: {
    padding: 18,
  },
  kicker: {
    fontSize: 11,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
    textTransform: 'uppercase',
    letterSpacing: 0,
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
  },
  statusBar: {
    marginTop: 14,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  statusText: {
    fontSize: 11,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
  },
  row: {
    minHeight: 76,
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
    lineHeight: 17,
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
  panel: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
    marginBottom: 12,
  },
  swatchGrid: {
    gap: 8,
  },
  swatchOption: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  swatchText: {
    fontSize: 14,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
  },
  segments: {
    flexDirection: 'row',
    gap: 8,
  },
  segment: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 10,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 13,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
  },
  reset: {
    borderWidth: 1,
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: 'center',
  },
  resetText: {
    fontSize: 15,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
  },
});
