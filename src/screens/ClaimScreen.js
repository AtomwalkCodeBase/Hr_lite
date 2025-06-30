import React, { useEffect, useLayoutEffect, useState } from 'react';
import { FlatList, View, Text, Alert, Linking, TouchableOpacity, StyleSheet } from 'react-native';
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

const styles = StyleSheet.create({
  icon: {
    marginLeft: 8,
  },
  approvedIcon: {
    color: '#4caf50',
    marginLeft: 8,
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
  const navigation = useNavigation();

  useEffect(() => {
  // Expand the last group (which will be first after reverse) by default when data loads
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
  // Filter claims based on active tab
  if (activeTab === 'drafts') {
    const drafts = allClaims.filter(claim => claim.status === 'N' || claim.expense_status === 'N'); // Include both status and expense_status checks
    setFilteredClaims(drafts);
    setGroupedClaims([]);
  } else {
    const nonDrafts = allClaims.filter(claim => claim.status !== 'N' && claim.expense_status !== 'N'); // Exclude drafts
    setFilteredClaims(nonDrafts);
    
    // Group claims by claim_id for All Claims tab
    const grouped = nonDrafts.reduce((acc, claim) => {
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
}, [allClaims, activeTab]);

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


  const handleDeleteClaim = async (claimId) => {
  setIsLoading(true);
  const claimPayload = {
    claim_id: claimId,  // Use the passed claimId
    call_mode: "DELETE",
  };

  try {
    await postClaimAction(claimPayload);
    Alert.alert('Success', 'Draft deleted successfully!');
    fetchClaimDetails(); // Refresh the data
  } catch (error) {
    Alert.alert('Action Failed', 'Failed to delete draft.');
    console.error('Error deleting draft:', error);
  } finally {
    setIsLoading(false);
  }
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
  
  // Check if all drafts have the same claim_id
  const uniqueClaimIds = [...new Set(filteredClaims.map(claim => claim.claim_id))];
  if (uniqueClaimIds.length > 1) {
    Alert.alert('Error', 'Cannot submit drafts from different claims together.');
    return;
  }
  
  setSelectedClaimId(uniqueClaimIds[0]);
  setShowConfirmModal(true);
};

console.log("Claims==",allClaims)

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
      fetchClaimDetails(); // Refresh the data
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

  // Update getStatusText to use expense_status
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
      onDelete={handleDeleteClaim}
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
            {/* {isApproved && (
              <GroupStatus isApproved={true}>Approved</GroupStatus>
            )} */}
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
                onDelete={handleDeleteClaim}
                style={{ marginBottom: index === item.claims.length - 1 ? 0 : 8 }}
              />
            ))}
          </GroupContent>
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
        icon1Name={activeTab === 'drafts' ? "add" : null}
        icon1OnPress={activeTab === 'drafts' ? () => handlePress('ADD') : null}
      />
      
      <Container>
        <TabContainer>
          <TabButton 
            active={activeTab === 'all'} 
            onPress={() => setActiveTab('all')}
          >
            <TabText active={activeTab === 'all'}>All Claims</TabText>
          </TabButton>
          <TabButton 
            active={activeTab === 'drafts'} 
            onPress={() => setActiveTab('drafts')}
          >
            <TabText active={activeTab === 'drafts'}>Drafts</TabText>
          </TabButton>
        </TabContainer>

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
      </Container>
      <Loader visible={isLoading} />
    </SafeAreaView>
  );
};

export default ClaimScreen;