import React, { useContext, useEffect, useLayoutEffect, useState } from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Linking,
  Alert,
  Dimensions,
  Platform,
  Animated,
  Easing
} from 'react-native';
import { MaterialIcons, Feather, FontAwesome } from '@expo/vector-icons';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import { useNavigation, useRouter } from 'expo-router';
import { getEmpClaim } from '../services/productServices';
import ImageViewer from 'react-native-image-zoom-viewer';
import ModalComponent from '../components/ModalComponent';
import EmptyMessage from '../components/EmptyMessage';
import Loader from '../components/old_components/Loader';
import HeaderComponent from '../components/HeaderComponent';
import { AppContext } from '../../context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import DropdownPicker from '../components/DropdownPicker';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 400;
const ITEMS_PER_PAGE = 10; // Number of items to show per page

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 10,
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
    maxWidth: '100%',
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
    borderWidth: 1,
    borderColor: '#ced4da',
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
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40, // Fixed height for consistency
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  viewButtonText: {
    color: '#495057',
  },
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  claimIdContainer: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  claimIdText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c5ce7',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD', // Default background (for submitted)
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  claimBody: {
    marginBottom: 12,
  },
  claimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  claimLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginRight: 4,
    width: 80,
  },
  claimValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6c5ce7',
  },
  actionButtonText: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
    justifyContent: 'center',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#495057',
    paddingLeft: 10,
    paddingVertical: 8,
  },
  filterButton: {
    backgroundColor: '#6c5ce7',
    padding: 10,
    borderRadius: 10,
    marginLeft: 10,
  },
  filterIcon: {
    transform: [{ rotate: '0deg' }],
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f1f1',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  dropdownContainer: {
    marginBottom: 15,
  },
  clearFiltersButton: {
    backgroundColor: '#6c5ce7',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearFiltersText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  leftContainer: {
    flex: 1,
  },
  rightContainer: {
    alignItems: 'flex-end',
    minWidth: 100,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  paginationButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: '#6c5ce7',
  },
  paginationButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  paginationInfo: {
    marginHorizontal: 10,
    fontSize: 14,
    color: '#495057',
  },
});

const ApproveClaim = () => {
  const { profile } = useContext(AppContext);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [claimData, setClaimData] = useState([]);
  const [emp, setEmp] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();
  const requestData = 'APPROVE';

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dropdown states
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [claimIdItems, setClaimIdItems] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeItems, setEmployeeItems] = useState([]);
  const [selectedItemName, setSelectedItemName] = useState(null);
  const [itemNameItems, setItemNameItems] = useState([]);

  // Filter visibility
  const [showFilters, setShowFilters] = useState(false);
  const rotateAnim = useState(new Animated.Value(0))[0];

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    const fetchEmployeeInfo = async () => {
      setLoading(true);
      try {
        const employeeId = profile?.id;
        setEmp(employeeId);
        
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

  useEffect(() => {
    // Initialize dropdown items when claimData changes
    if (claimData.length > 0) {
      // Filter out claims with expense_status "N"
      const filteredClaims = claimData.filter(item => item.expense_status !== 'N');
      
      const uniqueClaimIds = [...new Set(filteredClaims.map(item => item.claim_id))];
      setClaimIdItems(uniqueClaimIds.map(id => ({ label: id, value: id })));

      const uniqueEmployees = [...new Set(filteredClaims.map(item => item.employee_name))];
      setEmployeeItems(uniqueEmployees.map(name => ({ 
        label: name, 
        value: name 
      })));

      const uniqueItemNames = [...new Set(filteredClaims.map(item => item.item_name))];
      setItemNameItems(uniqueItemNames.map(name => ({ 
        label: name, 
        value: name 
      })));

      // Update filtered data and pagination
      applyFilters(searchQuery, selectedClaimId, selectedEmployee, selectedItemName);
    }
  }, [claimData]);

  const toggleFilters = () => {
    Animated.timing(rotateAnim, {
      toValue: showFilters ? 0 : 1,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
    setShowFilters(!showFilters);
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const fetchClaimDetails = async (employeeId) => {
    setIsLoading(true);
    try {
      const res = await getEmpClaim(requestData, employeeId);
      // Filter out claims with expense_status "N"
      const filteredClaims = res.data.filter(item => item.expense_status !== 'N');
      setClaimData(filteredClaims);
      setFilteredData(filteredClaims);
      // Calculate total pages
      setTotalPages(Math.ceil(filteredClaims.length / ITEMS_PER_PAGE));
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
    applyFilters(text, selectedClaimId, selectedEmployee, selectedItemName);
  };

  const applyFilters = (searchText, claimId, employee, itemName) => {
    let filtered = [...claimData];
    
    // Filter out claims with expense_status "N"
    filtered = filtered.filter(item => item.expense_status !== 'N');
    
    if (searchText) {
      filtered = filtered.filter((item) => {
        const empIdMatch = item.employee_name.match(/\[(.*?)\]/);
        const empId = empIdMatch ? empIdMatch[1] : '';
        return empId.includes(searchText);
      });
    }
    
    if (claimId) {
      filtered = filtered.filter(item => item.claim_id === claimId);
    }
    
    if (employee) {
      filtered = filtered.filter(item => item.employee_name === employee);
    }
    
    if (itemName) {
      filtered = filtered.filter(item => item.item_name === itemName);
    }
    
    setFilteredData(filtered);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClaimIdSelect = (value) => {
    setSelectedClaimId(value);
    applyFilters(searchQuery, value, selectedEmployee, selectedItemName);
  };

  const handleEmployeeSelect = (value) => {
    setSelectedEmployee(value);
    applyFilters(searchQuery, selectedClaimId, value, selectedItemName);
  };

  const handleItemNameSelect = (value) => {
    setSelectedItemName(value);
    applyFilters(searchQuery, selectedClaimId, selectedEmployee, value);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedClaimId(null);
    setSelectedEmployee(null);
    setSelectedItemName(null);
    setFilteredData(claimData.filter(item => item.expense_status !== 'N'));
    setTotalPages(Math.ceil(claimData.filter(item => item.expense_status !== 'N').length / ITEMS_PER_PAGE));
    setCurrentPage(1);
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

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return [...filteredData].reverse().slice(startIndex, endIndex);
  };

  const renderClaimItem = ({ item }) => {
  const status = item.expense_status;
  const statusText = getClaimStatus(status);
  const isSubmitted = status === 'S';
  const isForwarded = status === 'F';
  const isRejected = status === 'R';
  const isApproved = status === 'A';

  // Status color mapping
  const statusStyles = {
    S: { backgroundColor: '#E3F2FD', textColor: '#1565C0', icon: 'clock' }, // Submitted
    A: { backgroundColor: '#E8F5E9', textColor: '#2E7D32', icon: 'check-circle' }, // Approved
    F: { backgroundColor: '#F3E5F5', textColor: '#7B1FA2', icon: 'share-2' }, // Forwarded
    R: { backgroundColor: '#FFEBEE', textColor: '#C62828', icon: 'x-circle' }, // Rejected
  };

  const currentStatus = statusStyles[status] || statusStyles['S'];

  return (
    <View style={[styles.claimCard, {
      borderLeftWidth: 5,
      borderLeftColor: currentStatus.textColor
    }]}>
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => handleCardPress(item)}
      >
        <View style={styles.claimHeader}>
          <View style={styles.claimIdContainer}>
            <Text style={styles.claimIdText}>{item.claim_id}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: currentStatus.backgroundColor }]}>
            <Feather 
              name={currentStatus.icon} 
              size={14} 
              color={currentStatus.textColor} 
            />
            <Text style={[styles.statusText, { color: currentStatus.textColor }]}>
              {statusText}
            </Text>
          </View>
        </View>

        {/* Rest of your card content remains the same */}
        <View style={styles.claimBody}>
          <View style={styles.claimRow}>
            <MaterialIcons name="date-range" size={16} color="#6c5ce7" />
            <Text style={styles.claimLabel}>Expense Date:</Text>
            <Text style={styles.claimValue}>{item.expense_date}</Text>
          </View>

          <View style={styles.claimRow}>
            <MaterialIcons name="shopping-cart" size={16} color="#6c5ce7" />
            <Text style={styles.claimLabel}>Item:</Text>
            <Text style={styles.claimValue} numberOfLines={1} ellipsizeMode="tail">
              {item.item_name}
            </Text>
          </View>

          <View style={styles.claimRow}>
            <MaterialIcons name="person" size={16} color="#6c5ce7" />
            <Text style={styles.claimLabel}>Employee:</Text>
            <Text style={styles.claimValue} numberOfLines={1} ellipsizeMode="tail">
              {item.employee_name}
            </Text>
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount:</Text>
            <Text style={[styles.amountValue, { color: currentStatus.textColor }]}>
              ₹{parseFloat(item.expense_amt).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Rest of your buttons remain the same */}
        <View style={styles.buttonContainer}>
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
                {isSubmitted ? 'Approve' : statusText}
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
    </View>
  );
};

  if (selectedImageUrl) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <HeaderComponent headerTitle="View Image" onBackPress={handleBackPress} />
        <View style={{ flex: 1 }}>
          <ImageViewer
            imageUrls={[{ url: selectedImageUrl }]}
            enableSwipeDown={true}
            onSwipeDown={handleBackPress}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <HeaderComponent 
        headerTitle={`Approve Claim List (${filteredData.length})`} 
        onBackPress={handleBackPress} 
      />
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
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={toggleFilters}
          >
            <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
              <FontAwesome name="filter" size={20} color="white" />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filterContainer}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filters</Text>
              {(selectedClaimId || selectedEmployee || selectedItemName) && (
                <TouchableOpacity onPress={clearAllFilters}>
                  <Text style={{ color: '#6c5ce7', fontWeight: '500' }}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.dropdownContainer}>
              <DropdownPicker
                label="Claim ID"
                data={claimIdItems}
                value={selectedClaimId}
                setValue={handleClaimIdSelect}
              />
            </View>

            <View style={styles.dropdownContainer}>
              <DropdownPicker
                label="Employee"
                data={employeeItems}
                value={selectedEmployee}
                setValue={handleEmployeeSelect}
              />
            </View>

            <View style={styles.dropdownContainer}>
              <DropdownPicker
                label="Item Name"
                data={itemNameItems}
                value={selectedItemName}
                setValue={handleItemNameSelect}
              />
            </View>

            <TouchableOpacity 
              style={styles.clearFiltersButton}
              onPress={clearAllFilters}
            >
              <FontAwesome name="times" size={16} color="white" />
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {isLoading ? (
          <Loader visible={isLoading} />
        ) : (
          <>
            <FlatList
              data={getCurrentPageData()}
              renderItem={renderClaimItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<EmptyMessage data="claim" />}
              contentContainerStyle={{ 
                paddingBottom: verticalScale(20),
                flexGrow: 1 
              }}
            />
            
            {filteredData.length > ITEMS_PER_PAGE && (
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  style={styles.paginationButton}
                  onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <Text style={styles.paginationButtonText}>Previous</Text>
                </TouchableOpacity>
                
                <Text style={styles.paginationInfo}>
                  Page {currentPage} of {totalPages}
                </Text>
                
                <TouchableOpacity
                  style={styles.paginationButton}
                  onPress={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <Text style={styles.paginationButtonText}>Next</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
        
        {selectedClaim && (
          <ModalComponent
            isVisible={isModalVisible}
            claim={selectedClaim}
            onClose={closeModal}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default ApproveClaim;