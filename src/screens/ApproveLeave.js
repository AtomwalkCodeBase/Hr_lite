import React, { useEffect, useLayoutEffect, useState } from 'react';
import { FlatList, SafeAreaView, Text, View } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Link, useRouter } from "expo-router";
import ModalComponent from '../components/ModalComponent';
import { getEmpLeave } from '../services/productServices';
import HeaderComponent from '../components/HeaderComponent';
import LeaveActionModal from '../components/LeaveActionModal';
import LeaveCard from '../components/ApproveLeaveCard';
import EmptyMessage from '../components/EmptyMessage';
import SuccessModal from '../components/SuccessModal';
import Loader from '../components/old_components/Loader';  // Import the Loader component

const Container = styled.View`
  padding: 16px;
  height: 100%;
  background-color: #fff;
`;

const SearchContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: #e9ecef;
  padding: 12px;
  border-radius: 28px;
  margin-bottom: 15px;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  font-size: 16px;
  color: #495057;
  padding-left: 10px;
`;

const LeaveScreen = (props) => {
  const navigation = useNavigation();
  const router = useRouter();
  const [empId, setEmpId] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [leaveData, setLeavedata] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRejectModalVisible, setRejectModalVisible] = useState(false);
  const [isApproveModalVisible, setApproveModalVisible] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Success modal state
  const [refreshing, setRefreshing] = useState(false); // New state for FlatList refreshing
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // State for loader visibility

  useEffect(() => {
    if (empId) { // Only call leaveDetails if empId is set
      leaveDetails();
    }
  }, [empId]); // Add empId as a dependency

  useEffect(() => {
      if (props?.data?.empId) {
        setEmpId(props.data.empId);
      }
    }, [props.data?.empId]);

  const handleRefresh = () => {
    setRefreshing(true);
    leaveDetails();
  };

  const leaveDetails = () => {
    setIsLoading(true);
    getEmpLeave("A", empId)
      .then((res) => {
        setLeavedata(res.data);
        setFilteredData(res.data);
      })
      .catch((error) => {
        console.error("Error fetching leave data:", error);
        // You could also set an error state here to show to the user
      })
      .finally(() => {
        setIsLoading(false);
        setRefreshing(false);
      });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleBackPress = () => {
    router.navigate({
      pathname: 'home',
      params: { screen: 'HomePage' }
    });
  };
  
  const handleCardPress = (leave) => {
    setSelectedLeave(leave);
    setModalVisible(true);
  };

  const handleSearch = (text) => {
    setSearchQuery(text.trim().toLowerCase());
    const filtered = leaveData.filter((item) =>
      item.emp_data.emp_id.trim().toLowerCase().includes(text)
    );
    setFilteredData(filtered);
  };

  const renderLeaveItem = ({ item }) => (
    <LeaveCard
      leave={item}
      onPress={() => handleCardPress(item)}
      onApprove={() => {
        setSelectedLeave(item);
        setApproveModalVisible(true);
      }}
      onReject={() => {
        setSelectedLeave(item);
        setRejectModalVisible(true);
      }}
    />
  );

  return (
    <>
      <HeaderComponent headerTitle="Approve Leave List" onBackPress={handleBackPress}/>
      <Container>
        <SearchContainer>
          <MaterialIcons name="search" size={24} color="#888" />
          <SearchInput
            placeholder="Search Employee ID"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </SearchContainer>
        
        {/* Display the Loader while data is loading or refreshing */}
        <Loader visible={isLoading || refreshing} />

        <FlatList
          data={filteredData}
          renderItem={renderLeaveItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={<EmptyMessage data={`leave`}/>}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
        {selectedLeave && (
          <LeaveActionModal 
            isVisible={isApproveModalVisible} 
            leave={selectedLeave} 
            onClose={() => { 
              setApproveModalVisible(false);
              handleRefresh();
            }} 
            actionType="APPROVE"
            setShowSuccessModal={setShowSuccessModal} // Pass setShowSuccessModal
            setSuccessMessage={setSuccessMessage}
          />
        )}
        {selectedLeave && (
          <LeaveActionModal 
            isVisible={isRejectModalVisible} 
            leave={selectedLeave} 
            onClose={() => { 
              setRejectModalVisible(false);
              handleRefresh();
            }} 
            actionType="REJECT"
            setShowSuccessModal={setShowSuccessModal} // Pass setShowSuccessModal
            setSuccessMessage={setSuccessMessage}
          />
        )}
      </Container>

      {/* SuccessModal to display success message */}
      <SuccessModal
        visible={showSuccessModal}
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />
    </>
  );
};

export default LeaveScreen;
