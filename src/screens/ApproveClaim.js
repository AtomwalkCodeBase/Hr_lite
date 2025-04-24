import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Linking,
  Alert,
  SafeAreaView,
  Dimensions,
  Platform,
  ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import { useNavigation, useRouter } from 'expo-router';
import { getEmpClaim } from '../services/productServices';
import ImageViewer from 'react-native-image-zoom-viewer';
import ModalComponent from '../components/ModalComponent';
import EmptyMessage from '../components/EmptyMessage';
import Loader from '../components/old_components/Loader';
import HeaderComponent from '../components/HeaderComponent';
import { getEmployeeInfo } from '../services/authServices';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 400;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  claimCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#a970ff',
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginHorizontal: 10,
    maxWidth: '100%', // Ensure card doesn't exceed screen width
  },
  claimStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  claimText: {
    fontSize: 15,
    color: '#2f2f2f',
    fontWeight: '500',
    marginVertical: 2,
  },
  claimText2: {
    fontSize: 15,
    fontWeight: '500',
    marginVertical: 2,
  },
  claimAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    marginVertical: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  buttonColumn: {
    flexDirection: 'column',
    marginTop: 10,
  },
  viewButton: {
    backgroundColor: '#e9ecef',
  },
  returnButton: {
    backgroundColor: '#ffc107',
  },
  approveButton: {
    backgroundColor: '#3c9df1',
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    opacity: 0.6,
  },
  actionButton: {
    backgroundColor: '#ffc107',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 100,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  viewButtonText: {
    color: '#495057',
  },
  actionButtonText: {
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    padding: 12,
    borderRadius: 20,
    marginBottom: 15,
    marginHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#495057',
    paddingLeft: 10,
  },
  leftContainer: {
    flex: 1,
  },
  rightContainer: {
    alignItems: 'flex-end',
    minWidth: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 8,
    justifyContent: 'center', // Center buttons when they wrap
  },
  buttonBase: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    minWidth: isSmallScreen ? '100%' : 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: isSmallScreen ? undefined : 1,
    maxWidth: isSmallScreen ? '100%' : '48%',
  },
  viewButton: {
    backgroundColor: '#e9ecef',
    borderWidth: 1,
    borderColor: '#ced4da',
  },
  buttonIcon: {
    marginRight: 6,
  },
});

const ApproveClaim = () => {
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [claimData, setClaimData] = useState([]);
  const [profile, setProfile] = useState([]);
  const [emp, setEmp] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();
  const requestData = 'APPROVE';

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    // First fetch employee info
    const fetchEmployeeInfo = async () => {
      setLoading(true);
      try {
        const res = await getEmployeeInfo();
        setProfile(res.data[0]);
        const employeeId = res?.data[0]?.id;
        setEmp(employeeId);
        
        // Now that we have the employee ID, fetch claim details
        if (employeeId) {
          await fetchClaimDetails(employeeId);
        }
      } catch (error) {
        setLoading(false);
        console.error("Error fetching employee info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeInfo();
  }, []);

  const fetchClaimDetails = async (employeeId) => {
    setIsLoading(true);
    try {
      const res = await getEmpClaim(requestData, employeeId);
      setClaimData(res.data);
      setFilteredData(res.data);
    } catch (error) {
      console.error("Error fetching claim details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getClaimStatus = (status) => {
    switch (status) {
      case 'S':
        return 'SUBMITTED';
      case 'A':
        return 'APPROVED';
      case 'F':
        return 'FORWARDED';
      case 'R':
        return 'REJECTED';
      default:
        return 'UNKNOWN';
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = claimData.filter((item) => {
      const empIdMatch = item.employee_name.match(/\[(.*?)\]/);
      const empId = empIdMatch ? empIdMatch[1] : '';
      return empId.includes(text);
    });
    setFilteredData(filtered);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleViewFile = (fileUrl) => {
    const fileExtension = fileUrl.split('.').pop().split('?')[0].toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
      setSelectedImageUrl(fileUrl);
    } else if (fileExtension === 'pdf') {
      Alert.alert('File Downloading', 'The file is being downloaded.');
      Linking.openURL(fileUrl).catch((err) => console.error('Failed to open URL:', err));
    } else {
      console.warn('Unsupported file type:', fileExtension);
    }
  };

  const handleApprove = (claimDetails, callType) => {
    const formattedClaimDetails = typeof claimDetails === 'object'
      ? JSON.stringify(claimDetails)
      : claimDetails;

    router.push({
      pathname: 'ApproveDetails',
      params: {
        claimDetails: formattedClaimDetails,
        callType
      },
    });
  };

  const handleBackPress = () => {
    if (selectedImageUrl) {
      setSelectedImageUrl(null);
    } else {
      router.navigate({
        pathname: 'home',
        params: { screen: 'HomePage' }
      });
    }
  };


  const handleCardPress = (claim) => {
    setSelectedClaim(claim);
    setModalVisible(true);
  };

  const renderClaimItem = ({ item }) => {
    const status = getClaimStatus(item.expense_status);
    const isSubmitted = status === 'SUBMITTED';
    const isForwarded = status === 'FORWARDED';
    const isRejected = status === 'REJECTED';
    const isApproved = status === 'APPROVED';
  
    return (
      <TouchableOpacity
        style={styles.claimCard}
        onPress={() => handleCardPress(item)}
      >
        <View style={styles.claimStatusContainer}>
          <View style={styles.leftContainer}>
            <Text style={styles.claimText}>{item.claim_id}</Text>
            <Text style={styles.claimText}>Expense Date: {item.expense_date}</Text>
            <Text style={styles.claimText}>Item Name: {item.item_name}</Text>
            <Text style={styles.claimText}>{item.employee_name}</Text>
          </View>
          <View style={styles.rightContainer}>
            <Text style={[styles.claimText2, { 
              color: isRejected ? '#dc3545' : isForwarded ? '#ffc107' : '#28a745' 
            }]}>
              {status}
            </Text>
            <Text style={styles.claimAmountText}> ₹ {item.expense_amt}</Text>
          </View>
        </View>
  
        {/* Improved Button Layout */}
        <View style={styles.buttonContainer}>
          {/* View File Button (always visible if file exists) */}
          {item.submitted_file_1 && (
            <TouchableOpacity 
              style={[styles.buttonBase, styles.viewButton]}
              onPress={() => handleViewFile(item.submitted_file_1)}
            >
              <MaterialIcons 
                name="visibility" 
                size={18} 
                color="#495057" 
                style={styles.buttonIcon}
              />
              <Text style={[styles.buttonText, styles.viewButtonText]}>View File</Text>
            </TouchableOpacity>
          )}          
  
          {/* Approve Button (only show if not already approved) */}
          {!isApproved && (
            <TouchableOpacity
              style={[
                styles.buttonBase,
                isSubmitted ? styles.approveButton : styles.disabledButton
              ]}
              onPress={() => isSubmitted && handleApprove(item, 'Approve')}
              disabled={!isSubmitted}
            >
              {isSubmitted && (
                <MaterialIcons 
                  name="check-circle" 
                  size={18} 
                  color="#fff" 
                  style={styles.buttonIcon}
                />
              )}
              <Text style={[styles.buttonText, styles.actionButtonText]}>
                {isSubmitted ? 'Approve' : status}
              </Text>
            </TouchableOpacity>
          )}

          {isSubmitted && (
            <TouchableOpacity 
              style={[styles.buttonBase, styles.returnButton]}
              onPress={() => handleApprove(item, 'Return')}
            >
              <MaterialIcons 
                name="undo" 
                size={18} 
                color="#fff" 
                style={styles.buttonIcon}
              />
              <Text style={[styles.buttonText, styles.actionButtonText]}>Return</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (selectedImageUrl) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <HeaderComponent headerTitle="View Image" onBackPress={handleBackPress} />
        <View style={{ flex: 1 }}>
          {/* Using ImageViewer for zoom functionality */}
          <ImageViewer
            imageUrls={[{ url: selectedImageUrl }]} // Array of images
            enableSwipeDown={true}
            onSwipeDown={handleBackPress} // Close the image viewer on swipe down
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <HeaderComponent headerTitle="Approve Claim List" onBackPress={handleBackPress} />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={moderateScale(24)} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Employee ID"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        
        {isLoading ? (
          <Loader visible={isLoading} />
        ) : (
          <ScrollView 
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            <FlatList
              data={[...filteredData].reverse()}
              renderItem={renderClaimItem}
              keyExtractor={(item) => item.claim_id.toString()}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<EmptyMessage data={`claim`}/>}
              contentContainerStyle={{ paddingBottom: verticalScale(20) }}
              scrollEnabled={false}
            />
          </ScrollView>
        )}
        
        {selectedClaim && (
          <ModalComponent
            isVisible={isModalVisible}
            claim={selectedClaim}
            onClose={closeModal}
          />
        )}
      </View>
    </>
  );
};

export default ApproveClaim;