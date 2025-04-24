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
import { Ionicons } from '@expo/vector-icons';

const HeaderComponent = ({ headerTitle, onBackPress }) => {
  return (
    <>
      {/* Handle status bar separately for Android */}
      {Platform.OS === 'android' && <View style={styles.statusBar} />}
      
      {/* SafeAreaView handles iOS notches automatically */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            onPress={onBackPress}
            style={styles.backButton}
            activeOpacity={0.6}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <Text style={styles.headerText} numberOfLines={1}>
            {headerTitle}
          </Text>
          
          <View style={styles.spacer} />
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
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  spacer: {
    width: 40,
  },
});

export default HeaderComponent;