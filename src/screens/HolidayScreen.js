import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ScrollView, View, TouchableOpacity, Alert, Text } from 'react-native';
import styled from 'styled-components/native';
import { getEmpHoliday, postEmpLeave } from '../services/productServices';
import { useNavigation, useRouter } from 'expo-router';
import HeaderComponent from '../components/HeaderComponent';
import HolidayCard from '../components/HolidayCard';
import EmptyMessage from '../components/EmptyMessage';
import Loader from '../components/old_components/Loader';
import SuccessModal from '../components/SuccessModal';
import ErrorModal from '../components/ErrorModal';
import { colors } from '../Styles/appStyle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfirmationModal from '../components/ConfirmationModal';

const monthNameMap = {
  'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4,
  'Jun': 5, 'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9,
  'Nov': 10, 'Dec': 11,
};

const monthFullNameMap = {
  'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4,
  'June': 5, 'July': 6, 'August': 7, 'September': 8, 'October': 9,
  'November': 10, 'December': 11,
};

const MainContainer = styled(SafeAreaView)`
  flex: 1;
  background-color: #fff;
`;

const Container = styled.View`
  flex: 1;
  padding: 16px;
  background-color: #fff;
`;

const HolidayList = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
  contentContainerStyle: {
    paddingBottom: 20,
    flexGrow: 1
  }
})``;

const CardRow = styled.View`
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
`;

const TabContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-bottom: 20px;
`;

const Tab = styled.TouchableOpacity`
  padding: 10px 20px;
  border-radius: 15px;
  background-color: ${({ active }) => (active ? colors.primary : '#E0E0E0')};
  margin: 0 5px;
`;

const TabText = styled.Text`
  color: ${({ active }) => (active ? '#FFF' : '#000')};
  font-weight: bold;
`;

const LeaveCard = styled.View`
  width: 95%;
  background-color: #F5EFFE;
  border-radius: 16px;
  border-width: 1px;
  border: 1px solid ${colors.primary};
  margin-bottom: 12px;
  align-items: center;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

const LeaveNumber = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: ${colors.primary};
  margin-top: 5px;
  margin-bottom: 5px;
`;

const HolidayInfo = styled.View`
  flex: 1;
`;

const HolidayName = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #666;
  margin-bottom: 7px;
`;

const HolidayScreen = () => {
  const [holidays, setHolidays] = useState({});
  const [holidaydata, setHolidaydata] = useState(null); // Initialize as null
  const [activeTab, setActiveTab] = useState('Company Holiday');
  const [isLoading, setIsLoading] = useState(true); // Start with true
  const [modalVisible, setModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [eId, setEId] = useState(null);
  const [retryCount, setRetryCount] = useState(0); // For retry mechanism
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedHolidayDate, setSelectedHolidayDate] = useState(null);

  const currentYear = new Date().getFullYear();
  const navigation = useNavigation();
  const router = useRouter();

  // Fetch employee ID with retry logic
  useEffect(() => {
    const fetchEId = async () => {
      try {
        const id = await AsyncStorage.getItem('empNoId');
        if (!id) {
          throw new Error('Employee ID not found');
        }
        setEId(id);
      } catch (error) {
        console.error("Error fetching employee ID:", error);
        if (retryCount < 3) {
          setTimeout(() => setRetryCount(prev => prev + 1), 2000);
        }
      }
    };
    fetchEId();
  }, [retryCount]);

  // Fetch data when eId is available
  useEffect(() => {
    if (!eId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [holidayRes] = await Promise.all([
          getEmpHoliday({ year: currentYear, eId: String(eId) })
        ]);

        if (!holidayRes.data) {
          throw new Error('No holiday data received');
        }

        setHolidaydata(holidayRes.data);
        processHolidayData(holidayRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage("Failed to load holiday data. Please try again.");
        setErrorModalVisible(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [eId, currentYear]);

  const handleBackPress = () => {
    router.navigate({
      pathname: 'home',
      params: { screen: 'HomePage' }
    });
  };

  const handleConfirmAction = () => {
    setConfirmationModalVisible(false);
    if (selectedAction && selectedHolidayDate) {
      handleHolidayAction(selectedHolidayDate, selectedAction);
    }
  };

  const showConfirmationModal = (date, actionType) => {
    setSelectedAction(actionType);
    setSelectedHolidayDate(date);
    setConfirmationModalVisible(true);
  };
  

  // Improved holiday data processing
  const processHolidayData = (data) => {
    if (!data?.h_list) {
      console.warn("No holiday list in data");
      return;
    }

    const holidayMap = Array(12).fill().reduce((acc, _, i) => {
      acc[i] = [];
      return acc;
    }, {});

    data.h_list.forEach(holiday => {
      try {
        const [dayNum, monthName, year] = holiday.day.split('-');
        const month = monthNameMap[monthName];
        
        if (month !== undefined && parseInt(year, 10) === currentYear) {
          const dateObj = new Date(year, month, dayNum);
          const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

          holidayMap[month].push({
            name: holiday.remarks,
            date: holiday.day,
            weekday,
            type: holiday.h_type === 'O' ? 'Optional' : 'Mandatory',
            is_opted: holiday.is_opted || false,
          });
        }
      } catch (error) {
        console.error("Error processing holiday:", holiday, error);
      }
    });

    setHolidays(holidayMap);
  };

  const handleHolidayAction = (date, actionType) => {
    const [day, monthName, year] = date.split('-');
    const month = monthNameMap[monthName];
    const holidayDate = new Date(year, month, day);
    const currentDate = new Date();
  
    // Check if the maximum optional holidays have already been opted
    const optedHolidaysCount = Object.values(holidays).flat().filter(holiday => holiday.is_opted).length;
    const maxOptionalHolidays = holidaydata?.no_optional_holidays;
  
    if (actionType === 'opt' && optedHolidaysCount >= maxOptionalHolidays) {
      setErrorMessage("Already maximum optional holiday applied");
      setErrorModalVisible(true); // Show error modal if max optional holidays reached
      return;
    }
  
    if (actionType === 'cancel' && holidayDate.setHours(0, 0, 0, 0) < currentDate.setHours(0, 0, 0, 0)) {
      setErrorMessage("You cannot cancel a holiday that has already passed.");
      setErrorModalVisible(true); // Show ErrorModal if attempting to cancel a past holiday
      return;
    }
    
  
    const formattedDate = `${day.padStart(2, '0')}-${(month + 1).toString().padStart(2, '0')}-${year}`;
  
    const leavePayload = {
      emp_id: `${eId}`,
      from_date: formattedDate,
      to_date: formattedDate,
      remarks: 'Optional Holiday',
      leave_type: 'OH',
      call_mode: actionType === 'opt' ? 'ADD' : 'CANCEL',
      hrm_lite: ''
    };
  
    if (actionType === 'cancel') leavePayload.leave_id = '999999999';
  
    setIsLoading(true); // Set loader when action is initiated
  
    postEmpLeave(leavePayload)
      .then(() => {
        setSuccessMessage(`Holiday ${actionType === 'opt' ? 'applied successfully' : 'canceled successfully'}`);
        setModalVisible(true); // Show success modal
      })
      .catch((error) => {
        let errorMessage = 'Something went wrong. Please try again.';
        
        // If using Axios
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } 
        // If using Fetch or generic error with a message
        else if (error.message) {
          errorMessage = error.message;
        }
      
        Alert.alert(
          `Holiday ${actionType === 'opt' ? 'Application Failed' : 'Cancellation Failed'}`,
          errorMessage
        );
      
      })
      
      .finally(() => {
        setIsLoading(false); // Reset loader after action completes
      });
  };
  
  

  // Render improvements
  const renderHolidayList = () => {
    if (isLoading) return <Loader visible={isLoading} />;
    
    if (!holidaydata) {
      return <EmptyMessage data="holiday" />;
    }

    const filteredMonths = Object.entries(holidays).filter(([_, monthHolidays]) => 
      monthHolidays.some(holiday => 
        activeTab === 'Company Holiday' 
          ? holiday.type === 'Mandatory' 
          : holiday.type === 'Optional'
      )
    );

    if (filteredMonths.length === 0) {
      return <EmptyMessage data="holiday" />;
    }

    return (
      <HolidayList>
        {filteredMonths.map(([monthIndex, monthHolidays]) => (
          <View key={monthIndex}>
            <HolidayInfo>
              <HolidayName>
                {Object.keys(monthFullNameMap)[monthIndex]}
              </HolidayName>
            </HolidayInfo>
            {monthHolidays
              .filter(holiday => 
                activeTab === 'Company Holiday' 
                  ? holiday.type === 'Mandatory' 
                  : holiday.type === 'Optional'
              )
              .map((holiday, index) => (
                <HolidayCard
                  key={`${monthIndex}-${index}`}
                  holiday={holiday}
                  onOptClick={() => showConfirmationModal(holiday.date, 'opt')}
                  onCancelClick={() => showConfirmationModal(holiday.date, 'cancel')}
                />
              ))}
          </View>
        ))}
      </HolidayList>
    );
  };

  return (
    <MainContainer edges={['top']}>
      <HeaderComponent headerTitle="Holiday List" onBackPress={handleBackPress} />
      <Container>
        {holidaydata && (
          <CardRow>
            <LeaveCard bgColor="#e6ecff" borderColor="#4d88ff">
              <LeaveNumber>
                Max Optional Holiday: {holidaydata.no_optional_holidays || 0}
              </LeaveNumber>
            </LeaveCard>
          </CardRow>
        )}

        {holidaydata?.no_optional_holidays ? (
          <TabContainer>
            <Tab active={activeTab === 'Company Holiday'} 
                 onPress={() => setActiveTab('Company Holiday')}>
              <TabText active={activeTab === 'Company Holiday'}>
                Company Holiday
              </TabText>
            </Tab>
            <Tab active={activeTab === 'Optional Holiday'} 
                 onPress={() => setActiveTab('Optional Holiday')}>
              <TabText active={activeTab === 'Optional Holiday'}>
                Optional Holiday
              </TabText>
            </Tab>
          </TabContainer>
        ) : null}

        {renderHolidayList()}
      </Container>

      {/* Modals */}
      <ConfirmationModal
        visible={confirmationModalVisible}
        message={`Are you sure you want to ${selectedAction === 'opt' ? 'apply for' : 'cancel'} this optional holiday?`}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmationModalVisible(false)}
      />
      <SuccessModal 
        visible={modalVisible} 
        message={successMessage} 
        onClose={() => {
          setModalVisible(false);
          router.push({ pathname: 'HolidayList' });
        }} 
      />
      <ErrorModal 
        visible={errorModalVisible} 
        message={errorMessage} 
        onClose={() => setErrorModalVisible(false)} 
      />
    </MainContainer>
  );
};

export default HolidayScreen;