import { React, ReactNative } from '@vendetta/metro/common';
import { find, findByProps, findByStoreName } from '@vendetta/metro';
import { semanticColors } from '@vendetta/ui';
import { getBooleanSetting } from '../settings';

const ThemeStore = findByStoreName('ThemeStore');
const resolveSemanticColor =
  find((m) => m.default?.internal?.resolveSemanticColor)?.default.internal.resolveSemanticColor ??
  find((m) => m.meta?.resolveSemanticColor)?.meta.resolveSemanticColor ??
  (() => {});

const { View, Animated, Easing, StyleSheet } = ReactNative;

const color = (semantic, fallback) => resolveSemanticColor(ThemeStore.theme, semantic) ?? fallback;

const themeName = () => String(ThemeStore.theme ?? '').toLowerCase();

const isDarkTheme = () => {
  const name = themeName();
  return name.includes('dark') || name.includes('amoled') || name.includes('midnight');
};

export function getGlassColors() {
  const isDark = isDarkTheme();
  const liquidGlass = getBooleanSetting('liquidGlass');
  const transparent = liquidGlass && getBooleanSetting('transparentPreview');

  return {
    isDark,
    text: color(semanticColors.MOBILE_TEXT_HEADING_PRIMARY, isDark ? '#f8fafc' : '#101828'),
    muted: color(semanticColors.TEXT_MUTED, isDark ? '#b7c0d8' : '#667085'),
    screen: transparent ? (isDark ? 'rgba(7, 10, 20, 0.70)' : 'rgba(239, 246, 255, 0.58)') : color(semanticColors.BACKGROUND_BASE_LOWEST, isDark ? '#11131f' : '#f2f5fb'),
    shell: transparent ? (isDark ? 'rgba(255, 255, 255, 0.075)' : 'rgba(255, 255, 255, 0.62)') : color(semanticColors.BACKGROUND_BASE_LOWER, isDark ? '#171a27' : '#ffffff'),
    core: transparent ? (isDark ? 'rgba(255, 255, 255, 0.105)' : 'rgba(255, 255, 255, 0.72)') : color(semanticColors.BACKGROUND_BASE_LOW, isDark ? '#1f2230' : '#ffffff'),
    coreStrong: transparent ? (isDark ? 'rgba(255, 255, 255, 0.155)' : 'rgba(255, 255, 255, 0.86)') : color(semanticColors.BACKGROUND_BASE_HIGHER, isDark ? '#262a3a' : '#f6f8fc'),
    hairline: liquidGlass ? (isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.74)') : color(semanticColors.BACKGROUND_BASE_HIGHER, isDark ? '#303447' : '#d9e0ef'),
    border: liquidGlass ? (isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(116, 139, 184, 0.22)') : color(semanticColors.BACKGROUND_BASE_HIGHER, isDark ? '#303447' : '#d9e0ef'),
    accent: isDark ? 'rgba(153, 211, 255, 0.88)' : 'rgba(31, 111, 235, 0.86)',
    accentSoft: isDark ? 'rgba(153, 211, 255, 0.18)' : 'rgba(31, 111, 235, 0.14)',
    bubbleA: isDark ? 'rgba(98, 185, 255, 0.22)' : 'rgba(103, 167, 255, 0.28)',
    bubbleB: isDark ? 'rgba(200, 154, 255, 0.18)' : 'rgba(177, 140, 255, 0.24)',
    bubbleC: isDark ? 'rgba(100, 255, 216, 0.14)' : 'rgba(90, 222, 202, 0.18)',
    shadow: isDark ? '#000' : '#667399',
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
