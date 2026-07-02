import { React } from '@vendetta/metro/common';
import { General } from '@vendetta/ui/components';

const { Text, TouchableOpacity } = General;

const LoadMore: any = ({ buttonColor, textColor, buttonTextColor, remainingText, onPress, moreText, disabled = false }) => {
  return (
    <>
      <Text style={{ color: textColor, marginTop: 7 }}>{remainingText}</Text>
      <TouchableOpacity
        disabled={disabled}
        style={{ backgroundColor: buttonColor, borderRadius: 5, padding: 10, marginBottom: 20, marginTop: 5, opacity: disabled ? 0.72 : 1 }}
        onPress={onPress}>
        <Text
          style={{
            color: buttonTextColor,
            textTransform: 'uppercase',
            fontWeight: 'bold',
            textAlign: 'center',
            fontSize: 20,
          }}>
          {moreText}
        </Text>
      </TouchableOpacity>
    </>
  );
};

export default LoadMore;
