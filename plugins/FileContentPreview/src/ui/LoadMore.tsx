import { React } from '@vendetta/metro/common';
import { General } from '@vendetta/ui/components';

const { Text, TouchableOpacity } = General;

const LoadMore: any = ({ buttonColor, textColor, buttonTextColor, borderColor, remainingText, onPress, moreText, disabled = false }) => {
  return (
    <>
      <Text style={{ color: textColor, marginTop: 12, marginLeft: 4 }}>{remainingText}</Text>
      <TouchableOpacity
        disabled={disabled}
        style={{
          backgroundColor: buttonColor,
          borderRadius: 999,
          borderWidth: 1,
          borderColor,
          padding: 12,
          marginBottom: 20,
          marginTop: 8,
          opacity: disabled ? 0.72 : 1,
          shadowColor: '#000',
          shadowOpacity: 0.14,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
          elevation: 2,
        }}
        onPress={onPress}>
        <Text
          style={{
            color: buttonTextColor,
            textTransform: 'uppercase',
            fontWeight: 'bold',
            textAlign: 'center',
            fontSize: 14,
            letterSpacing: 0,
          }}>
          {moreText}
        </Text>
      </TouchableOpacity>
    </>
  );
};

export default LoadMore;
