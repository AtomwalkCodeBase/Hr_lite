import React from 'react';
import { 
  Text,
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  View,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Direct import for back button

const HeaderComponent = ({ headerTitle, onBackPress, headerStyle, icon1, icon2 }) => {
  return (
    <>
      {/* Handle status bar separately for Android */}
      {Platform.OS === 'android' && <View style={[styles.statusBar, headerStyle]} />}
      
      {/* SafeAreaView handles iOS notches automatically */}
      <SafeAreaView style={[styles.safeArea, headerStyle]}>
        <View style={[styles.headerContainer, headerStyle]}>
          <TouchableOpacity 
            onPress={onBackPress}
            style={styles.backButton}
            activeOpacity={0.6}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" /> {/* Direct usage of Ionicons */}
          </TouchableOpacity>
          
          <Text style={styles.headerText} numberOfLines={1}>
            {headerTitle}
          </Text>
          
          <View style={styles.iconContainer}>
            {icon1 && icon1.component && (
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={icon1.onPress || (() => {})}
                activeOpacity={0.6}
              >
                {React.createElement(icon1.component, { 
                  name: icon1.name, 
                  size: icon1.size || 24, 
                  color: icon1.color || '#fff' 
                })}
              </TouchableOpacity>
            )}
            {icon2 && icon2.component && (
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={icon2.onPress || (() => {})}
                activeOpacity={0.6}
              >
                {React.createElement(icon2.component, { 
                  name: icon2.name, 
                  size: icon2.size || 24, 
                  color: icon2.color || '#fff' 
                })}
              </TouchableOpacity>
            )}
            {!icon1 && !icon2 && <View style={styles.spacer} />}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  statusBar: {
    height: StatusBar.currentHeight,
    backgroundColor: '#fff',
  },
  safeArea: {
    backgroundColor: '#a970ff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#A6A7A6',
    backgroundColor: '#a970ff',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  spacer: {
    width: 40,
  },
});

export default HeaderComponent;