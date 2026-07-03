import { React, ReactNative } from '@vendetta/metro/common';
import { getBooleanSetting } from '../settings';
import { getTheme } from '../theme';

const { View, Animated, Easing, StyleSheet } = ReactNative;

export function useGlassTheme() {
  return getTheme();
}

export function useLiquidValue(enabled = true) {
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
          duration: 4200,
          easing: Easing.bezier(0.32, 0.72, 0, 1),
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 0,
          duration: 4200,
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
  const value = useLiquidValue(enabled && getBooleanSetting('bubbleField'));
  if (!enabled || !getBooleanSetting('bubbleField')) return null;

  const drift = value.interpolate({ inputRange: [0, 1], outputRange: [-8, 12] });
  const reverse = value.interpolate({ inputRange: [0, 1], outputRange: [10, -10] });
  const pulse = value.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <Animated.View
        style={[
          styles.bubble,
          {
            width: 164,
            height: 164,
            borderRadius: 82,
            backgroundColor: colors.bubbleA,
            top: -52,
            right: -42,
            opacity: pulse,
            transform: [{ translateY: drift }, { scale: pulse }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.bubble,
          {
            width: 112,
            height: 112,
            borderRadius: 56,
            backgroundColor: colors.bubbleB,
            bottom: -28,
            left: -18,
            opacity: 0.76,
            transform: [{ translateY: reverse }],
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
        borderRadius: colors.radius + 6,
        backgroundColor: colors.shell,
        borderColor: colors.hairline,
        shadowColor: colors.shadow,
      },
      style,
    ]}>
    <View
      style={[
        styles.core,
        {
          borderRadius: colors.radius + 2,
          backgroundColor: colors.panel,
          borderColor: colors.hairline,
        },
        innerStyle,
      ]}>
      {children}
    </View>
  </View>
);

const styles = StyleSheet.create({
  shell: {
    borderWidth: 1,
    padding: 3,
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
  core: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute',
  },
});
