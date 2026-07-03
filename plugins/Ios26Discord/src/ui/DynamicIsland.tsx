import { React, ReactNative, constants } from '@vendetta/metro/common';
import { showToast } from '@vendetta/ui/toasts';
import { getAssetIDByName } from '@vendetta/ui/assets';
import { getBooleanSetting } from '../settings';
import { BubbleField, GlassPanel, useGlassTheme, useLiquidValue } from './glass';
import { quickSearchMessages, quickSearchServers, quickSearchUsers, runQuickCommand } from '../actions';

const { View, Text, TouchableOpacity, TextInput, Dimensions, PanResponder } = ReactNative;
const { Animated, StyleSheet } = ReactNative;

const toastIcon = () => getAssetIDByName('ic_information_filled_24px');
const quickCommands = ['/help', '/shrug', '/tableflip', '/me'];
const gestureThreshold = 44;

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

export const DynamicIsland: any = ({ preview = false }) => {
  const colors = useGlassTheme();
  const [expanded, setExpanded] = React.useState(preview);
  const [query, setQuery] = React.useState('');
  const [gestureHint, setGestureHint] = React.useState<string | null>(null);
  const liquid = useLiquidValue(getBooleanSetting('liquidMotion'));
  const drag = React.useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const queryRef = React.useRef(query);

  React.useEffect(() => {
    queryRef.current = query;
  }, [query]);

  if (!preview && !getBooleanSetting('dynamicIsland')) return null;

  const pulse = liquid.interpolate({ inputRange: [0, 1], outputRange: [1, colors.islandScale] });
  const compact = getBooleanSetting('compactIsland') && !expanded;
  const screenWidth = Dimensions?.get?.('window')?.width ?? 390;
  const expandedWidth = Math.min(preview ? 300 : 318, Math.max(260, screenWidth - 72));
  const width = expanded ? expandedWidth : compact ? 96 : 132;

  const resetDrag = () => {
    Animated.spring(drag, {
      toValue: { x: 0, y: 0 },
      speed: 18,
      bounciness: 8,
      useNativeDriver: true,
    }).start(() => setGestureHint(null));
  };

  const searchMessages = () => {
    const result = quickSearchMessages(queryRef.current);
    if (result.mode === 'empty') {
      showIslandToast('Type a message search first');
    } else if (result.mode === 'clipboard') {
      showIslandToast('Search copied. Paste it into Discord search.');
    } else {
      showIslandToast('Message search opened');
    }
  };

  const searchUsers = () => {
    const result = quickSearchUsers(queryRef.current);
    if (result.mode === 'empty') {
      showIslandToast('Type a user search first');
    } else if (result.mode === 'clipboard') {
      showIslandToast('User search copied');
    } else {
      showIslandToast('User search opened');
    }
  };

  const searchServers = () => {
    const result = quickSearchServers(queryRef.current);
    if (result.mode === 'empty') {
      showIslandToast('Type a server search first');
    } else if (result.mode === 'clipboard') {
      showIslandToast('Server search copied');
    } else {
      showIslandToast('Server search opened');
    }
  };

  const useCommand = (value?: string) => {
    const command = value ?? queryRef.current ?? '/help';
    const result = runQuickCommand(command);
    if (result.mode === 'empty') {
      showIslandToast('Type a command first');
    } else if (result.mode === 'clipboard') {
      showIslandToast(`${result.text} copied`);
    } else {
      showIslandToast(`${result.text} inserted`);
    }
  };

  const runGesture = (hint: string | null) => {
    if (hint === 'messages') searchMessages();
    if (hint === 'users') searchUsers();
    if (hint === 'servers') searchServers();
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 10 || Math.abs(gesture.dy) > 10,
      onPanResponderMove: (_, gesture) => {
        drag.setValue({ x: gesture.dx * 0.42, y: Math.max(-12, Math.min(gesture.dy * 0.42, 34)) });
        if (gesture.dy > gestureThreshold && Math.abs(gesture.dy) > Math.abs(gesture.dx)) {
          setGestureHint('messages');
        } else if (gesture.dx > gestureThreshold) {
          setGestureHint('users');
        } else if (gesture.dx < -gestureThreshold) {
          setGestureHint('servers');
        } else {
          setGestureHint(null);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        const next =
          gesture.dy > gestureThreshold && Math.abs(gesture.dy) > Math.abs(gesture.dx)
            ? 'messages'
            : gesture.dx > gestureThreshold
              ? 'users'
              : gesture.dx < -gestureThreshold
                ? 'servers'
                : null;
        runGesture(next);
        resetDrag();
      },
      onPanResponderTerminate: resetDrag,
    }),
  ).current;

  return (
    <View pointerEvents="box-none" style={[styles.layer, preview && styles.previewLayer]}>
      <Animated.View
        {...panResponder.panHandlers}
        style={{ transform: [{ translateX: drag.x }, { translateY: drag.y }, { scale: pulse }] }}>
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
                {expanded ? 'Search Island' : 'Island'}
              </Text>
              {expanded && (
                <Text style={[styles.islandSubtitle, { color: colors.islandMuted }]} numberOfLines={1}>
                  Pull down, right, or left.
                </Text>
              )}
            </View>
            <View style={[styles.statusPill, { backgroundColor: colors.accentSoft, borderColor: colors.hairline }]}>
              <Text style={[styles.statusText, { color: colors.accent }]}>{expanded ? 'GO' : '>'}</Text>
            </View>
          </TouchableOpacity>

          {expanded && (
            <View style={styles.controlPanel}>
              <View style={[styles.inputWrap, { borderColor: colors.hairline, backgroundColor: colors.panelStrong }]}>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search, @user, server, or /command"
                  placeholderTextColor={colors.muted}
                  selectionColor={colors.accent}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[styles.input, { color: colors.text }]}
                />
              </View>

              <View style={styles.actionGrid}>
                <ActionButton label="Messages" detail="pull down" onPress={searchMessages} colors={colors} />
                <ActionButton label="Users" detail="swipe right" onPress={searchUsers} colors={colors} />
                <ActionButton label="Servers" detail="swipe left" onPress={searchServers} colors={colors} />
                <ActionButton label="Command" detail="slash" onPress={() => useCommand()} colors={colors} />
              </View>

              <View style={styles.commandRow}>
                {quickCommands.map((command) => (
                  <CommandChip key={command} command={command} colors={colors} onPress={() => useCommand(command)} />
                ))}
              </View>
            </View>
          )}
        </View>

        {gestureHint && (
          <View style={[styles.gestureRail, { backgroundColor: colors.island, borderColor: colors.hairline }]}>
            <Text style={[styles.gestureText, { color: colors.accent }]}>
              {gestureHint === 'users' ? '>> user search' : gestureHint === 'servers' ? '<< server search' : 'v message search'}
            </Text>
          </View>
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
            Pull down for message search, swipe right for user search, or swipe left for server search.
          </Text>
        </View>
      </View>
    </GlassPanel>
  );
};

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 30,
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
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    padding: 6,
    overflow: 'hidden',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  islandExpanded: {
    borderRadius: 24,
  },
  islandTop: {
    minHeight: 30,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  liveOrb: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  islandTitle: {
    fontSize: 12,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
  },
  islandSubtitle: {
    marginTop: 2,
    fontSize: 9,
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 9,
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
  gestureRail: {
    marginTop: 6,
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  gestureText: {
    fontSize: 12,
    fontFamily: constants.Fonts.PRIMARY_BOLD,
  },
  previewCard: {
    minHeight: 292,
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
