import { React, ReactNative } from '@vendetta/metro/common';
import { getBooleanSetting, getEditorTheme } from '../settings';

const { View, Animated, Easing, StyleSheet } = ReactNative;

export function getGlassColors() {
  const theme = getEditorTheme();
  const liquidGlass = getBooleanSetting('liquidGlass');
  const transparent = liquidGlass && getBooleanSetting('transparentPreview');

  return {
    isDark: theme.isDark,
    text: theme.text,
    muted: theme.muted,
    screen: transparent ? theme.screen : theme.screenSolid,
    shell: transparent ? theme.shell : theme.coreStrong,
    core: transparent ? theme.core : theme.coreStrong,
    coreStrong: theme.coreStrong,
    hairline: liquidGlass ? theme.hairline : theme.border,
    border: theme.border,
    accent: theme.accent,
    accentSoft: theme.accentSoft,
    editor: transparent ? theme.editor : theme.editorSolid,
    editorSolid: theme.editorSolid,
    editorText: theme.editorText,
    editorMuted: theme.editorMuted,
    lineRail: theme.lineRail,
    bubbleA: theme.bubbleA,
    bubbleB: theme.bubbleB,
    bubbleC: theme.bubbleC,
    shadow: theme.shadow,
    themeLabel: theme.label,
  };
}

export function useBubbleValue(enabled = true) {
  const value = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!enabled) {
      value.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(value, {
          toValue: 1,
          duration: 3600,
          easing: Easing.bezier(0.32, 0.72, 0, 1),
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 0,
          duration: 3600,
          easing: Easing.bezier(0.32, 0.72, 0, 1),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [enabled, value]);

  return value;
}

export const BubbleField: any = ({ colors, enabled = true }) => {
  const value = useBubbleValue(enabled);
  if (!enabled) return null;

  const drift = value.interpolate({ inputRange: [0, 1], outputRange: [-8, 10] });
  const reverseDrift = value.interpolate({ inputRange: [0, 1], outputRange: [12, -10] });
  const pulse = value.interpolate({ inputRange: [0, 1], outputRange: [0.74, 1] });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <Animated.View
        style={[
          styles.bubble,
          {
            width: 190,
            height: 190,
            borderRadius: 95,
            backgroundColor: colors.bubbleA,
            top: -42,
            right: -54,
            opacity: pulse,
            transform: [{ translateY: drift }, { scale: pulse }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.bubble,
          {
            width: 150,
            height: 150,
            borderRadius: 75,
            backgroundColor: colors.bubbleB,
            bottom: 82,
            left: -48,
            opacity: 0.82,
            transform: [{ translateY: reverseDrift }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.bubble,
          {
            width: 98,
            height: 98,
            borderRadius: 49,
            backgroundColor: colors.bubbleC,
            bottom: 18,
            right: 28,
            opacity: pulse,
            transform: [{ translateY: drift }],
          },
        ]}
      />
    </View>
  );
};

export const GlassPanel: any = ({ colors, children, style, innerStyle }) => (
  <View
    style={[
      styles.shell,
      {
        backgroundColor: colors.shell,
        borderColor: colors.border,
        shadowColor: colors.shadow,
      },
      style,
    ]}>
    <View
      style={[
        styles.core,
        {
          backgroundColor: colors.core,
          borderColor: colors.hairline,
        },
        innerStyle,
      ]}>
      {children}
    </View>
  </View>
);

export const styles = StyleSheet.create({
  shell: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 3,
    shadowOpacity: 0.18,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
  },
  core: {
    borderWidth: 1,
    borderRadius: 25,
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute',
  },
});
