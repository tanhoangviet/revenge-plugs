import { React, ReactNative, constants } from '@vendetta/metro/common';
import { showToast } from '@vendetta/ui/toasts';
import { getAssetIDByName } from '@vendetta/ui/assets';
import { getBooleanSetting } from '../settings';
import { BubbleField, GlassPanel, useGlassTheme, useLiquidValue } from './glass';
import { copyText, openMedia, quickSearchMessages, runQuickCommand, type MediaKind } from '../actions';

const { View, Text, TouchableOpacity, TextInput, Dimensions } = ReactNative;
const { Animated, StyleSheet } = ReactNative;

const toastIcon = () => getAssetIDByName('ic_information_filled_24px');
const quickCommands = ['/help', '/shrug', '/tableflip', '/me'];

function showIslandToast(message: string) {
  showToast(message, toastIcon());
}

const ActionButton: any = ({ label, detail, onPress, colors }) => (
  <TouchableOpacity
    activeOpacity={0.82}
    onPress={onPress}
    style={[styles.actionButton, { backgroundColor: colors.accentSoft, borderColor: colors.hairline }]}>
    <Text style={[styles.actionLabel, { color: colors.text }]} numberOfLines={1}>
      {label}
    </Text>
    <Text style={[styles.actionDetail, { color: colors.muted }]} numberOfLines={1}>
      {detail}
    </Text>
  </TouchableOpacity>
);

const CommandChip: any = ({ command, onPress, colors }) => (
  <TouchableOpacity
    activeOpacity={0.82}
    onPress={onPress}
    style={[styles.commandChip, { backgroundColor: colors.panelStrong, borderColor: colors.hairline }]}>
    <Text style={[styles.commandText, { color: colors.text }]}>{command}</Text>
  </TouchableOpacity>
);

const MediaFloat: any = ({ media, colors, width, onOpen, onCopy, onClose }) => (
  <GlassPanel colors={colors} style={[styles.floatShell, { width }]} innerStyle={styles.floatPanel}>
    <BubbleField colors={colors} enabled={getBooleanSetting('bubbleField')} />
    <View style={styles.floatTop}>
      <View style={[styles.mediaOrb, { backgroundColor: media.kind === 'spotify' ? '#35C98B' : '#FF6A7A' }]} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.floatTitle, { color: colors.text }]} numberOfLines={1}>
          {media.label} float window
        </Text>
        <Text style={[styles.floatBody, { color: colors.muted }]} numberOfLines={1}>
          {media.query || media.url}
        </Text>
      </View>
      <TouchableOpacity activeOpacity={0.82} onPress={onClose} style={styles.floatClose}>
        <Text style={[styles.floatCloseText, { color: colors.muted }]}>x</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.floatControls}>
      <TouchableOpacity activeOpacity={0.82} onPress={onOpen} style={[styles.floatButton, { backgroundColor: colors.accentSoft }]}>
        <Text style={[styles.floatButtonText, { color: colors.text }]}>Open</Text>
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.82} onPress={onCopy} style={[styles.floatButton, { borderColor: colors.hairline }]}>
        <Text style={[styles.floatButtonText, { color: colors.muted }]}>Copy</Text>
      </TouchableOpacity>
    </View>
  </GlassPanel>
);

export const DynamicIsland: any = ({ preview = false }) => {
  const colors = useGlassTheme();
  const [expanded, setExpanded] = React.useState(preview);
  const [query, setQuery] = React.useState('');
  const [media, setMedia] = React.useState<any>(null);
  const liquid = useLiquidValue(getBooleanSetting('liquidMotion'));

  if (!preview && !getBooleanSetting('dynamicIsland')) return null;

  const pulse = liquid.interpolate({ inputRange: [0, 1], outputRange: [1, colors.islandScale] });
  const compact = getBooleanSetting('compactIsland') && !expanded;
  const screenWidth = Dimensions?.get?.('window')?.width ?? 390;
  const expandedWidth = Math.min(preview ? 318 : 356, Math.max(286, screenWidth - 28));
  const width = expanded ? expandedWidth : compact ? 142 : 194;

  const searchMessages = () => {
    const result = quickSearchMessages(query);
    if (result.mode === 'empty') {
      showIslandToast('Type a message search first');
    } else if (result.mode === 'clipboard') {
      showIslandToast('Search copied. Paste it into Discord search.');
    } else {
      showIslandToast('Message search opened');
    }
  };

  const useCommand = (value?: string) => {
    const command = value ?? query ?? '/help';
    const result = runQuickCommand(command);
    if (result.mode === 'empty') {
      showIslandToast('Type a command first');
    } else if (result.mode === 'clipboard') {
      showIslandToast(`${result.text} copied`);
    } else {
      showIslandToast(`${result.text} inserted`);
    }
  };

  const useMedia = (kind: MediaKind) => {
    const result = openMedia(kind, query);
    const label = kind === 'spotify' ? 'Spotify' : 'YouTube';
    setMedia({
      kind,
      label,
      query: query || label,
      url: result.url,
    });
    showIslandToast(result.ok ? `Opening ${label}` : `${label} link copied`);
  };

  return (
    <View pointerEvents="box-none" style={[styles.layer, preview && styles.previewLayer]}>
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <View
          style={[
            styles.island,
            expanded && styles.islandExpanded,
            {
              width,
              backgroundColor: colors.island,
              borderColor: colors.hairline,
              shadowColor: colors.shadow,
            },
          ]}>
          <BubbleField colors={colors} enabled={getBooleanSetting('bubbleField')} />
          <TouchableOpacity
            activeOpacity={0.86}
            onPress={() => setExpanded((value) => !value)}
            onLongPress={() => showIslandToast('iOS 26 Discord active')}
            style={styles.islandTop}>
            <View style={[styles.liveOrb, { backgroundColor: colors.accent }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.islandTitle, { color: colors.text }]} numberOfLines={1}>
                {expanded ? 'Dynamic Island' : 'Quick Island'}
              </Text>
              <Text style={[styles.islandSubtitle, { color: colors.islandMuted }]} numberOfLines={1}>
                {expanded ? 'Search, commands, Spotify, and YouTube.' : 'Tap for actions'}
              </Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: colors.accentSoft, borderColor: colors.hairline }]}>
              <Text style={[styles.statusText, { color: colors.accent }]}>{expanded ? 'LIVE' : 'GO'}</Text>
            </View>
          </TouchableOpacity>

          {expanded && (
            <View style={styles.controlPanel}>
              <View style={[styles.inputWrap, { borderColor: colors.hairline, backgroundColor: colors.panelStrong }]}>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search, /command, Spotify or YouTube"
                  placeholderTextColor={colors.muted}
                  selectionColor={colors.accent}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[styles.input, { color: colors.text }]}
                />
              </View>

              <View style={styles.actionGrid}>
                <ActionButton label="Search" detail="messages" onPress={searchMessages} colors={colors} />
                <ActionButton label="Command" detail="slash" onPress={() => useCommand()} colors={colors} />
                <ActionButton label="Spotify" detail="music" onPress={() => useMedia('spotify')} colors={colors} />
                <ActionButton label="YouTube" detail="video" onPress={() => useMedia('youtube')} colors={colors} />
              </View>

              <View style={styles.commandRow}>
                {quickCommands.map((command) => (
                  <CommandChip key={command} command={command} colors={colors} onPress={() => useCommand(command)} />
                ))}
              </View>
            </View>
          )}
        </View>

        {expanded && media && (
          <MediaFloat
            media={media}
            colors={colors}
            width={Math.min(324, width)}
            onOpen={() => openMedia(media.kind, media.url)}
            onCopy={() => {
              copyText(media.url);
              showIslandToast('Media link copied');
            }}
            onClose={() => setMedia(null)}
          />
        )}
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
            Quick actions float above chat with search, slash commands, Spotify, and YouTube controls.
          </Text>
        </View>
      </View>
    </GlassPanel>
  );
};

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
    elevation: 999,
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
    padding: 6,
    overflow: 'hidden',
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
  },
  islandExpanded: {
    borderRadius: 30,
  },
  islandTop: {
    minHeight: 42,
    paddingHorizontal: 9,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
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
  controlPanel: {
    paddingHorizontal: 6,
    paddingBottom: 6,
    gap: 8,
  },
  inputWrap: {
    borderWidth: 1,
    borderRadius: 18,
    minHeight: 42,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  input: {
    fontSize: 13,
    minHeight: 38,
    paddingVertical: 0,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  actionLabel: {
    fontSize: 12,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
  },
  actionDetail: {
    marginTop: 2,
    fontSize: 10,
  },
  commandRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  commandChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  commandText: {
    fontSize: 11,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
  },
  floatShell: {
    marginTop: 10,
    width: 324,
    alignSelf: 'center',
  },
  floatPanel: {
    padding: 12,
  },
  floatTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mediaOrb: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },
  floatTitle: {
    fontSize: 13,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
  },
  floatBody: {
    marginTop: 2,
    fontSize: 10,
  },
  floatClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatCloseText: {
    fontSize: 16,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
  },
  floatControls: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  floatButton: {
    flex: 1,
    minHeight: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatButtonText: {
    fontSize: 12,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
  },
  previewCard: {
    minHeight: 360,
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
