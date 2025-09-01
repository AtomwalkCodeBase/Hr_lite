import React, { useEffect, useState, useContext, useRef } from 'react';
import { 
  View, 
  Text, 
  Image,
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  ScrollView,
  Platform,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useNavigation } from '@react-navigation/native';
import { AppContext } from '../../context/AppContext';
import { getCompanyInfo } from '../services/authServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import HeaderComponent from '../components/HeaderComponent';
import Loader from '../components/old_components/Loader';
import { SafeAreaView } from 'react-native-safe-area-context';

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');

const IdCard = () => {
  const { profile } = useContext(AppContext);
  const navigation = useNavigation();
  const cardRef = useRef();
  const [hideButtons, setHideButtons] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [company, setCompany] = useState({});
  const [userPin, setUserPin] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companyResponse] = await Promise.all([
          getCompanyInfo(),
        ]);
        setCompany(companyResponse?.data || {});
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchUserPin = async () => {
      const storedPin = await AsyncStorage.getItem('userPin');
      setUserPin(storedPin);
    };

    fetchData();
    fetchUserPin();
  }, []);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleDownload = async () => {
    try {
      setHideButtons(true);
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (!cardRef.current) {
        console.error("cardRef is not attached to a native component.");
        setHideButtons(false);
        return;
      }

      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
      });

      setHideButtons(false);
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('Error capturing ID Card:', error);
      setHideButtons(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    
    const day = parseInt(parts[0], 10);
    const month = parts[1];
    const year = parseInt(parts[2], 10);
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = monthNames.indexOf(month);
    const date = new Date(year, monthIndex, day);
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <HeaderComponent headerTitle="Digital ID Card" onBackPress={handleBackPress} />
      
      <Loader visible={isLoading} onTimeout={() => setIsLoading(false)} />
      
      {!isLoading && (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* ID Card */}
            <View 
              ref={cardRef} 
              collapsable={false} 
              style={styles.cardOuterContainer}
            >
              <LinearGradient
                colors={['#1a237e', '#303f9f', '#3949ab']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardContainer}
              >
                {/* Company Header */}
                <View style={styles.companyHeader}>
                  {company.image ? (
                    <Image 
                      source={{ uri: company.image }} 
                      style={styles.companyLogo} 
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.companyPlaceholder}>
                      <Text style={styles.companyPlaceholderText}>
                        {company.name ? company.name.charAt(0) : "C"}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.companyName}>{company.name || "Company Name"}</Text>
                </View>
                
                {/* ID Card Body */}
                <View style={styles.cardBody}>
                  {/* Left side - Employee Photo */}
                  <View style={styles.photoSection}>
                    <View style={styles.photoContainer}>
                      <Image 
                        source={{ uri: profile?.image }} 
                        style={styles.profileImage}
                        defaultSource={require('../../assets/images/Id-Bg.png')}
                      />
                    </View>
                    <View style={styles.qrCodeContainer}>
                      <QRCode
                        value={profile?.emp_id || 'Employee ID Not Allocated'}
                        size={width * 0.18}
                        backgroundColor="white"
                      />
                    </View>
                  </View>
                  
                  {/* Right side - Employee Details */}
                  <View style={styles.detailsSection}>
                    <Text style={styles.employeeName}>{profile?.name || "Employee Name"}</Text>
                    {(profile?.grade_name || profile?.job_title) && (
                      <Text style={styles.designation}>{profile?.job_title ? profile?.job_title : profile?.grade_name}</Text>
                    )}
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>ID:</Text>
                      <Text style={styles.detailValue}>{profile?.emp_id || "N/A"}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Dept:</Text>
                      <Text style={styles.detailValue}>{profile?.department_name || "N/A"}</Text>
                    </View>
                    
                    {profile?.mobile_number && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Mobile:</Text>
                        <Text style={styles.detailValue}>{profile?.mobile_number}</Text>
                      </View>
                    )}
                    
                    {profile?.date_of_join && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Joined:</Text>
                        <Text style={styles.detailValue}>{formatDate(profile?.date_of_join)}</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                {/* Footer */}
                <View style={styles.cardFooter}>
                  <Text style={styles.webpageText}>{company.web_page || "www.company.com"}</Text>
                </View>
              </LinearGradient>
            </View>
            
            {/* Action Buttons */}
            {!hideButtons && (
              <TouchableOpacity 
                style={styles.shareButton}
                onPress={handleDownload}
              >
                <Ionicons name="share-outline" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Share ID Card</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 24,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderBox: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
  },
  loaderText: {
    color: '#fff',
    fontSize: 16,
  },
  cardOuterContainer: {
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    marginBottom: 24,
    borderRadius: 12,
  },
  cardContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  companyLogo: {
    width: width * 0.18,
    height: width * 0.18,
    maxWidth: 80,
    maxHeight: 80,
    marginRight: 12,
  },
  companyPlaceholder: {
    width: width * 0.18,
    height: width * 0.18,
    maxWidth: 80,
    maxHeight: 80,
    borderRadius: width * 0.09,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  companyPlaceholderText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  companyName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  cardBody: {
    flexDirection: width > 400 ? 'row' : 'column',
    padding: 16,
    alignItems: 'center',
  },
  photoSection: {
    alignItems: 'center',
    marginRight: width > 400 ? 16 : 0,
    marginBottom: width > 400 ? 0 : 16,
  },
  photoContainer: {
    padding: 4,
    backgroundColor: 'white',
    borderRadius: width * 0.25,
    marginBottom: 12,
  },
  profileImage: {
    width: width * 0.38,
    height: width * 0.38,
    maxWidth: 180,
    maxHeight: 180,
    borderRadius: width * 0.19,
  },
  qrCodeContainer: {
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  detailsSection: {
    flex: 1,
    alignItems: width > 400 ? 'flex-start' : 'center',
    width: width > 400 ? 'auto' : '100%',
  },
  employeeName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: width > 400 ? 'left' : 'center',
  },
  designation: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: width > 400 ? 'left' : 'center',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10,
    width: width > 400 ? 'auto' : '80%',
  },
  detailLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    width: 60,
  },
  detailValue: {
    color: '#fff',
    fontSize: 15,
    flex: 1,
  },
  cardFooter: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 12,
    alignItems: 'center',
  },
  webpageText: {
    color: '#fff',
    fontSize: 14,
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    maxWidth: 250,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default IdCard;