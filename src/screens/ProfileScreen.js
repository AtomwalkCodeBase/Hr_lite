import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { AppContext } from '../../context/AppContext';
import { getEmployeeInfo, getProfileInfo } from '../services/authServices';
import { useNavigation, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRModal from '../components/QRModal';
import HeaderComponent from '../components/HeaderComponent';
import Loader from '../components/old_components/Loader';
import moment from 'moment';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const { logout } = useContext(AppContext);
  const [profile, setProfile] = useState({});
  const [fetchData, setFetchData] = useState([]);
  const [userPin, setUserPin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await getEmployeeInfo();
        setFetchData(res?.data);

        
        setProfile(res?.data[0]);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchUserPin = async () => {
      const storedPin = await AsyncStorage.getItem('userPin');
      setUserPin(storedPin);
    };

    fetchProfile();
    fetchUserPin();
  }, []);

  const handleBackPress = () => router.back();
  const handlePressPassword = () => router.push({ pathname: 'ResetPassword' });
  const handleQRPress = () => setIsModalVisible(true);
  const handleCloseModal = () => setIsModalVisible(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return moment(dateString, 'DD-MMM-YYYY').format('MMMM Do, YYYY');
  };

  // Handle image loading errors
  const handleImageError = () => {
    return require('../../assets/images/default-profile.jpg'); // Make sure you have this asset
  };

  console.log("Profile==",profile)
  console.log("Response Data====",fetchData)

  return (
    <>
      <HeaderComponent headerTitle="Employee Profile" onBackPress={handleBackPress} />
      {isLoading ? (
        <Loader visible={isLoading} />
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={profile?.image ? { uri: profile.image } : require('../../assets/images/default-profile.jpg')}
                style={styles.profileImage}
                onError={handleImageError}
                defaultSource={require('../../assets/images/default-profile.jpg')}
              />
            </View>
            <View style={styles.profileTitle}>
              <Text style={styles.userName}>{profile?.name || 'Employee Name'}</Text>
              <Text style={styles.userPosition}>{profile?.grade_name || 'Position'}</Text>
            </View>
          </View>

          {/* QR Button */}
          <TouchableOpacity style={styles.qrButton} onPress={handleQRPress}>
            <MaterialIcons name="qr-code" size={24} color="#2c3e50" />
          </TouchableOpacity>

          {/* Employee Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>EMPLOYEE DETAILS</Text>
            
            <InfoRow 
              icon="badge" 
              label="Employee ID" 
              value={profile?.emp_id || 'EMP-007'} 
            />
            <InfoRow 
              icon="business" 
              label="Department" 
              value={profile?.department_name || 'BLR OFFICE'} 
            />
            <InfoRow 
              icon="date-range" 
              label="Date of Joining" 
              value={formatDate(profile?.date_of_join)} 
            />

          </View>

          {/* Contact Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>CONTACT INFORMATION</Text>
            
            <InfoRow 
              icon="mail" 
              label="Email" 
              value={profile?.email_id || 'mail@gmail.com'} 
            />
            {profile?.mobile_number && <InfoRow 
              icon="phone" 
              label="Mobile" 
              value={profile?.mobile_number} 
            />}
          </View>

          {/* Leave Information */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>LEAVE INFORMATION</Text>
            <InfoRow 
              icon="event-available" 
              label="Total Leaves" 
              value={profile?.max_no_leave || 17} 
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handlePressPassword}
            >
              <MaterialIcons name="lock" size={20} color="#fff" />
              <Text style={styles.buttonText}>{userPin ? 'UPDATE SECURITY PIN' : 'SET SECURITY PIN'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => {logout()}}
            >
              <MaterialIcons name="logout" size={20} color="#e74c3c" />
              <Text style={[styles.buttonText, styles.logoutText]}>LOGOUT</Text>
            </TouchableOpacity>
          </View>

          {/* QR Modal */}
          <QRModal
            isVisible={isModalVisible}
            onClose={handleCloseModal}
            qrValue={profile?.emp_id || 'EMP-007'}
          />
        </ScrollView>
      )}
    </>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <MaterialIcons name={icon} size={20} color="#7f8c8d" style={styles.infoIcon} />
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#ecf0f1',
    paddingBottom: 30,
  },
  profileHeader: {
    backgroundColor: '#fff',
    padding: 25,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileTitle: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  userPosition: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  qrButton: {
    position: 'absolute',
    top: 30,
    right: 20,
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 0,
    marginVertical: 8,
    marginHorizontal: 0,
    padding: 20,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#95a5a6',
    marginBottom: 15,
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoIcon: {
    marginRight: 15,
    width: 24,
    textAlign: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#95a5a6',
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 16,
    color: '#34495e',
    fontWeight: '500',
  },
  actionContainer: {
    padding: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 4,
    marginBottom: 15,
  },
  primaryButton: {
    backgroundColor: '#3498db',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 10,
    fontSize: 15,
  },
  logoutText: {
    color: '#e74c3c',
  },
});

export default ProfileScreen;