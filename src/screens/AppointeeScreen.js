import React, { useEffect, useState } from 'react';
import { FlatList, View, Dimensions, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { useRouter } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import ModalComponent from '../components/ModalComponent';
import { getAppointee, getEmpLeave } from '../services/productServices';
import HeaderComponent from '../components/HeaderComponent';
import LeaveActionModal from '../components/LeaveActionModal';
import { getProfileInfo } from '../services/authServices';
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

const ApplicationList = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
  showsHorizontalScrollIndicator: false,
})`
  margin-top: 20px;
`;

const ApplyLeaveButton = styled.TouchableOpacity`
  background-color: #4d88ff;
  padding: 12px 16px;
  border-radius: 25px;
  align-self: center;
  margin-bottom: ${responsiveMarginBottom}px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const ButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  margin-left: 8px;
`;

const LeaveText = styled.Text`
  font-size: 16px;
  color: #333;
  font-weight: 500;
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
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 0px;
`;

const AppointeeScreen = () => {
  const router = useRouter();
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isCancelModalVisible, setCancelModalVisible] = useState(false);
  const [appointees, setAppointees] = useState([]);
  const [randomValue, setRandomValue] = useState(0);
  const [selectedTab, setSelectedTab] = useState('My Leave');
  const [profile, setProfile] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false); // Loader state

  const generateRandomValue = () => {
    return Math.floor(Math.random() * 100);
  };

  useEffect(() => {
    setRandomValue(generateRandomValue());
    getProfileInfo().then((res) => {
      setProfile(res.data);
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
    // appointeeList();
  }, []);

  const appointeeList = () => {
    setLoading(true); // Set loading to true at the start of data fetching
    getAppointee()
      .then((res) => {
        setAppointees(res.data);
      })
      .finally(() => setLoading(false)); // Set loading to false after data is fetched
  };

//   console.log('Response===',appointees)

  const handleBackPress = () => {
    router.push('home');
  };

  const handleRefresh = () => {
    setRandomValue(randomValue + 1);
  };

  const handleScanPress = (leave) => {
    router.push({
      pathname: '/LeaveApply',
      params: leave,
    });
  };

  const handleAddPress = (leave) => {
    router.push({
      pathname: '/LeaveApply',
      params: leave,
    });
  };

  


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
      <HeaderComponent headerTitle="Appointee List" onBackPress={handleBackPress} />
      <Container>
        
        {loading ? (
          <Loader visible={loading} />
        ) : (
          <ApplicationList>
            {/* <FlatList
              data={[...leaveData].reverse()}
              renderItem={renderLeaveItem}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={<EmptyMessage data={`leave`} />}
            /> */}
          </ApplicationList>
        )}
        <ApplyButton onPress={() => handleScanPress()} buttonText="Scan Resume" icon='document-scanner'/>
        <ApplyButton onPress={() => handleAddPress()} buttonText="Add Appointee" icon='add-circle' />

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

export default AppointeeScreen;
