import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from 'expo-router';
import { getEmpAttendance, getEmpHoliday } from '../services/productServices';
import HeaderComponent from '../components/HeaderComponent';
import ErrorModal from '../components/ErrorModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import Loader from '../components/old_components/Loader';

// Styled Components
const MainContainer = styled(SafeAreaView)`
  flex: 1;
  background-color: #f8f9fa;
`;

const Container = styled.View`
  flex: 1;
  padding: 16px;
`;

const CalendarHeader = styled.View`
  background-color: #a970ff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  elevation: 3;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
`;

const MonthNavigation = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const MonthText = styled.Text`
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const NavButton = styled.TouchableOpacity`
  width: 36px;
  height: 36px;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 18px;
`;

const WeekDaysContainer = styled.View`
  flex-direction: row;
  justify-content: space-around;
  margin-bottom: 8px;
  background-color: #f8f9fa;
  padding: 8px 0;
  border-radius: 8px;
`;

const WeekDayText = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: #6c757d;
  width: 14.2%;
  text-align: center;
`;

const CalendarGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  background-color: #fff;
  border-radius: 12px;
  padding: 8px;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.05;
  shadow-radius: 2px;
`;

const DayContainer = styled.View`
  width: 14.2%;
  align-items: center;
  padding: 8px 0;
`;

const DayText = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  margin-bottom: 4px;
`;

const StatusIndicator = styled.View`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: ${(props) =>
    props.status === 'N' ? '#ff6b6b' :
    props.status === 'L' ? '#ffa502' :
    props.status === 'C' ? '#339af0' :
    props.status === 'H' ? '#748ffc' : '#51cf66'};
  justify-content: center;
  align-items: center;
`;

const StatusText = styled.Text`
  font-size: 12px;
  font-weight: 600;
  color: #fff;
`;

const StatusGuideContainer = styled.View`
  margin-top: 20px;
  padding: 16px;
  background-color: #fff;
  border-radius: 12px;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.05;
  shadow-radius: 2px;
`;

const StatusGuideTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 12px;
`;

const StatusGuideItem = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 6px;
`;

const StatusBullet = styled.View`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${(props) => {
    switch (props.status) {
      case 'L': return '#ffa502';
      case 'N': return '#ff6b6b';
      case 'C': return '#339af0';
      case 'P': return '#51cf66';
      case 'H': return '#748ffc';
      default: return '#adb5bd';
    }
  }};
  margin-right: 8px;
`;

const StatusLabel = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: #495057;
`;

// Constants
const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAME_MAP = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
};

const AttendanceStatus = ({ id: empId }) => {
  const [date, setDate] = useState(new Date());
  const [attendance, setAttendance] = useState({});
  const [holiday, setHoliday] = useState({});
  const navigation = useNavigation();
  const [isErrorVisiable, setIsErrorVisiable] = useState(false);
  const [lastValidDate, setLastValidDate] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const fetchData = async () => {
      const data = {
        eId: empId,
        month: currentMonth + 1,
        year: currentYear,
      };

      try {
        setLoading(true);
        const [attendanceRes, holidayRes] = await Promise.all([
          getEmpAttendance(data),
          getEmpHoliday(data)
        ]);
        
        console.log("Attendance Data:", attendanceRes.data);
        console.log("Holiday Data:", holidayRes.data);
        
        processAttendanceData(attendanceRes.data);
        processHolidayData(holidayRes.data);

        setLastValidDate(new Date(currentYear, currentMonth, 1));
      } catch (error) {
        setIsErrorVisible(true);
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentMonth, currentYear, empId]);

  const processAttendanceData = (data) => {
    const attendanceMap = {};
    data.forEach((item) => {
      const day = parseInt(item.a_date.split('-')[0], 10);
      attendanceMap[day] = item.attendance_type;
    });
    setAttendance(attendanceMap);
  };

  const processHolidayData = (data) => {
    const holidayMap = {};

    // Process holiday_list
    if (data.holiday_list?.length) {
      data.holiday_list.forEach((holidayDate) => {
        if (!holidayDate) return;
        
        const [day, monthName, year] = holidayDate.split('-');
        const month = MONTH_NAME_MAP[monthName];
        
        if (month === currentMonth && parseInt(year, 10) === currentYear) {
          holidayMap[parseInt(day, 10)] = 'C';
        }
      });
    }

    // Process holiday_saturday_list
    if (data.holiday_saturday_list) {
      data.holiday_saturday_list.split('|').forEach((saturdayDate) => {
        if (!saturdayDate) return;
        
        const [day, monthName] = saturdayDate.split('-');
        const month = MONTH_NAME_MAP[monthName];
        
        if (month === currentMonth) {
          holidayMap[parseInt(day, 10)] = 'H';
        }
      });
    }

    // Mark Sundays as holidays
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      if (date.getDay() === 0) {
        holidayMap[day] = 'H';
      }
    }

    setHoliday(holidayMap);
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const changeMonth = (direction) => {
    setDate(prevDate => {
      const newMonth = prevDate.getMonth() + direction;
      return new Date(prevDate.setFullYear(prevDate.getFullYear(), newMonth));
    });
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty placeholders for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<DayContainer key={`empty-${i}`} />);
    }

    // Days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const holidayStatus = holiday[day];
      let displayStatus = 'N';
      
      if (holidayStatus === 'C') {
        displayStatus = 'C';
      } else if (holidayStatus === 'H') {
        displayStatus = 'H';
      } else {
        const attendanceStatus = attendance[day];
        displayStatus = attendanceStatus === 'A' ? 'P' : attendanceStatus || 'N';
      }

      days.push(
        <DayContainer key={day}>
          <DayText>{day}</DayText>
          <StatusIndicator status={holidayStatus || attendance[day] || 'N'}>
            <StatusText>{displayStatus}</StatusText>
          </StatusIndicator>
        </DayContainer>
      );
    }

    return days;
  };

  return (
    <MainContainer>
      <HeaderComponent 
        headerTitle="Attendance Status" 
        onBackPress={() => navigation.goBack()} 
      />
      
      <Container>
        <CalendarHeader>
          <MonthNavigation>
            <NavButton onPress={() => changeMonth(-1)}>
              <Icon name="chevron-left" size={24} color="#fff" />
            </NavButton>
            <MonthText>
              {`${date.toLocaleString('default', { month: 'long' })} ${currentYear}`}
            </MonthText>
            <NavButton onPress={() => changeMonth(1)}>
              <Icon name="chevron-right" size={24} color="#fff" />
            </NavButton>
          </MonthNavigation>

          <WeekDaysContainer>
            {WEEK_DAYS.map((day, index) => (
              <WeekDayText key={index}>{day}</WeekDayText>
            ))}
          </WeekDaysContainer>
        </CalendarHeader>

        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <CalendarGrid>
            {renderCalendarDays()}
          </CalendarGrid>
          
          <StatusGuideContainer>
            <StatusGuideTitle>Status Guide</StatusGuideTitle>
            <StatusGuideItem>
              <StatusBullet status="P" />
              <StatusLabel>Present</StatusLabel>
            </StatusGuideItem>
            <StatusGuideItem>
              <StatusBullet status="L" />
              <StatusLabel>On Leave</StatusLabel>
            </StatusGuideItem>
            <StatusGuideItem>
              <StatusBullet status="C" />
              <StatusLabel>Company Holiday</StatusLabel>
            </StatusGuideItem>
            <StatusGuideItem>
              <StatusBullet status="H" />
              <StatusLabel>Weekly Holiday</StatusLabel>
            </StatusGuideItem>
            <StatusGuideItem>
              <StatusBullet status="N" />
              <StatusLabel>Not Submitted</StatusLabel>
            </StatusGuideItem>
          </StatusGuideContainer>
        </ScrollView>

        <ErrorModal
          visible={isErrorVisiable}
          message="Your Holiday Calendar is not setup for this period"
          onClose={() => {
            setIsErrorVisiable(false);
            if (lastValidDate) {
              setDate(lastValidDate);
            }
          }}
        />
         <Loader visible={loading} onTimeout={() => {
          setIsErrorVisiable(true);
          setLoading(false);
        }} />
      </Container>
    </MainContainer>
  );
};

export default AttendanceStatus;