import React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  Dimensions, 
  Platform 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ApplyButton = ({ onPress, buttonText, icon, currentPath }) => {
  // Responsive style calculations
  const buttonPadding = Platform.OS === 'ios' ? 12 : 10;
  const buttonMarginBottom = currentPath === '/leave'? (width > 400 ? 28 : 35) : (width > 400 ? 28 : 10);
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
          marginBottom: buttonMarginBottom,
          width: buttonWidth
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
    // marginBottom:'50px'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ApplyButton;