import React from 'react';
import { 
  Text, 
  Image, 
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  View,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Scaling function based on screen width
const scale = (size) => Math.floor((width / 375) * size);

const HeaderComponent = ({ headerTitle, onBackPress }) => {
  return (
    <>
      {/* Handle status bar area separately */}
      {Platform.OS === 'ios' && height > 800 ? (
        <SafeAreaView style={styles.safeArea} />
      ) : null}
      
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{headerTitle}</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onBackPress}
          activeOpacity={0.7}
        >
          <Image 
            source={require('../../assets/images/back_icon.png')} 
            style={styles.backIcon} 
          />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'white',
  },
  headerContainer: {
    backgroundColor: 'white',
    paddingVertical: scale(15),
    paddingHorizontal: scale(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    elevation: 2,
    width: '100%',
    minHeight: scale(60),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Handle marginTop based on platform and device
    ...Platform.select({
      ios: {
        marginTop: height > 800 ? 0 : scale(20),
      },
      android: {
        marginTop: StatusBar.currentHeight || scale(20),
      },
    }),
  },
  headerText: {
    fontSize: scale(20),
    fontWeight: 'bold',
  },
  backButton: {
    padding: scale(5),
  },
  backIcon: {
    width: scale(24),
    height: scale(24),
  },
});

export default HeaderComponent;