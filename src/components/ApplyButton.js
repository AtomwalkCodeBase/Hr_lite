import React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  Dimensions, 
  Platform 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const { width } = Dimensions.get('window');

const ApplyButton = ({ onPress, buttonText, icon }) => {
  let tabBarHeight = 0;

  try {
    // Try to get tab bar height (works only inside Tab Navigator)
    tabBarHeight = useBottomTabBarHeight();
  } catch (e) {
    // If not inside tabs, fallback to 0
    tabBarHeight = 0;
  }

  // Responsive style calculations
  const buttonPadding = Platform.OS === 'ios' ? 12 : 10;
  const buttonMarginVertical = width > 400 ? 18 : 5;
  const buttonWidth = width > 412 ? '90%' : '100%';
  
  const iconSize = width > 400 ? 26 : 24;
  const textFontSize = width > 400 ? 18 : 16;

  return (
    <TouchableOpacity 
      style={[
        styles.buttonContainer,
        {
          paddingVertical: buttonPadding,
          paddingHorizontal: buttonPadding + 4,
          marginVertical: buttonMarginVertical,
          marginBottom: tabBarHeight ? 10 : 4,  // ✅ Safe fallback
          width: buttonWidth,
        }
      ]}
      onPress={onPress}
    >
      <MaterialIcons name={icon} size={iconSize} color="#fff" />
      <Text style={[styles.buttonText, { fontSize: textFontSize }]}>
        {buttonText}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    backgroundColor: '#a970ff',
    borderRadius: 25,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ApplyButton;
