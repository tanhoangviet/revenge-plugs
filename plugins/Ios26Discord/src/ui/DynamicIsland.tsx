import { React, ReactNative, constants } from '@vendetta/metro/common';
import { showToast } from '@vendetta/ui/toasts';
import { getAssetIDByName } from '@vendetta/ui/assets';
import { getBooleanSetting } from '../settings';
import { BubbleField, GlassPanel, useGlassTheme, useLiquidValue } from './glass';

const { View, Text, TouchableOpacity } = ReactNative;
const { Animated, StyleSheet } = ReactNative;

export const DynamicIsland: any = ({ preview = false }) => {
  const colors = useGlassTheme();
  const [expanded, setExpanded] = React.useState(preview);
  const liquid = useLiquidValue(getBooleanSetting('liquidMotion'));

  if (!preview && !getBooleanSetting('dynamicIsland')) return null;

  const pulse = liquid.interpolate({ inputRange: [0, 1], outputRange: [1, colors.islandScale] });
  const compact = getBooleanSetting('compactIsland') && !expanded;
  const width = expanded ? 286 : compact ? 138 : 188;

  return (
    <View pointerEvents="box-none" style={[styles.layer, preview && styles.previewLayer]}>
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <TouchableOpacity
          activeOpacity={0.86}
          onPress={() => setExpanded((value) => !value)}
          onLongPress={() => showToast('iOS 26 Discord active', getAssetIDByName('ic_information_filled_24px'))}
          style={[
            styles.island,
            {
              width,
              backgroundColor: colors.island,
              borderColor: colors.hairline,
              shadowColor: colors.shadow,
            },
          ]}>
          <BubbleField colors={colors} enabled={getBooleanSetting('bubbleField')} />
          <View style={[styles.liveOrb, { backgroundColor: colors.accent }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.islandTitle, { color: colors.text }]} numberOfLines={1}>
              {expanded ? 'iOS 26 Discord' : 'Liquid UI'}
            </Text>
            {expanded && (
              <Text style={[styles.islandSubtitle, { color: colors.islandMuted }]} numberOfLines={1}>
                Glass, cards, motion, and overlay are enabled.
              </Text>
            )}
          </View>
          {expanded && (
            <View style={[styles.statusPill, { backgroundColor: colors.accentSoft, borderColor: colors.hairline }]}>
              <Text style={[styles.statusText, { color: colors.accent }]}>ON</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export const IslandPreviewCard: any = () => {
  const colors = useGlassTheme();
  return (
    <GlassPanel colors={colors} innerStyle={styles.previewCard}>
      <BubbleField colors={colors} enabled={getBooleanSetting('bubbleField')} />
      <DynamicIsland preview />
      <View style={styles.previewMessage}>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.previewName, { color: colors.text }]}>Discord, but liquid</Text>
          <Text style={[styles.previewBody, { color: colors.muted }]}>
            Dynamic Island floats above chat while glass cards reshape attachments.
          </Text>
        </View>
      </View>
    </GlassPanel>
  );
};

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
    elevation: 20,
  },
  previewLayer: {
    position: 'relative',
    top: 0,
    marginBottom: 16,
  },
  island: {
    minHeight: 48,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    overflow: 'hidden',
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
  },
  liveOrb: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  islandTitle: {
    fontSize: 13,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
  },
  islandSubtitle: {
    marginTop: 2,
    fontSize: 10,
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 10,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
  },
  previewCard: {
    minHeight: 196,
    padding: 16,
  },
  previewMessage: {
    marginTop: 6,
    padding: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  previewName: {
    fontSize: 15,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
  },
  previewBody: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
  },
});
