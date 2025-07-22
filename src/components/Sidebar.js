import { Feather, MaterialIcons, Ionicons, FontAwesome6, AntDesign } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import React, { useState, useContext, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppContext } from '../../context/AppContext';
import ConfirmationModal from './ConfirmationModal';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Color theme based on your primary color
const colors = {
  primary: '#a970ff',
  primaryLight: '#c49eff',
  primaryDark: '#8b5cf6',
  primaryTransparent: 'rgba(169, 112, 255, 0.1)',
  primaryTransparentMed: 'rgba(169, 112, 255, 0.2)',
  white: '#ffffff',
  black: '#000000',
  textPrimary: '#1a1a1a',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  background: '#f8fafc',
  border: '#e5e7eb',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // zIndex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: screenWidth * 0.8,
    maxWidth: 290,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
	  borderTopRightRadius: 25,
    borderBottomRightRadius: 20,
  },
  sidebarContent: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? StatusBar.currentHeight || 44 : StatusBar.currentHeight || 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryTransparent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  menuContainer: {
    flex: 1,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    paddingHorizontal: 22,
    paddingVertical: 16,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 22,
    marginHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  menuItemActive: {
    backgroundColor: colors.primaryTransparent,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  menuIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    flex: 1,
  },
  menuTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  chevron: {
    marginLeft: 'auto',
  },
  footer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    // backgroundColor: 'rgba(239, 68, 68, 0.1)',
    backgroundColor: '#rgba(255, 227, 227, 0.2)',
    borderWidth: 1,
    // borderColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'red',
  },
  logoutIcon: {
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
});

const Sidebar = ({ isOpen, onClose, isHomePage = true, style }) => {
  const router = useRouter();
  const navigation = useNavigation();
  const { profile, logout } = useContext(AppContext);
  const [isManager, setIsManager] = useState(false);
  const [empId, setEmpId] = useState([]);
  const [empShift, setEmpShift] = useState({});
  const [isShift, setIsShift] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-screenWidth));
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  useEffect(() => {
    if (profile) {
      setEmpShift(profile?.current_shift);
      setEmpId(profile?.emp_id);
      setIsManager(profile?.is_manager);
      setIsShift(profile?.is_shift_applicable);
    }
  }, [profile]);

  useEffect(() => {
    if (isOpen) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -screenWidth,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen]);

  const handleOverlayPress = () => {
    if (onClose) onClose();
  };

  const handleMenuPress = (action) => {
    action();
    if (onClose) onClose();
  };

  // Navigation handlers
  const handlePressHelp = () => {  
    router.push({
      pathname: 'HelpScr',
      params: { empId },
    });
  };

  const handlePressRequest = () => {  
    router.push({
      pathname: 'RequestScr',
      params: { empId },
    });
  };

  const handlePressEvent = () => {  
    router.push({
      pathname: 'EventScr',
      params: { empId },
    });
  };

  const handlePressShift = () => {  
    router.push({
      pathname: 'ShiftScr',
      params: { empId, empShift },
    });
  };

  const handlePressTraining = () => {  
    router.push({
      pathname: 'TrainingScr',
    });
  };
  
  const handlePressEmployee = () => {  
    router.push({
      pathname: 'EmployeeList',
    });
  };

  const handlePressProfile = () => {
    router.push('profile');
  };

  const handleAppointee = () => {
    router.push({ pathname: 'AddAppointee' });
  };

  // Menu items configuration
  const accountMenuItems = [
    {
      name: "My Profile",
      icon: <Ionicons name="person-outline" size={20} color={colors.textSecondary} />,
      action: handlePressProfile,
      show: true,
      hasChevron: true,
    },
    {
      name: "Add Appointee",
      icon: <MaterialIcons name="person-add" size={20} color={colors.textSecondary} />,
      action: handleAppointee,
      show: isManager,
      hasChevron: true,
      badge: "New",
    },
    {
      name: "Employee List",
      icon: <FontAwesome6 name="users" size={18} color={colors.textSecondary} />,
      action: handlePressEmployee,
      show: isManager,
      hasChevron: true,
    },
  ].filter(item => item.show);

  const appMenuItems = [
    {
      name: "Help Desk",
      icon: <Feather name="help-circle" size={20} color={colors.textSecondary} />,
      action: handlePressHelp,
      show: true,
      hasChevron: true,
    },
    {
      name: "Request Desk",
      icon: <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />,
      action: handlePressRequest,
      show: true,
      hasChevron: true,
    },
    {
      name: "Event Updates",
      icon: <MaterialIcons name="tips-and-updates" size={20} color={colors.textSecondary} />,
      action: handlePressEvent,
      show: true,
      hasChevron: true,
    },
    {
      name: "Shift Information",
      icon: <MaterialIcons name="calendar-month" size={20} color={colors.textSecondary} />,
      action: handlePressShift,
      show: isShift,
      hasChevron: true,
    },
    {
      name: "My Training",
      icon: <MaterialIcons name="book" size={20} color={colors.textSecondary} />,
      action: handlePressTraining,
      show: true,
      hasChevron: true,
    }
  ].filter(item => item.show);

  const renderMenuItem = (item, index, isActive = false) => (
    <TouchableOpacity
      key={index}
      style={[styles.menuItem, isActive && styles.menuItemActive]}
      onPress={() => handleMenuPress(item.action)}
      activeOpacity={0.7}
    >
      <View style={styles.menuIcon}>
        {item.icon}
      </View>
      <Text style={[styles.menuText, isActive && styles.menuTextActive]}>
        {item.name}
      </Text>
      {/* {item.badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
      )} */}
      {item.hasChevron && (
        <View style={styles.chevron}>
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={isActive ? colors.primary : colors.textMuted} 
          />
        </View>
      )}
    </TouchableOpacity>
  );

  if (!isOpen) return null;

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity 
        style={styles.overlay} 
        onPress={handleOverlayPress}
        activeOpacity={1}
      />
      
      <Animated.View 
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: slideAnim }],
          }
        ]}
      >
        <SafeAreaView style={styles.sidebarContent}>
          {/* Header with Profile */}
          <View style={styles.header}>
              <AntDesign name="leftcircle" size={24} style={{position: "absolute", right: 20, top: 10}} color="black"  onPress={handleOverlayPress} />
            <View style={styles.profileSection}>
              <View style={styles.avatar}>
                {profile.image ? (
                  <Image source={{ uri: profile.image }} style={{ width: 56, height: 56, borderRadius: 28 }} />
                ) : (
                  <Feather name="user" size={24} color={colors.primary} />
                )}
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {profile?.name || 'Welcome User'}
                </Text>
                <Text style={styles.profileEmail}>
                  {profile?.email_id || 'user@company.com'}
                </Text>
              </View>
            </View>
          </View>

          {/* Menu Items */}
          <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
            {/* Account Section */}
            <Text style={styles.sectionTitle}>Account</Text>
            {accountMenuItems.map((item, index) => 
              renderMenuItem(item, `account-${index}`)
            )}

            {/* App Section */}
            <Text style={styles.sectionTitle}>Application</Text>
            {appMenuItems.map((item, index) => 
              renderMenuItem(item, `app-${index}`)
            )}
          </ScrollView>

          {/* Footer with Logout */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={() => setIsLogoutModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.logoutIcon}>
                <Feather name="log-out" size={20} color={colors.error} />
              </View>
              <Text style={styles.logoutText}>LOGOUT</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
      <ConfirmationModal
            visible={isLogoutModalVisible}
            message="Are you sure you want to logout?"
            onConfirm={() => {
              setIsLogoutModalVisible(false);
              logout();
            }}
            onCancel={() => setIsLogoutModalVisible(false)}
            confirmText="Logout"
            cancelText="Cancel"
          />
    </View>
  );
};

export default Sidebar;