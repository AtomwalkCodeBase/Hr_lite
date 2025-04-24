import React, { useEffect, useState } from 'react';
import { FlatList, View, Dimensions, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { useRouter } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import ModalComponent from '../components/ModalComponent';
import { getEmpLeave } from '../services/productServices';
import HeaderComponent from '../components/HeaderComponent';
import LeaveActionModal from '../components/LeaveActionModal';
import { getEmployeeInfo, getProfileInfo } from '../services/authServices';
import LeaveCardComponent from '../components/LeaveCardComponent';
import ApplyButton from '../components/ApplyButton';
import EmptyMessage from '../components/EmptyMessage';
import SuccessModal from '../components/SuccessModal';
import Loader from '../components/old_components/Loader';

const screenHeight = Dimensions.get('window').height;
const responsiveMarginBottom = screenHeight * 0.125;

const Container = styled.View`
  padding: 16px;
  padding-bottom: 100px;
  height: 100%;
  width: 100%;
  background-color: #fff;
`;

const TabContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-vertical: 10px;
`;

const TabButton = styled.TouchableOpacity`
  flex: 2;
  align-items: center;
`;

const TabButtonActive = styled(TabButton)`
  border-bottom-width: 2px;
  border-color: blue;
  color: black;
`;

const LeaveCard = styled.View`
  width: 95%;
  background-color: ${props => props.bgColor || '#fff'};
  border-radius: 16px;
  border-width: 1px;
  border-color: ${props => props.borderColor || '#ddd'};
  margin-bottom: 12px;
  align-items: center;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

const LeaveNumber = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: ${props => props.color || '#000'};
  margin-top: 5px;
  margin-bottom: 5px;
`;


const CardRow = styled.View`
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
`;

const TabText = styled.Text`
  font-size: 16px;
  color: gray;
  margin-bottom: 10px;
`;

const TabTextActive = styled(TabText)`
  color: blue;
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 0px;
`;

const LeaveScreen = () => {
  const router = useRouter();
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isCancelModalVisible, setCancelModalVisible] = useState(false);
  const [leaveData, setLeaveData] = useState([]);
  const [randomValue, setRandomValue] = useState(0);
  const [selectedTab, setSelectedTab] = useState('My Leave');
  const [profile, setProfile] = useState({});
  const [empId, setEmpId] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false); // Loader state
  const [totalLeaveSum, setTotalLeaveSum] = useState(0);

  const generateRandomValue = () => {
    return Math.floor(Math.random() * 100);
  };

  useEffect(() => {
    setRandomValue(generateRandomValue());
    getEmployeeInfo().then((res) => {
      setProfile(res?.data[0]);
      setEmpId(res?.data[0]?.id);
    });
  }, []);

  const handleCardPress = (leave) => {
    setSelectedLeave(leave);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const cancelLeave = (leave) => {
    setSelectedLeave(leave);
    setCancelModalVisible(true);
  };

  useEffect(() => {
    leaveDetails();
  }, [empId, selectedTab, randomValue]);

  console.log("Leave screen profile===",leaveData)

  const leaveDetails = () => {
    setLoading(true);
    getEmpLeave(selectedTab === 'My Leave' ? 'EL' : selectedTab === 'My WFH' ? 'WH' : 'EL', empId)
      .then((res) => {
        // First filter out Optional Holidays (OH)
        const allNonOHLeaves = res.data.filter((leave) => leave.leave_type !== 'OH');
        
        // Calculate total leave sum (excluding cancelled leaves)
        const totalSum = allNonOHLeaves
          .filter(leave => leave.status_display !== 'Cancelled')
          .reduce((sum, leave) => sum + parseFloat(leave.no_leave_count || 0), 0);
        setTotalLeaveSum(totalSum);
  
        // Then apply tab-specific filters
        const tabFilteredData = selectedTab === 'My Leave'
          ? allNonOHLeaves.filter((leave) => leave.status_display !== 'Cancelled')
          : selectedTab === 'My Cancel Leave'
          ? allNonOHLeaves.filter((leave) => leave.status_display === 'Cancelled')
          : allNonOHLeaves;
          
        setLeaveData(tabFilteredData);
      })
      .finally(() => setLoading(false));
  };

  

  const handleBackPress = () => {
    router.navigate({
      pathname: 'home',
      params: { screen: 'HomePage' }
    });
  };

  const handleRefresh = () => {
    setRandomValue(randomValue + 1);
  };

  const handlePress = (leave) => {
    // console.log("Passing Leave Data===",leave)
    router.push({
      pathname: '/LeaveApply',
      params: leave,
    });
  };

  const count = leaveData.length;
  const leaveSum = leaveData.reduce((sum, leave) => sum + parseFloat(leave.no_leave_count || 0), 0);
  const max_leave = profile?.emp_data?.max_no_leave;

  // console.log('Emp data',profile)

  const getStatusStyles = (status_display) => {
    switch (status_display) {
      case 'Submitted':
        return { bgColor: '#FFC107', color: '#000', borderColor: '#FFC107', icon: 'time-outline' };
      case 'Rejected':
        return { bgColor: '#ff2400', color: '#fff', borderColor: '#ff2400', icon: 'cancel' };
      case 'Cancelled':
        return { bgColor: '#ff2400', color: '#fff', borderColor: '#ff2400', icon: 'cancel' };
      case 'Approved':
        return { bgColor: '#28A747', color: '#fff', borderColor: '#28A747', icon: 'check-circle' };
      default:
        return { bgColor: '#fff', color: '#000', borderColor: '#ddd', icon: 'check-circle' };
    }
  };

  const renderLeaveItem = ({ item: leave }) => {
    const statusStyles = getStatusStyles(leave.status_display);
    return (
      <LeaveCardComponent
        leave={leave}
        statusStyles={statusStyles}
        onPress={handleCardPress}
        onCancelPress={cancelLeave}
        showCancelButton={leave.status_display === 'Submitted'}
      />
    );
  };

  return (
    <>
      <HeaderComponent headerTitle="My Leaves" onBackPress={handleBackPress} />
      <Container>
      <CardRow>
        <LeaveCard bgColor="#eaffea" borderColor="#66cc66">
          <LeaveNumber color="#66cc66">
            {selectedTab === 'My WFH' ? 'Total WFH' : 'Total Leave Days'}: {selectedTab === 'My Cancel Leave' ? totalLeaveSum : leaveSum}
          </LeaveNumber>
        </LeaveCard>
        <LeaveCard bgColor="#e6ecff" borderColor="#4d88ff">
          <LeaveNumber color="#4d88ff">Max Leave for Year: {max_leave}</LeaveNumber>
        </LeaveCard>
      </CardRow>

        <TabContainer>
          <TabButton onPress={() => setSelectedTab('My Leave')}>
            {selectedTab === 'My Leave' ? (
              <TabButtonActive>
                <TabTextActive>My Leave</TabTextActive>
              </TabButtonActive>
            ) : (
              <TabText>My Leave</TabText>
            )}
          </TabButton>
          <TabButton onPress={() => setSelectedTab('My WFH')}>
            {selectedTab === 'My WFH' ? (
              <TabButtonActive>
                <TabTextActive>My WFH</TabTextActive>
              </TabButtonActive>
            ) : (
              <TabText>My WFH</TabText>
            )}
          </TabButton>
          <TabButton onPress={() => setSelectedTab('My Cancel Leave')}>
            {selectedTab === 'My Cancel Leave' ? (
              <TabButtonActive>
                <TabTextActive>Canceled Leave</TabTextActive>
              </TabButtonActive>
            ) : (
              <TabText>Canceled Leave</TabText>
            )}
          </TabButton>
        </TabContainer>

        {loading ? (
          <Loader visible={loading} />
        ) : (
          <FlatList
            data={[...leaveData].reverse()}
            renderItem={renderLeaveItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={<EmptyMessage data={`leave`} />}
            contentContainerStyle={{ paddingBottom: responsiveMarginBottom }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          />
        )}
        <ApplyButton onPress={() => handlePress(leaveData && leaveData[0]?.emp_data)} buttonText="Apply Leave" />

        {selectedLeave && (
          <ModalComponent
            isVisible={isModalVisible}
            leave={selectedLeave}
            onClose={closeModal}
          />
        )}
        {selectedLeave && (
          <LeaveActionModal
            isVisible={isCancelModalVisible}
            leave={selectedLeave}
            onClose={() => {
              setCancelModalVisible(false);
              handleRefresh(); // Trigger refresh after closing the modal
            }}
            actionType="CANCEL"
            setShowSuccessModal={setShowSuccessModal}
            setSuccessMessage={setSuccessMessage}
          />
        )}

        <SuccessModal
          visible={showSuccessModal}
          message={successMessage}
          onClose={() => setShowSuccessModal(false)}
        />
      </Container>
    </>
  );
};

export default LeaveScreen;
