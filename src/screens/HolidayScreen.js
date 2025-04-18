import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Text } from 'react-native';
import styled from 'styled-components/native';
import { getEmpHoliday, postEmpLeave } from '../services/productServices';
import { useNavigation, useRouter } from 'expo-router';
import HeaderComponent from '../components/HeaderComponent';
import HolidayCard from '../components/HolidayCard';
import { getProfileInfo } from '../services/authServices';
import EmptyMessage from '../components/EmptyMessage';
import Loader from '../components/old_components/Loader'; // Import the Loader component
import SuccessModal from '../components/SuccessModal';
import ErrorModal from '../components/ErrorModal';

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

const Container = styled.View`
  flex: 1;
  padding: 16px;
  background-color: #fff;
`;

const HolidayList = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
  showsHorizontalScrollIndicator: false,
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
  background-color: ${({ active }) => (active ? '#007AFF' : '#E0E0E0')};
  margin: 0 5px;
`;

const TabText = styled.Text`
  color: ${({ active }) => (active ? '#FFF' : '#000')};
  font-weight: bold;
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
  const [holidaydata, setHolidaydata] = useState({});
  const [activeTab, setActiveTab] = useState('Company Holiday');
  const [profile, setProfile] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [successMessage, setSuccessMessage] = useState(''); // Success message state
  const [errorModalVisible, setErrorModalVisible] = useState(false); // Error modal visibility state
  const [errorMessage, setErrorMessage] = useState('');
  const navigation = useNavigation();
  const currentYear = new Date().getFullYear();

  const router = useRouter();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const data = { year: currentYear };
    getProfileInfo().then(res => setProfile(res.data));
    fetchAttendanceDetails(data);
  }, [currentYear]);

  const fetchAttendanceDetails = data => {
    setIsLoading(true);
    getEmpHoliday(data).then(res => {
      processHolidayData(res.data);
      setHolidaydata(res.data);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  };

  const handleBackPress = () => {
    router.navigate({
      pathname: 'home',
      params: { screen: 'HomePage' }
    });
  };

  const processHolidayData = data => {
    const holidayMap = {};
    for (let i = 0; i < 12; i++) holidayMap[i] = [];

    if (data.h_list && Array.isArray(data.h_list)) {
      data.h_list.forEach(holiday => {
        const { day, h_type, remarks, is_opted } = holiday;
        const [dayNum, monthName, year] = day.split('-');
        const month = monthNameMap[monthName];
        if (month !== undefined && parseInt(year, 10) === currentYear) {
          const dateObj = new Date(year, month, dayNum);
          const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

          holidayMap[month].push({
            name: remarks,
            date: day,
            weekday: weekday,
            type: h_type === 'O' ? 'Optional' : 'Mandatory',
            is_opted: is_opted || false,
          });
        }
      });
    }

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
      emp_id: `${profile?.emp_data?.id}`,
      from_date: formattedDate,
      to_date: formattedDate,
      remarks: 'Optional Holiday',
      leave_type: 'OH',
      call_mode: actionType === 'opt' ? 'ADD' : 'CANCEL',
    };
  
    if (actionType === 'cancel') leavePayload.leave_id = '999999999';
  
    setIsLoading(true); // Set loader when action is initiated
  
    postEmpLeave(leavePayload)
      .then(() => {
        setSuccessMessage(`Holiday ${actionType === 'opt' ? 'applied successfully' : 'canceled successfully'}`);
        setModalVisible(true); // Show success modal
      })
      .catch(() => {
        Alert.alert(
          `Holiday ${actionType === 'opt' ? 'Application Failed' : 'Cancellation Failed'}`,
          `Failed to ${actionType === 'opt' ? 'apply' : 'cancel'} the optional holiday.`
        );
      })
      .finally(() => {
        setIsLoading(false); // Reset loader after action completes
      });
  };
  
  

  const filteredHolidays = Object.entries(holidays).filter(([monthIndex, monthHolidays]) =>
    monthHolidays.some(holiday => activeTab === 'Company Holiday' ? holiday.type === 'Mandatory' : holiday.type === 'Optional')
  );

  return (
    <>
      <HeaderComponent headerTitle="Holiday List" onBackPress={handleBackPress} />
      <Container>
        <CardRow>
          <LeaveCard bgColor="#e6ecff" borderColor="#4d88ff">
            <LeaveNumber color="#4d88ff">Max Optional Holiday : {holidaydata?.no_optional_holidays}</LeaveNumber>
          </LeaveCard>
        </CardRow>

        {holidaydata?.no_optional_holidays ? (
          <TabContainer>
            <Tab active={activeTab === 'Company Holiday'} onPress={() => setActiveTab('Company Holiday')}>
              <TabText active={activeTab === 'Company Holiday'}>{'Company Holiday'}</TabText>
            </Tab>
            <Tab active={activeTab === 'Optional Holiday'} onPress={() => setActiveTab('Optional Holiday')}>
              <TabText active={activeTab === 'Optional Holiday'}>{'Optional Holiday'}</TabText>
            </Tab>
          </TabContainer>
        ) : null}


        {/* <TabContainer>
          <Tab active={activeTab === 'Company Holiday'} onPress={() => setActiveTab('Company Holiday')}>
            <TabText active={activeTab === 'Company Holiday'}>Company Holiday</TabText>
          </Tab>
          {holidaydata?.no_optional_holidays && (
            <>
          <Tab active={activeTab === 'Optional Holiday'} onPress={() => setActiveTab('Optional Holiday')}>
            <TabText active={activeTab === 'Optional Holiday'}>Optional Holiday</TabText>
          </Tab>
            </>
          )}

        </TabContainer> */}

        {isLoading ? (
          <Loader visible={isLoading} />
        ) : (
          <HolidayList>
            {filteredHolidays.length > 0 ? (
              filteredHolidays.map(([monthIndex, monthHolidays]) => (
                <View key={monthIndex}>
                  <HolidayInfo>
                    <HolidayName>{Object.keys(monthFullNameMap)[monthIndex]}</HolidayName>
                  </HolidayInfo>
                  {monthHolidays
                    .filter(holiday => activeTab === 'Company Holiday' ? holiday.type === 'Mandatory' : holiday.type === 'Optional')
                    .map((holiday, index) => (
                      <HolidayCard
                        key={index}
                        holiday={holiday}
                        onOptClick={() => handleHolidayAction(holiday.date, 'opt')}
                        onCancelClick={() => handleHolidayAction(holiday.date, 'cancel')}
                      />
                    ))}
                </View>
              ))
            ) : (
              <EmptyMessage data={`holiday`}/>
            )}
          </HolidayList>
        )}
      </Container>

      <SuccessModal 
        visible={modalVisible} 
        message={successMessage} 
        
        onClose={() => {
          setModalVisible(false);
          router.push({ pathname: 'HolidayList' }); // Navigate back after modal closes
        }} 
      />
      {/* Error Modal */}
      <ErrorModal 
        visible={errorModalVisible} 
        message={errorMessage} 
        onClose={() => setErrorModalVisible(false)} 
      />
    </>
  );
};

export default HolidayScreen;