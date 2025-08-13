import React, { useEffect, useLayoutEffect, useState, useCallback } from 'react';
import { FlatList, Text, View, TouchableOpacity, Dimensions, BackHandler } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Link, useFocusEffect, useRouter } from "expo-router";
import ModalComponent from '../components/ModalComponent';
import { getEmpLeave } from '../services/productServices';
import HeaderComponent from '../components/HeaderComponent';
import LeaveActionModal from '../components/LeaveActionModal';
import LeaveCard from '../components/ApproveLeaveCard';
import EmptyMessage from '../components/EmptyMessage';
import { colors } from '../Styles/appStyle';
import SuccessModal from '../components/SuccessModal';
import Loader from '../components/old_components/Loader';
import { SafeAreaView } from 'react-native-safe-area-context';

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');

const Container = styled.View`
  padding: ${width * 0.04}px;
  height: 100%;
  background-color: #fff;
`;

const SearchContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: #e9ecef;
  padding: ${height * 0.010}px;
  padding-left: ${width * 0.05}px;
  border-radius: ${width * 0.07}px;
  margin-bottom: ${height * 0.02}px;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  font-size: ${width * 0.04}px;
  color: #495057;
  padding-left: ${width * 0.02}px;
`;

const TabContainer = styled.View`
  flex-direction: row;
  margin-bottom: ${height * 0.02}px;
  border-radius: ${width * 0.02}px;
  overflow: hidden;
  background-color: #f1f1f1;
`;

const TabButton = styled.TouchableOpacity`
  flex: 1;
  padding: ${height * 0.015}px;
  align-items: center;
  background-color: ${props => props.active ? colors.primary : 'transparent'};
`;

const TabText = styled.Text`
  font-size: ${width * 0.035}px;
  font-weight: 500;
  color: ${props => props.active ? '#fff' : '#495057'};
`;

const FilterHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${height * 0.02}px;
  padding: ${width * 0.02}px;
  background-color: #e9ecef;
  border-radius: ${width * 0.02}px;
`;

const FilterText = styled.Text`
  font-size: ${width * 0.035}px;
  color: #495057;
  flex: 1;
  margin-right: ${width * 0.02}px;
`;

const ClearFilterButton = styled.TouchableOpacity`
  padding: ${width * 0.01}px ${width * 0.03}px;
  background-color: #dc3545;
  border-radius: ${width * 0.01}px;
`;

const ClearFilterText = styled.Text`
  color: white;
  font-size: ${width * 0.03}px;
`;

const LeaveScreen = (props) => {
  const navigation = useNavigation();
  const router = useRouter();
  const [empId, setEmpId] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [leaveData, setLeavedata] = useState([]);
  const [approvedHistoryData, setApprovedHistoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRejectModalVisible, setRejectModalVisible] = useState(false);
  const [isApproveModalVisible, setApproveModalVisible] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [filteredEmployee, setFilteredEmployee] = useState(null);

  // Fetch data when empId or tab changes
  useEffect(() => {
    if (empId) {
      fetchLeaveData();
    }
  }, [empId, activeTab]);

   useFocusEffect(
      useCallback(() => {
        const onBackPress = () => {
          router.replace('home');
          return true;
        };
  
        BackHandler.addEventListener('hardwareBackPress', onBackPress);
  
        return () => {
          BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        };
      }, [])
    );
  

  useEffect(() => {
    if (props?.data?.empNId) {
      setEmpId(props.data.empNId);
    }
  }, [props.data?.empNId]);

  const fetchLeaveData = useCallback(() => {
    setIsLoading(true);
    
    const fetchData = activeTab === 'pending' 
      ? getEmpLeave("A", empId)
      : getEmpLeave("AH", empId);

    fetchData
      .then((res) => {
        if (activeTab === 'pending') {
          setLeavedata(res.data);
        } else {
          setApprovedHistoryData(res.data);
        }
        applyFilters(res.data, filteredEmployee?.emp_id, searchQuery);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [empId, activeTab, filteredEmployee, searchQuery]);

  const applyFilters = useCallback((data, employeeId = '', searchText = '') => {
    let filtered = [...data];
    
    if (employeeId) {
      filtered = filtered.filter(item => 
        item.emp_data.emp_id === employeeId
      );
    }
    
    if (searchText) {
      filtered = filtered.filter(item =>
        item.emp_data.emp_id.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    setFilteredData(filtered);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLeaveData();
    setRefreshing(false);
  }, [fetchLeaveData]);

  const handleProfilePress = useCallback((employee) => {
    setFilteredEmployee(employee);
    setSearchQuery('');
    setActiveTab('history'); // Switch to Approved History tab automatically
  }, []);

  const clearEmployeeFilter = useCallback(() => {
    setFilteredEmployee(null);
    setSearchQuery('');
    const dataToFilter = activeTab === 'pending' ? leaveData : approvedHistoryData;
    applyFilters(dataToFilter, '', '');
  }, [activeTab, leaveData, approvedHistoryData, applyFilters]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleBackPress = useCallback(() => {
    router.navigate({
      pathname: 'home',
      params: { screen: 'HomePage' }
    });
  }, [router]);

  const handleCardPress = useCallback((leave) => {
    setSelectedLeave(leave);
    setModalVisible(true);
  }, []);

  const handleSearch = useCallback((text) => {
    setSearchQuery(text);
    setFilteredEmployee(null);
    const dataToSearch = activeTab === 'pending' ? leaveData : approvedHistoryData;
    applyFilters(dataToSearch, '', text);
  }, [activeTab, leaveData, approvedHistoryData, applyFilters]);

  const renderLeaveItem = useCallback(({ item }) => (
    <LeaveCard
      leave={item}
      onPress={() => handleCardPress(item)}
      onProfilePress={() => handleProfilePress(item.emp_data)}
      onApprove={activeTab === 'pending' ? () => {
        setSelectedLeave(item);
        setApproveModalVisible(true);
      } : null}
      onReject={activeTab === 'pending' ? () => {
        setSelectedLeave(item);
        setRejectModalVisible(true);
      } : null}
      isHistory={activeTab === 'history'}
    />
  ), [activeTab, handleCardPress, handleProfilePress]);

  return (
    <>
    <SafeAreaView>
      <HeaderComponent headerTitle="Leave Approvals" onBackPress={handleBackPress}/>
      <Container>
        <TabContainer>
          <TabButton 
            active={activeTab === 'pending'}
            onPress={() => setActiveTab('pending')}
          >
            <TabText active={activeTab === 'pending'}>Pending Approval</TabText>
          </TabButton>
          <TabButton 
            active={activeTab === 'history'}
            onPress={() => setActiveTab('history')}
          >
            <TabText active={activeTab === 'history'}>Approved History</TabText>
          </TabButton>
        </TabContainer>

        {filteredEmployee && (
          <FilterHeader>
            <FilterText numberOfLines={1}>
              Showing for: {filteredEmployee.name} (ID: {filteredEmployee.emp_id})
            </FilterText>
            <ClearFilterButton onPress={clearEmployeeFilter}>
              <ClearFilterText>Clear</ClearFilterText>
            </ClearFilterButton>
          </FilterHeader>
        )}

        <SearchContainer>
          <MaterialIcons name="search" size={width * 0.06} color="#888" />
          <SearchInput
            placeholder="Search Employee ID"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <MaterialIcons name="clear" size={width * 0.06} color="black" style={{marginRight: 10}} />
            </TouchableOpacity>
          )}
        </SearchContainer>
        
        <Loader visible={isLoading || refreshing} />

        <FlatList
          data={[...filteredData].reverse()}
          renderItem={renderLeaveItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={<EmptyMessage data={`leave`}/>}
          contentContainerStyle={{ 
            paddingBottom: height * 0.15,
            minHeight: height * 0.6 // Ensure enough space for empty state
          }}
        />
        
        {selectedLeave && activeTab === 'pending' && (
          <>
            <LeaveActionModal 
              isVisible={isApproveModalVisible} 
              leave={selectedLeave} 
              onClose={() => { 
                setApproveModalVisible(false);
                handleRefresh();
              }} 
              actionType="APPROVE"
              setShowSuccessModal={setShowSuccessModal}
              setSuccessMessage={setSuccessMessage}
            />
            <LeaveActionModal 
              isVisible={isRejectModalVisible} 
              leave={selectedLeave} 
              onClose={() => { 
                setRejectModalVisible(false);
                handleRefresh();
              }} 
              actionType="REJECT"
              setShowSuccessModal={setShowSuccessModal}
              setSuccessMessage={setSuccessMessage}
            />
          </>
        )}
      </Container>
      </SafeAreaView>

      <SuccessModal
        visible={showSuccessModal}
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />
    </>
  );
};

export default LeaveScreen;