import React, { useEffect, useLayoutEffect, useState } from 'react';
import { FlatList, View, Text, Alert, Linking, TouchableOpacity, StyleSheet, TextInput, Animated, Easing } from 'react-native';
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
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import DropdownPicker from '../components/DropdownPicker';

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
  background-color: ${props => props.isApproved ? '#e8f5e9' : '#f5f5f5'};
  border-radius: 8px;
  margin-bottom: 8px;
  border-left-width: 4px;
  border-left-color: ${props => props.isApproved ? '#4caf50' : '#a970ff'};
`;

const GroupTitleContainer = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

const GroupTitle = styled.Text`
  font-weight: bold;
  color: #333;
`;

const GroupStatus = styled.Text`
  font-size: 12px;
  color: ${props => props.isApproved ? '#4caf50' : '#666'};
  margin-left: 8px;
  font-style: italic;
`;

const GroupAmount = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: ${props => props.isApproved ? '#4caf50' : '#333'};
  margin-right: 8px;
`;

const GroupContent = styled.View`
  padding-left: 10px;
  border-left-width: 2px;
  border-left-color: #a970ff;
  margin-left: 10px;
`;

const SearchContainer = styled.View.attrs(() => ({
  style: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
}))`
  flex-direction: row;
  align-items: center;
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 15px;
  margin-horizontal: 10px;
`;

const FilterContainer = styled.View.attrs(() => ({
  style: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
}))`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  margin-horizontal: 10px;
  border-width: 1px;
  border-color: #f1f1f1;
`;


const FilterHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const FilterTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #495057;
`;

const ClearFiltersButton = styled.TouchableOpacity`
  background-color: #6c5ce7;
  padding: 12px;
  border-radius: 10px;
  margin-top: 10px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const ClearFiltersText = styled.Text`
  color: white;
  font-weight: bold;
  margin-left: 8px;
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
});

const ClaimScreen = (props) => {
  const {
    headerTitle = "My Claim",
    buttonLabel = "Apply Claim",
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
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedClaimIdFilter, setSelectedClaimIdFilter] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [claimToDelete, setClaimToDelete] = useState(null);
  const navigation = useNavigation();

  const statusOptions = [
    { label: 'Submitted', value: 'S' },
    { label: 'Approved', value: 'A' },
    { label: 'Forwarded', value: 'F' },
    { label: 'Rejected', value: 'R' },
    { label: 'Back to Claimant', value: 'B' },
  ];

  const rotateAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (groupedClaims.length > 0 && Object.keys(expandedGroups).length === 0) {
      const lastGroupClaimId = groupedClaims[groupedClaims.length - 1].claim_id;
      setExpandedGroups({ [lastGroupClaimId]: true });
    }
  }, [groupedClaims]);

  useEffect(() => {
    fetchEmpId();
  }, []);

  useEffect(() => {
    if (empId) {
      fetchClaimDetails();
    }
  }, [empId]);

  useEffect(() => {
    filterClaims();
  }, [allClaims, activeTab, searchQuery, selectedStatus, selectedClaimIdFilter, selectedEmployee, selectedItem]);

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

  const filterClaims = () => {
    let filtered = [...allClaims];

    // Filter based on tab
    if (activeTab === 'drafts') {
      filtered = filtered.filter(claim => claim.status === 'N' || claim.expense_status === 'N');
    } else {
      filtered = filtered.filter(claim => claim.status !== 'N' && claim.expense_status !== 'N');
    }

    // Apply other filters
    if (searchQuery) {
      filtered = filtered.filter(claim => 
        claim.claim_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.employee_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter(claim => claim.expense_status === selectedStatus);
    }

    if (selectedClaimIdFilter) {
      filtered = filtered.filter(claim => claim.claim_id === selectedClaimIdFilter);
    }

    if (selectedEmployee) {
      filtered = filtered.filter(claim => claim.employee_name === selectedEmployee);
    }

    if (selectedItem) {
      filtered = filtered.filter(claim => claim.item_name === selectedItem);
    }

    setFilteredClaims(filtered);

    // Group claims for "all" tab
    if (activeTab === 'all') {
      const grouped = filtered.reduce((acc, claim) => {
        const existingGroup = acc.find(group => group.claim_id === claim.claim_id);
        if (existingGroup) {
          existingGroup.claims.push(claim);
        } else {
          acc.push({
            claim_id: claim.claim_id,
            claims: [claim]
          });
        }
        return acc;
      }, []);
      setGroupedClaims(grouped);
    }
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
    getEmpClaim(requestData, empId).then((res) => {
      setAllClaims(res.data || []);
      setIsLoading(false);
    }).catch((err) => {
      setIsLoading(false);
      console.error("Error fetching claim data:", err);
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

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
      claim_id: claimToDelete.claim_id,
      call_mode: "DELETE",
    };

    try {
      await postClaimAction(claimPayload);
      Alert.alert('Success', 'Claim deleted successfully!');
      fetchClaimDetails();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete claim.');
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

  const closeModal = () => {
    setModalVisible(false);
  };

  const handlePress = (mode) => {
    router.push({
      pathname: 'ClaimApply',
      params: { mode: mode || (activeTab === 'drafts' ? 'ADD' : 'APPLY') }
    });
  };

  const handleSubmitDrafts = () => {
    if (filteredClaims.length === 0) {
      Alert.alert('No Drafts', 'There are no draft claims to submit.');
      return;
    }
    
    const uniqueClaimIds = [...new Set(filteredClaims.map(claim => claim.claim_id))];
    if (uniqueClaimIds.length > 1) {
      Alert.alert('Error', 'Cannot submit drafts from different claims together.');
      return;
    }
    
    setSelectedClaimId(uniqueClaimIds[0]);
    setShowConfirmModal(true);
  };

  const confirmSubmitDrafts = async () => {
    setShowConfirmModal(false);
    setIsLoading(true);
    
    const claimPayload = {
      claim_id: selectedClaimId,
      call_mode: "SUBMIT_ALL",
    };

    try {
      await postClaimAction(claimPayload);
      Alert.alert('Success', 'Drafts submitted successfully!');
      fetchClaimDetails();
    } catch (error) {
      Alert.alert('Action Failed', 'Failed to submit drafts.');
      console.error('Error submitting drafts:', error);
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

  const renderClaimItem = ({ item }) => (
    <ClaimCard 
      claim={item}
      onPress={handleCardPress}
      onDelete={() => promptDeleteClaim(item)}
      onViewFile={handleViewFile}
      getStatusText={getStatusText}
    />
  );

  const toggleGroup = (claimId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [claimId]: !prev[claimId]
    }));
  };

  const isGroupApproved = (claims) => {
    return claims.every(claim => claim.expense_status === 'A' && claim.status !== 'N');
  };

  const calculateGroupTotal = (claims) => {
    return claims.reduce((total, claim) => {
      const amount = parseFloat(claim.expense_amt) || 0;
      return total + amount;
    }, 0);
  };

  const renderGroupedClaimItem = ({ item, index }) => {
    const isApproved = isGroupApproved(item.claims);
    const groupTotal = calculateGroupTotal(item.claims);
    
    return (
      <View style={{ marginBottom: 10 }}>
        <GroupHeader 
          onPress={() => toggleGroup(item.claim_id)}
          isApproved={isApproved}
        >
          <GroupTitleContainer>
            <GroupTitle>Claim ID: {item.claim_id}</GroupTitle>
            {isApproved && (
              <GroupStatus isApproved={true}>Approved</GroupStatus>
            )}
          </GroupTitleContainer>
          
          <GroupAmount isApproved={isApproved}>
            ₹{groupTotal.toFixed(2)}
          </GroupAmount>
          
          <Ionicons 
            name={expandedGroups[item.claim_id] ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color={isApproved ? '#4caf50' : '#666'} 
            style={styles.icon}
          />
        </GroupHeader>
        
        {expandedGroups[item.claim_id] && (
          <GroupContent>
            {item.claims.map((claim, index) => (
              <ClaimCard 
                key={`${claim.id}-${index}`}
                claim={claim}
                onPress={handleCardPress}
                onViewFile={handleViewFile}
                getStatusText={getStatusText}
                onDelete={() => promptDeleteClaim(claim)}
                style={{ marginBottom: index === item.claims.length - 1 ? 0 : 8 }}
              />
            ))}
          </GroupContent>
        )}
      </View>
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedStatus(null);
    setSelectedClaimIdFilter(null);
    setSelectedEmployee(null);
    setSelectedItem(null);
  };

  const getDropdownOptions = (key) => {
    const uniqueValues = [...new Set(allClaims.map(item => item[key]))];
    return uniqueValues.map(value => ({ label: value, value }));
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
        icon1Name={activeTab === 'drafts' ? "add-circle" : null}
        icon1OnPress={activeTab === 'drafts' ? () => handlePress('ADD') : null}
      />
      
      <Container>
        <TabContainer>
          <TabButton 
            active={activeTab === 'all'} 
            onPress={() => setActiveTab('all')}
          >
            <TabText active={activeTab === 'all'}>Claims</TabText>
          </TabButton>
          <TabButton 
            active={activeTab === 'drafts'} 
            onPress={() => setActiveTab('drafts')}
          >
            <TabText active={activeTab === 'drafts'}>Draft Claims</TabText>
          </TabButton>
        </TabContainer>

        <SearchContainer>
          <MaterialIcons name="search" size={24} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search claims..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={toggleFilters}
          >
            <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
              <FontAwesome name="filter" size={20} color="white" />
            </Animated.View>
          </TouchableOpacity>
        </SearchContainer>

        {showFilters && (
          <FilterContainer>
            <FilterHeader>
              <FilterTitle>Filters</FilterTitle>
              {(searchQuery || selectedStatus || selectedClaimIdFilter || selectedEmployee || selectedItem) && (
                <TouchableOpacity onPress={clearAllFilters}>
                  <Text style={{ color: '#6c5ce7', fontWeight: '500' }}>Clear All</Text>
                </TouchableOpacity>
              )}
            </FilterHeader>

            {activeTab !== 'drafts' && (
              <View style={styles.dropdownContainer}>
                <DropdownPicker
                  label="Status"
                  data={statusOptions}
                  value={selectedStatus}
                  setValue={setSelectedStatus}
                />
              </View>
            )}

            <View style={styles.dropdownContainer}>
              <DropdownPicker
                label="Claim ID"
                data={getDropdownOptions('claim_id')}
                value={selectedClaimIdFilter}
                setValue={setSelectedClaimIdFilter}
              />
            </View>

            

            <View style={styles.dropdownContainer}>
              <DropdownPicker
                label="Item Name"
                data={getDropdownOptions('item_name')}
                value={selectedItem}
                setValue={setSelectedItem}
              />
            </View>

            <ClearFiltersButton onPress={clearAllFilters}>
              <FontAwesome name="times" size={16} color="white" />
              <ClearFiltersText>Clear Filters</ClearFiltersText>
            </ClearFiltersButton>
          </FilterContainer>
        )}

        {activeTab === 'all' ? (
          <FlatList
            data={[...groupedClaims].reverse()}
            renderItem={renderGroupedClaimItem}
            keyExtractor={(item) => item.claim_id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={<EmptyMessage data={'claims'} />}
          />
        ) : (
          <FlatList
            data={[...filteredClaims].reverse()}
            renderItem={renderClaimItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={<EmptyMessage data={'draft claims'} />}
          />
        )}

        {(activeTab === 'drafts' && filteredClaims.length > 0) && (
          <ButtonWrapper>
            <ApplyButton 
              onPress={handleSubmitDrafts}
              buttonText='Submit Drafts'
              icon='send'
            />
          </ButtonWrapper>
        )}

        {activeTab !== 'drafts' && (
          <ButtonWrapper>
            <ApplyButton 
              onPress={() => handlePress('APPLY')}
              buttonText={buttonLabel}
              icon='add-circle'
            />
          </ButtonWrapper>
        )}

        {selectedClaim && (
          <ModalComponent
            isVisible={isModalVisible}
            claim={selectedClaim}
            onClose={closeModal}
          />
        )}

        <ConfirmationModal
          visible={showConfirmModal}
          message="Are you sure you want to submit all draft claims?"
          onConfirm={confirmSubmitDrafts}
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
      </Container>
      <Loader visible={isLoading} />
    </SafeAreaView>
  );
};

export default ClaimScreen;