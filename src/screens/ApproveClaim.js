import React, { useContext, useEffect, useLayoutEffect, useState } from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
  Dimensions,
  Platform,
  Animated,
  Easing
} from 'react-native';
import { MaterialIcons, Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
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
import FilterModal from '../components/FilterModal';
import styled from 'styled-components/native';
import ClaimCard from '../components/ClaimCard';
import ClaimModalComponent from '../components/ClaimModalComponent';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 400;
const ITEMS_PER_PAGE = 10;

const GroupHeader = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: ${props => props.isApproved ? '#f0f9f0' : props.isForwarded ? '#f0f5ff' : props.isRejected ? '#ffebee' : '#E3F2FD'};
  border-radius: 12px;
  margin-bottom: 8px;
  border-left-width: 6px;
  border-left-color: ${props => props.isApproved ? '#4caf50' : props.isForwarded ? '#3c9df1' : props.isRejected ? '#f44336' : '#2196F3'};
`;

const GroupTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  /* color: ${props => props.isApproved ? '#4caf50' : props.isForwarded ? '#3c9df1' : props.isRejected ? '#f44336' : '#ff9800'}; */
  color: #000;
  margin-right: 8px;
`;

const GroupSubtitle = styled.Text`
  font-size: 13px;
  color: #666;
  margin-top: 4px;
`;

const GroupAmount = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${props => props.isApproved ? '#4caf50' : props.isForwarded ? '#3c9df1' : props.isRejected ? '#f44336' : '#454545'};
  margin-right: 8px;
`;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 10,
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
  approveButton: {
    backgroundColor: '#3c9df1',
  },
  returnButton: {
    backgroundColor: '#ffc107',
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionButtonText: {
    color: '#fff',
  },
  viewButtonText: {
    color: '#495057',
  },
  buttonIcon: {
    marginRight: 6,
  },
  masterButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  masterActionButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
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
  filterButton: {
    backgroundColor: '#6c5ce7',
    padding: 10,
    borderRadius: 10,
    marginLeft: 10,
  },
  itemCountBadge: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  itemCountText: {
    fontSize: 12,
    color: '#424242',
    fontWeight: 'bold',
  },
});

const ApproveClaim = () => {
  const { profile } = useContext(AppContext);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [claimData, setClaimData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const requestData = 'APPROVE';
  const [expandedGroups, setExpandedGroups] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter state
  const [filters, setFilters] = useState({
    status: null,
    claimId: null,
    employee: null,
  });
  const [activeFilters, setActiveFilters] = useState({
    status: null,
    claimId: null,
    employee: null,
  });
  const [pendingFilters, setPendingFilters] = useState({
    status: null,
    claimId: null,
    employee: null,
  });
  const [showFilterModal, setShowFilterModal] = useState(false);

  const filterConfigs = React.useMemo(() => [
  {
    label: "Status",
    options: [
      { label: "Submitted", value: "S" },
      { label: "Approved", value: "A" },
      { label: "Forwarded", value: "F" },
      { label: "Rejected", value: "R" },
    ],
    value: pendingFilters.status,
    setValue: (value) => setPendingFilters(prev => ({ ...prev, status: value })),
  },
  {
    label: "Claim ID",
    options: claimData.length > 0 
      ? [...new Set(claimData.map(item => item.master_claim_id))].map(id => ({
          label: id,
          value: id,
        }))
      : [],
    value: pendingFilters.claimId,
    setValue: (value) => setPendingFilters(prev => ({ ...prev, claimId: value })),
  },
  {
    label: "Employee",
    options: claimData.length > 0
      ? [...new Set(claimData.map(item => item.employee_name))].map(name => ({
          label: name,
          value: name,
        }))
      : [],
    value: pendingFilters.employee,
    setValue: (value) => setPendingFilters(prev => ({ ...prev, employee: value })),
  }
], [claimData, pendingFilters]);  // Recreate when these dependencies change

  const handleApplyFilters = () => {
    setActiveFilters(pendingFilters);
    setShowFilterModal(false);
  };

  const handleClearFilters = () => {
    setPendingFilters({
      status: null,
      claimId: null,
      employee: null,
    });
    setActiveFilters({
      status: null,
      claimId: null,
      employee: null,
    });
  };

  const getFilterCount = () => {
  let count = 0;
  if (activeFilters.status) count++;
  if (activeFilters.claimId) count++;
  if (activeFilters.employee) count++;
  return count;
};

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, endIndex);
  };

  const formatIndianCurrency = (num) => {
  if (!num && num !== 0) return null; // handles null, undefined, empty string
  
  // Convert to number to handle cases like "12.00"
  const numberValue = Number(num);
  if (isNaN(numberValue)) return null;

  // Check if it's an integer (has no decimal or decimal is .00)
  const isInteger = Number.isInteger(numberValue);
  
  // Format the number based on whether it's an integer
  const numStr = isInteger ? numberValue.toString() : numberValue.toString();
  const parts = numStr.split('.');
  let integerPart = parts[0];
  const decimalPart = !isInteger && parts.length > 1 ? `.${parts[1]}` : '';

  // Format the integer part with Indian comma separators
  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  
  if (otherNumbers !== '') {
    integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  } else {
    integerPart = lastThree;
  }

  return `₹ ${integerPart}${decimalPart}`;
};

  useEffect(() => {
    let filtered = [...claimData];
    
    if (activeFilters.status) {
      filtered = filtered.filter(item => item.expense_status === activeFilters.status);
    }
    
    if (activeFilters.claimId) {
      filtered = filtered.filter(item => item.master_claim_id === activeFilters.claimId);
    }
    
    if (activeFilters.employee) {
      filtered = filtered.filter(item => item.employee_name === activeFilters.employee);
    }
    
    setFilteredData(filtered);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setCurrentPage(1);
  }, [activeFilters, claimData]);

  const closeModal = () => {
    setModalVisible(false);
  };

  useLayoutEffect(() => {
    const fetchClaimDetails = async () => {
      setIsLoading(true);
      try {
        const employeeId = profile?.id;
        if (employeeId) {
          const res = await getEmpClaim(requestData, employeeId, 'CY');
          // Filter out claims with expense_status "N"
          const filteredClaims = res.data.filter(item => item.expense_status !== 'N');
          setClaimData(filteredClaims);
          setFilteredData(filteredClaims);
          setTotalPages(Math.ceil(filteredClaims.length / ITEMS_PER_PAGE));
          
          // Initialize expanded groups
          const initialExpanded = {};
          filteredClaims.forEach(claim => {
            initialExpanded[claim.master_claim_id] = false;
          });
          setExpandedGroups(initialExpanded);
        }
      } catch (error) {
        console.error("Error fetching claim details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClaimDetails();
  }, []);

  const getClaimStatus = (status) => {
    switch (status) {
      case 'S': return 'SUBMITTED';
      case 'A': return 'APPROVED';
      case 'F': return 'FORWARDED';
      case 'R': return 'REJECTED';
      default: return 'UNKNOWN';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'S': return '#454545';
      case 'A': return '#4caf50';
      case 'F': return '#3c9df1';
      case 'R': return '#f44336';
      default: return '#666';
    }
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

  const handleApprove = (claimDetails, callType, isMaster = false) => {
    router.push({
      pathname: 'ApproveDetails',
      params: {
        claimDetails: JSON.stringify(claimDetails),
        callType,
        isMaster: isMaster.toString()
      },
    });
  };

  const handleCardPress = (claim) => {
    setSelectedClaim(claim);
    setModalVisible(true);
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

  const handleFilterPress = () => {
  // Reset pending filters to current active filters when opening modal
  setPendingFilters({ ...activeFilters });
  setShowFilterModal(true);
};

  const toggleGroup = (claimId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [claimId]: !prev[claimId]
    }));
  };

  const calculateGroupTotal = (claim) => {
    if (claim.claim_items && claim.claim_items.length > 0) {
      return claim.claim_items.reduce((total, item) => {
        const amount = parseFloat(item.expense_amt) || 0;
        return total + amount;
      }, 0);
    }
    return parseFloat(claim.expense_amt) || 0;
  };

  console.log("Claim Data==",claimData[2])

  const renderGroupedClaimItem = ({ item }) => {
  const masterStatus = item.expense_status;
  const masterStatusText = getClaimStatus(masterStatus);
  const masterStatusColor = getStatusColor(masterStatus);
  const isMasterSubmitted = masterStatus === 'S';
  const isMasterApproved = masterStatus === 'A';
  const isMasterForwarded = masterStatus === 'F';
  const isMasterRejected = masterStatus === 'R';
  const groupTotal = calculateGroupTotal(item);
  
  return (
    <View style={{ marginBottom: 15, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', elevation: 2 }}>
      <GroupHeader 
        onPress={() => toggleGroup(item.master_claim_id)}
        isApproved={isMasterApproved}
        isForwarded={isMasterForwarded}
        isRejected={isMasterRejected}
        activeOpacity={0.7}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <GroupTitle 
              isApproved={isMasterApproved}
              isForwarded={isMasterForwarded}
              isRejected={isMasterRejected}
            >
              {item.master_claim_id}
            </GroupTitle>
            {/* <View style={{ 
              backgroundColor: `${masterStatusColor}20`, 
              paddingHorizontal: 8, 
              paddingVertical: 2, 
              borderRadius: 10 
            }}>
              <Text style={{ 
                fontSize: 10, 
                fontWeight: 'bold', 
                color: masterStatusColor 
              }}>
                {masterStatusText}
              </Text>
            </View> */}
          </View>
          <GroupSubtitle>
            {item.claim_date}
          </GroupSubtitle>
          <GroupSubtitle>
            {item.employee_name}
          </GroupSubtitle>
          <View style={styles.itemCountBadge}>
                        <Text style={styles.itemCountText}>
                          {item.claim_items?.length || 1} item{item.claim_items?.length !== 1 ? 's' : ''}
                        </Text>
                      </View>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <GroupAmount 
            isApproved={isMasterApproved}
            isForwarded={isMasterForwarded}
            isRejected={isMasterRejected}
          >
            {formatIndianCurrency(groupTotal.toFixed(2))}
          </GroupAmount>
          <Ionicons 
            name={expandedGroups[item.master_claim_id] ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color={masterStatusColor} 
          />
        </View>
      </GroupHeader>
      
      {expandedGroups[item.master_claim_id] && (
        <View style={{ padding: 12 }}>
          {item.claim_items && item.claim_items.length > 0 ? (
              item.claim_items.map((claimItem, index) => (
                <ClaimCard 
                  key={`${claimItem.id}-${index}`}
                  claim={claimItem}
                  onPress={handleCardPress}
                  onViewFile={handleViewFile}
                  getStatusText={getClaimStatus}
                  style={{ 
                    marginBottom: index === item.claim_items.length - 1 ? 0 : 8,
                  }}
                />
              ))
            ) : (
              <ClaimCard 
                claim={item}
                onPress={() => handleApprove(item, 'Item')}
                onViewFile={handleViewFile}
                getStatusText={getClaimStatus}
              />
            )}

          
          {(isMasterSubmitted || isMasterForwarded) && (
            <View style={styles.masterButtonContainer}>
              
              {/* <TouchableOpacity
                style={[styles.masterActionButton, { backgroundColor: '#ffc107' }]}
                onPress={() => handleApprove(item, 'Return', true)}
              >
                <MaterialIcons 
                  name="undo" 
                  size={18} 
                  color="#fff" 
                  style={styles.buttonIcon}
                />
                <Text style={[styles.buttonText, styles.actionButtonText]}>Return All</Text>
              </TouchableOpacity> */}
              <TouchableOpacity
                style={[styles.masterActionButton, { backgroundColor: '#a970ff' }]}
                onPress={() => handleApprove(item, 'Approve', true)}
              >
                <MaterialIcons 
                  name="check-circle" 
                  size={18} 
                  color="#fff" 
                  style={styles.buttonIcon}
                />
                <Text style={[styles.buttonText, styles.actionButtonText]}>Approve</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
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
      {/* <HeaderComponent 
        headerTitle={`Approve Claim List (${filteredData.length})`}
        onBackPress={handleBackPress}
        icon1Name="filter"
        icon1OnPress={() => setShowFilterModal(true)}
      /> */}
      
      <HeaderComponent 
  headerTitle={`Approve Claim List (${filteredData.length})`}
  onBackPress={handleBackPress}
  icon1Name="filter"
  icon1OnPress={handleFilterPress}  // Use the handler instead of direct setState
  filterCount={getFilterCount()}
/>

      <View style={styles.container}>
        {isLoading ? (
          <Loader visible={isLoading} />
        ) : (
          <>
            <FlatList
              data={getCurrentPageData()}
              renderItem={renderGroupedClaimItem}
              keyExtractor={(item) => item.master_claim_id.toString()}
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
          <ClaimModalComponent
            isVisible={isModalVisible}
            claim={selectedClaim}
            onClose={closeModal}
          />
        )}
        
        <FilterModal
  visible={showFilterModal}
  onClose={() => {
    setPendingFilters({ ...activeFilters });  // Reset to active filters
    setShowFilterModal(false);
  }}
  onClearFilters={() => {
    const clearedFilters = {
      status: null,
      claimId: null,
      employee: null,
    };
    setPendingFilters(clearedFilters);
    setActiveFilters(clearedFilters);
    setShowFilterModal(false);  // Close modal after clearing
  }}
  onApplyFilters={handleApplyFilters}
  filterConfigs={filterConfigs}
  modalTitle={`Filter Claims (${getFilterCount()})`}
/>
      </View>
    </SafeAreaView>
  );
};

export default ApproveClaim;