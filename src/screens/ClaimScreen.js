import React, { useEffect, useLayoutEffect, useState } from 'react';
import { FlatList, View, Text, Alert, Linking, TouchableOpacity, StyleSheet, TextInput, Animated, Easing, Dimensions } from 'react-native';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { getEmpClaim, postClaimAction } from '../services/productServices';
import HeaderComponent from '../components/HeaderComponent';
import ImageViewer from 'react-native-image-zoom-viewer';
import ModalComponent from '../components/ModalComponent';
import ClaimCard from '../components/ClaimCard';
import ApplyButton from '../components/ApplyButton';
import Loader from '../components/old_components/Loader';
import styled from 'styled-components/native';
import EmptyMessage from '../components/EmptyMessage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfirmationModal from '../components/ConfirmationModal';
import { Ionicons } from '@expo/vector-icons';
import FilterModal from '../components/FilterModal';
import SuccessModal from '../components/SuccessModal';
import ErrorModal from '../components/ErrorModal';

const { width } = Dimensions.get('window');

const Container = styled.View`
  flex: 1;
  padding: 10px;
  background-color: #fff;
`;

const TabContainer = styled.View`
  flex-direction: row;
  margin-bottom: 10px;
  border-bottom-width: 1px;
  border-bottom-color: #ccc;
`;

const TabButton = styled.TouchableOpacity`
  flex: 1;
  padding: 12px;
  align-items: center;
  border-bottom-width: 2px;
  border-bottom-color: ${props => props.active ? '#a970ff' : 'transparent'};
`;

const TabText = styled.Text`
  font-size: 14px;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  color: ${props => props.active ? '#a970ff' : '#666'};
`;

const ButtonWrapper = styled.View`
  padding: 10px;
  background-color: #fff;
`;

const GroupHeader = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: ${props => props.isApproved ? '#e8f5e9' : props.isDraft ? '#f0e5ff' : '#f5f5f5'};
  border-radius: 8px;
  margin-bottom: 8px;
  border-left-width: 4px;
  border-left-color: ${props => props.isApproved ? '#4caf50' : props.isDraft ? '#a970ff' : '#ff9800'};
`;

const GroupTitleContainer = styled.View`
  flex-direction: column;
  flex: 1;
`;

const GroupTitle = styled.Text`
  font-weight: bold;
  color: #333;
  font-size: ${width < 400 ? 14 : 16}px;
  max-width: ${width * 0.6}px;
`;

const GroupSubtitle = styled.Text`
  font-size: ${width < 400 ? 12 : 14}px;
  color: #666;
  margin-top: 4px;
`;

const GroupStatus = styled.Text`
  font-size: ${width < 400 ? 10 : 12}px;
  color: ${props => props.isApproved ? '#4caf50' : props.isDraft ? '#a970ff' : '#666'};
  margin-left: 8px;
  font-style: italic;
`;

const GroupAmount = styled.Text`
  font-size: ${width < 400 ? 14 : 16}px;
  font-weight: bold;
  color: ${props => props.isApproved ? '#4caf50' : props.isDraft ? '#a970ff' : '#333'};
`;

const GroupContent = styled.View`
  padding-left: 10px;
  border-left-width: 2px;
  border-left-color: #a970ff;
  margin-left: 10px;
`;

const StatusContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 15px;
  margin-horizontal: 10px;
`;

const StatusItem = styled.View`
  align-items: center;
  flex: 1;
`;

const StatusTitle = styled.Text`
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
`;

const StatusValue = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${props => props.color || '#333'};
`;

const SubmitButton = styled.TouchableOpacity`
  background-color: #4CAF50;
  padding: 10px;
  border-radius: 5px;
  margin-top: 8px;
  align-items: center;
`;

const SubmitButtonText = styled.Text`
  color: white;
  font-weight: bold;
`;

const styles = StyleSheet.create({
  icon: {
    marginLeft: 8,
  },
  approvedIcon: {
    color: '#4caf50',
    marginLeft: 8,
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
  dropdownContainer: {
    marginBottom: 15,
  },
  groupHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
  },
  groupAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  draftBadge: {
    backgroundColor: '#a970ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  draftBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

const ClaimScreen = (props) => {
  const {
    headerTitle = "My Claim",
    buttonLabel = "Add Claim",
    requestData = 'GET',
  } = props.data;

  const router = useRouter();
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [allClaims, setAllClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [groupedClaims, setGroupedClaims] = useState([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [empId, setEmpId] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedClaimIdFilter, setSelectedClaimIdFilter] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [claimToDelete, setClaimToDelete] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('CY'); // Default to Current Year
  const [statusSummary, setStatusSummary] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    draft: 0
  });
  const [pendingFilters, setPendingFilters] = useState({
  status: null,
  claimId: null,
  period: 'CY'
});
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  const navigation = useNavigation();

  const statusOptions = [
  { label: 'Submitted', value: 'S' },
  { label: 'Approved', value: 'A' },
  { label: 'Forwarded', value: 'F' },
  { label: 'Rejected', value: 'R' },
  { label: 'Back to Claimant', value: 'B' },
  { label: 'Draft', value: 'N' },
];

const periodOptions = [
  { label: 'Current Year', value: 'CY' },
  { label: 'Last Year', value: 'LY' },
  { label: 'All Claims', value: 'ALL' },
];

  useEffect(() => {
    if (allClaims.length > 0) {
      updateStatusSummary(allClaims);
    }
  }, [allClaims]);

//   useEffect(() => {
//   // Check if both sections are empty and data is loaded
//   if (!isLoading && allClaims.length === 0) {
//     // Small timeout to ensure UI is ready
//     const timer = setTimeout(() => {
//       handlePress('ADD NEW');
//     }, 100);
    
//     return () => clearTimeout(timer);
//   }
// }, [allClaims, isLoading]);

  const updateStatusSummary = (claims) => {
    const summary = {
      total: claims.length,
      approved: claims.filter(claim => claim.expense_status === 'A').length,
      pending: claims.filter(claim => ['S', 'F', 'B'].includes(claim.expense_status)).length,
      draft: claims.filter(claim => claim.expense_status === 'N').length
    };
    setStatusSummary(summary);
  };

  const getDropdownOptions = (key) => {
  // First filter claims based on the active tab
  let tabFilteredClaims = [...allClaims];
  
  if (activeTab === 'drafts') {
    tabFilteredClaims = tabFilteredClaims.filter(claim => 
      claim.expense_status === 'N' || 
      claim.status_display === 'Not Submitted'
    );
  } else {
    tabFilteredClaims = tabFilteredClaims.filter(claim => 
      claim.expense_status !== 'N' && 
      claim.status_display !== 'Not Submitted'
    );
  }

  // Then filter out claims with empty claim_items arrays
  const validClaims = tabFilteredClaims.filter(claim => 
    claim.claim_items && claim.claim_items.length > 0
  );
  
  const uniqueValues = [...new Set(validClaims.map(item => item[key]))];
  return uniqueValues.map(value => ({ label: value, value }));
};

  useEffect(() => {
    if (groupedClaims.length > 0 && Object.keys(expandedGroups).length === 0) {
      const initialExpanded = {};
      groupedClaims.forEach(claim => {
        initialExpanded[claim.master_claim_id] = true;
      });
      setExpandedGroups(initialExpanded);
    }
  }, [groupedClaims]);

  useEffect(() => {
    fetchEmpId();
  }, []);

  useEffect(() => {
  if (empId) {
    fetchClaimDetails();
  }
}, [empId, selectedPeriod]);

  useEffect(() => {
    if (allClaims.length > 0) {
      const hasDrafts = allClaims.some(claim => claim.expense_status === 'N');
      if (hasDrafts) {
        setActiveTab('drafts');
      }
    }
  }, [allClaims]);

  useEffect(() => {
    filterClaims();
  }, [allClaims, activeTab, searchQuery, selectedStatus, selectedClaimIdFilter]);

  

// Helper function to parse claim dates in "DD-MMM-YYYY" format
const parseClaimDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    // Handle "DD-MMM-YYYY" format (e.g., "26-Jun-2025")
    if (/^\d{2}-[a-zA-Z]{3}-\d{4}$/.test(dateString)) {
      const months = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
      };
      
      const [day, month, year] = dateString.split('-');
      return new Date(year, months[month], day);
    }
    
    return new Date(dateString); // Fallback for other formats
  } catch (e) {
    console.warn('Failed to parse date:', dateString);
    return null;
  }
};

  useEffect(() => {
  // Reset filters when tab changes
  setSelectedStatus(null);
  setSelectedClaimIdFilter(null);
  // Keep the period filter as it's independent of tabs
}, [activeTab]);

const filterClaims = () => {
  let filtered = [...allClaims];

  // Filter by period - only if not 'ALL'
  if (selectedPeriod && selectedPeriod !== 'ALL') {
    const currentYear = new Date().getFullYear();
    filtered = filtered.filter(claim => {
      const claimDate = parseClaimDate(claim.claim_date);
      if (!claimDate) return true;
      
      const claimYear = claimDate.getFullYear();
      return selectedPeriod === 'CY' 
        ? claimYear === currentYear 
        : claimYear === currentYear - 1;
    });
  }

  // Filter by active tab
  if (activeTab === 'drafts') {
    filtered = filtered.filter(claim => 
      claim.expense_status === 'N' || 
      claim.status_display === 'Not Submitted'
    );
  } else {
    filtered = filtered.filter(claim => 
      claim.expense_status !== 'N' && 
      claim.status_display !== 'Not Submitted'
    );
  }

  // Apply other filters
  if (searchQuery) {
    filtered = filtered.filter(claim => 
      claim.master_claim_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.employee_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (selectedStatus) {
    filtered = filtered.filter(claim => claim.expense_status === selectedStatus);
  }

  if (selectedClaimIdFilter) {
    filtered = filtered.filter(claim => claim.master_claim_id === selectedClaimIdFilter);
  }

  setFilteredClaims(filtered);
  setGroupedClaims(filtered);
};

  const fetchEmpId = async () => {
    try {
      const id = await AsyncStorage.getItem('empNoId');
      setEmpId(id);
    } catch (error) {
      console.error("Error fetching employee ID:", error);
    }
  };

  const fetchClaimDetails = () => {
  setIsLoading(true);
  
  const apiPeriod = selectedPeriod === 'ALL' ? null : selectedPeriod;
  
  getEmpClaim(requestData, empId, apiPeriod || 'CY')
    .then((res) => {
      const claims = res.data || [];
      const validClaims = (res.data || []).filter(claim => 
      !claim.master_claim_id || // Keep non-grouped claims
      (claim.master_claim_id && claim.claim_items && claim.claim_items.length > 0)
    );
    
    setAllClaims(validClaims);
      setIsLoading(false);
      
      // If no claims at all, show add screen
      if (claims.length === 0) {
        handlePress('ADD NEW');
      }
    })
    .catch((error) => {
      setIsLoading(false);
      console.error("Error fetching claim data:", error);
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  console.log("Claim Data--",allClaims)

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

  const handleDeleteClaim = async () => {
    if (!claimToDelete) return;
    
    setIsLoading(true);
    const claimPayload = {
      claim_id: claimToDelete.id,
      call_mode: "DELETE",
    };

    try {
      await postClaimAction(claimPayload);
      // Alert.alert('Success', 'Claim deleted successfully!');
      setSuccessMessage("Claim deleted successfully!")
      setShowSuccessModal(true)
      fetchClaimDetails();
    } catch (error) {
      // Alert.alert('Error', 'Failed to delete claim.');
      setErrorMessage("Failed to delete claim.");
      setShowErrorModal(true);
      console.error('Error deleting claim:', error);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setClaimToDelete(null);
    }
  };

  const promptDeleteClaim = (claim) => {
    setClaimToDelete(claim);
    setShowDeleteConfirm(true);
  };

  const promptUpdateClaim = (claim) => {
  // If it's a grouped claim with items, take the first item for editing
  const claimToEdit = claim.claim_items && claim.claim_items.length > 0 
    ? claim.claim_items[0] 
    : claim;
  
  router.push({
    pathname: 'ClaimApply',
    params: { 
      mode: 'EDIT',
      claimData: JSON.stringify(claimToEdit),
      masterClaimId: claim.master_claim_id
    }
  });
};

  // console.log("Claim==",allClaims[3])

  const closeModal = () => {
    setModalVisible(false);
  };

  const handlePress = (mode, masterClaimId = null, claimData = null) => {
  const params = {
    mode: mode || (activeTab === 'drafts' ? 'ADD' : 'APPLY'),
  };

  if (masterClaimId) {
    params.masterClaimId = masterClaimId;
  }

  if (claimData) {
    params.claimData = JSON.stringify(claimData);
  }

  router.push({
    pathname: 'ClaimApply',
    params
  });
};

  const handleSubmitClaim = (masterClaimId) => {
  // Find the complete claim object to verify it's a draft
  const claimToSubmit = groupedClaims.find(claim => claim.master_claim_id === masterClaimId);
  
  if (claimToSubmit && (claimToSubmit.expense_status === 'N' || claimToSubmit.status_display === 'Not Submitted')) {
    setSelectedClaimId(masterClaimId);
    setShowConfirmModal(true);
  } else {
    // Alert.alert('Error', 'Only draft claims can be submitted');
    setErrorMessage("Only draft claims can be submitted");
    setShowErrorModal(true);
  }
};

  const confirmSubmitClaim = async () => {
  if (!selectedClaimId) return;
  
  setShowConfirmModal(false);
  setIsLoading(true);
  
  const claimPayload = {
    m_claim_id: selectedClaimId, // Use the selected master claim ID
    call_mode: "SUBMIT_ALL",
  };

  try {
    await postClaimAction(claimPayload);
    // Alert.alert('Success', 'Claim submitted successfully!');
    setSuccessMessage("Claim submitted successfully!");
    setShowSuccessModal(true)
    fetchClaimDetails(); // Refresh the claims list
  } catch (error) {
    setErrorMessage("Failed to submit claim.");
    setShowErrorModal(true)
    // Alert.alert('Action Failed', 'Failed to submit claim.');
    console.error('Error submitting claim:', error);
  } finally {
    setIsLoading(false);
  }
};

  const handleViewFile = (fileUrl) => {
    const fileExtension = fileUrl.split('.').pop().split('?')[0].toLowerCase();

    if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
      setSelectedImageUrl(fileUrl);
    } else if (fileExtension === 'pdf') {
      Alert.alert('File Downloading', 'The file is being downloaded.');
      Linking.openURL(fileUrl).catch((err) =>
        console.error('Failed to open URL:', err)
      );
    } else {
      console.warn('Unsupported file type:', fileExtension);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'S':
        return 'SUBMITTED';
      case 'N':
        return 'DRAFT';
      case 'A':
        return 'APPROVED';
      case 'F':
        return 'FORWARDED';
      case 'B':
        return 'BACK TO CLAIMANT';
      case 'R':
        return 'REJECTED';
      default:
        return status === 'A' ? 'APPROVED' : 'PENDING';
    }
  };


  const toggleGroup = (claimId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [claimId]: !prev[claimId]
    }));
  };

  const isGroupApproved = (claim) => {
    return claim.expense_status === 'A';
  };

  const isGroupDraft = (claim) => {
    return claim.expense_status === 'N' || claim.status_display === 'Not Submitted';
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

  const renderGroupedClaimItem = ({ item, index }) => {
  const isApproved = isGroupApproved(item);
  const isDraft = isGroupDraft(item);
  const groupTotal = calculateGroupTotal(item);
  
  return (
    <View style={{ marginBottom: 10, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', elevation: 2 }}>
      <GroupHeader 
        onPress={() => toggleGroup(item.master_claim_id)}
        isApproved={isApproved}
        isDraft={isDraft}
        activeOpacity={0.7}
        style={{ 
          padding: 16,
          borderLeftWidth: 6,
          borderLeftColor: isApproved ? '#4caf50' : isDraft ? '#a970ff' : '#ff9800',
          backgroundColor: isApproved ? '#f0f9f0' : isDraft ? '#f8f2ff' : '#fffaf2'
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: 'bold', 
                color: isApproved ? '#4caf50' : isDraft ? '#a970ff' : '#454545',
                marginRight: 8
              }}>
                {item.master_claim_id}
              </Text>
              {/* {isDraft && (
                <View style={{ 
                  backgroundColor: '#a970ff', 
                  paddingHorizontal: 8, 
                  paddingVertical: 2, 
                  borderRadius: 10 
                }}>
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>DRAFT</Text>
                </View>
              )} */}
            </View>
            <Text style={{ fontSize: 13, color: '#666' }}>
              {item.claim_date} • {item.claim_items?.length || 1} item{item.claim_items?.length !== 1 ? 's' : ''}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: 'bold', 
              color: isApproved ? '#4caf50' : isDraft ? '#a970ff' : '#454545',
              marginRight: 8
            }}>
              ₹{groupTotal.toFixed(2)}
            </Text>
            <Ionicons 
              name={expandedGroups[item.master_claim_id] ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={isApproved ? '#4caf50' : isDraft ? '#a970ff' : '#454545'} 
            />
          </View>
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
                getStatusText={getStatusText}
                onUpdate={() => promptUpdateClaim({
                  ...claimItem,
                  master_claim_id: item.master_claim_id
                })}
                style={{ 
                  marginBottom: index === item.claim_items.length - 1 ? 0 : 8,
                }}
              />
            ))
          ) : (
            <ClaimCard 
              claim={item}
              onPress={handleCardPress}
              onViewFile={handleViewFile}
              getStatusText={getStatusText}
              onUpdate={() => promptUpdateClaim(item)}
            />
          )}
          
          {isDraft && (
            <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
              <TouchableOpacity 
                style={{ 
                  flex: 1,
                  padding: 12,
                  backgroundColor: '#a970ff',
                  borderRadius: 8,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                onPress={() => handlePress('ADD', item.master_claim_id)}
              >
                <Ionicons name="add" size={18} color="white" />
                <Text style={{ color: 'white', marginLeft: 8, fontWeight: '500' }}>Add Item</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={{ 
                  flex: 1,
                  padding: 12,
                  backgroundColor: '#4CAF50',
                  borderRadius: 8,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                onPress={() => handleSubmitClaim(item.master_claim_id)}
              >
                <Ionicons name="send" size={18} color="white" />
                <Text style={{ color: 'white', marginLeft: 8, fontWeight: '500' }}>Submit</Text>
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
      <SafeAreaView style={{ flex: 1 }}>
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
    <SafeAreaView style={{ flex: 1 }}>
      <HeaderComponent 
        headerTitle={headerTitle} 
        onBackPress={handleBackPress}
        icon2Name={"add-circle"}
        icon2OnPress={() => handlePress('ADD')}
        icon1Name="filter"
        icon1OnPress={() => setShowFilterModal(true)}
      />
      
      <Container>
          <StatusContainer>
            <StatusItem>
              <StatusTitle>Total</StatusTitle>
              <StatusValue>{filteredClaims.length}</StatusValue>
            </StatusItem>
            <StatusItem>
              <StatusTitle>Approved</StatusTitle>
              <StatusValue color="#4CAF50">
                {filteredClaims.filter(claim => claim.expense_status === 'A').length}
              </StatusValue>
            </StatusItem>
            <StatusItem>
              <StatusTitle>Pending</StatusTitle>
              <StatusValue color="#FF9800">
                {filteredClaims.filter(claim => ['S', 'F', 'B'].includes(claim.expense_status)).length}
              </StatusValue>
            </StatusItem>
            <StatusItem>
              <StatusTitle>Drafts</StatusTitle>
              <StatusValue color="#9C27B0">
                {filteredClaims.filter(claim => claim.expense_status === 'N').length}
              </StatusValue>
            </StatusItem>
          </StatusContainer>
        {/* )} */}

        <TabContainer>
          <TabButton 
            active={activeTab === 'drafts'} 
            onPress={() => setActiveTab('drafts')}
          >
            <TabText active={activeTab === 'drafts'}>Draft Claims</TabText>
          </TabButton>
          
          <TabButton 
            active={activeTab === 'all'} 
            onPress={() => setActiveTab('all')}
          >
            <TabText active={activeTab === 'all'}>Submitted Claims</TabText>
          </TabButton>

        </TabContainer>

        <FlatList
          data={[...groupedClaims].reverse()}
          renderItem={renderGroupedClaimItem}
          keyExtractor={(item) => item.master_claim_id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <EmptyMessage 
              data={activeTab === 'drafts' ? 'draft claims' : 'claims'} 
              action={activeTab === 'drafts' ? () => handlePress('ADD NEW') : null}
              actionText={activeTab === 'drafts' ? 'Create New Claim' : null}
              message={activeTab === 'drafts' ? 'Create New Claim' : "No Claim Found"}
              subMessage={`You don't have any claims to dispaly. Please Click on the above 'PLUS' icon to add a new claim.`}
            />
          }
        />

        {selectedClaim && (
          <ModalComponent
            isVisible={isModalVisible}
            claim={selectedClaim}
            onClose={closeModal}
            onCancelLeave={() => promptDeleteClaim(selectedClaim)}  // Add this line
            showCancelButton={selectedClaim.expense_status === 'N'}
          />
        )}

        <ConfirmationModal
          visible={showConfirmModal}
          message="Are you sure you want to submit this claim?"
          onConfirm={confirmSubmitClaim}
          onCancel={() => setShowConfirmModal(false)}
          confirmText="Yes"
          cancelText="No"
        />

        <ConfirmationModal
          visible={showDeleteConfirm}
          message="Are you sure you want to delete this claim?"
          onConfirm={handleDeleteClaim}
          onCancel={() => setShowDeleteConfirm(false)}
          confirmText="Delete"
          cancelText="Cancel"
          confirmColor="#ff4444"
        />

        <FilterModal
          visible={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onClearFilters={() => {
            setPendingFilters({
              status: null,
              claimId: null,
              period: 'CY'
            });
            setSelectedStatus(null);
            setSelectedClaimIdFilter(null);
            setSelectedPeriod('CY');
          }}
          onApplyFilters={() => {
            setSelectedStatus(pendingFilters.status);
            setSelectedClaimIdFilter(pendingFilters.claimId);
            setSelectedPeriod(pendingFilters.period);
            setShowFilterModal(false);
          }}
          filterConfigs={[
            // Only show status filter in "Submitted Claims" tab
            ...(activeTab === 'all' ? [{
              label: "Status",
              options: statusOptions.filter(opt => opt.value !== 'N'), // Exclude Draft option
              value: pendingFilters.status,
              setValue: (value) => setPendingFilters(prev => ({...prev, status: value})),
            }] : []),
            {
              label: "Claim ID",
              options: getDropdownOptions('master_claim_id'),
              value: pendingFilters.claimId,
              setValue: (value) => setPendingFilters(prev => ({...prev, claimId: value})),
            },
            {
              label: "Period",
              options: periodOptions,
              value: pendingFilters.period,
              setValue: (value) => setPendingFilters(prev => ({...prev, period: value})),
            }
          ]}
          modalTitle="Filter Claims"
        />
      </Container>
      <Loader visible={isLoading} />

      <SuccessModal
        visible={showSuccessModal}
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />
      <ErrorModal
        visible={showErrorModal}
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />
    </SafeAreaView>
  );
};

export default ClaimScreen;