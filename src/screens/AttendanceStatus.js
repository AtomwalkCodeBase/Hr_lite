import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from 'expo-router';
import { getEmpAttendance, getEmpHoliday } from '../services/productServices';
import HeaderComponent from '../components/HeaderComponent';
import ErrorModal from '../components/ErrorModal';
import { SafeAreaView } from 'react-native-safe-area-context';

// Styled Components
const Container = styled.View`
  flex: 1;
  padding: 20px;
  background-color: #fff;
`;
const MainContainer = styled(SafeAreaView)`
  flex: 1;
  background-color: #fff;
`;

const CalendarContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: #3f87f9;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
`;

const MonthText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: bold;
`;

const NavButtonContainer = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  border-radius: 20px;
`;

const WeekDays = styled.View`
  flex-direction: row;
  justify-content: space-around;
  margin-bottom: 5px;
`;

const WeekDayText = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: #777;
`;

const Calendar = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

const DayContainer = styled.View`
  width: 14.2%;
  align-items: center;
  margin-bottom: 15px;
`;

const DayText = styled.Text`
  font-size: 14px;
  margin-bottom: 5px;
  font-weight: bold;
`;

const StatusText = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: ${(props) =>
    props.status === 'N' ? 'red' :
    props.status === 'L' ? 'orange' :
    props.status === 'C' ? 'blue' :
    props.status === 'H' ? 'blue' : 'green'};
`;

const StatusGuideContainer = styled.View`
  margin-top: 15px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
`;

const StatusGuideTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const StatusGuideItem = styled.Text`
  font-size: 15px;
  margin: 2px 0;
  font-weight: bold;
  color: ${(props) => {
    switch (props.status) {
      case 'L': return 'orange';
      case 'N': return 'red';
      case 'C': return 'blue';
      case 'P': return 'green';
      case 'H': return 'blue';
      default: return 'black';
    }
  }};
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
  const [isErrorVisiable, setIsErrorVisiable ] = useState(false);
  const [lastValidDate, setLastValidDate] = useState(null);
  
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

      console.log("Emp id--",empId)

      try {
        const [attendanceRes, holidayRes] = await Promise.all([
          getEmpAttendance(data),
          getEmpHoliday(data)
          
        ]);
        // console.log("data",holidayRes.data);
        
        processAttendanceData(attendanceRes.data);
        processHolidayData(holidayRes.data);

         setLastValidDate(new Date(currentYear, currentMonth, 1));
      } catch (error) {
        setIsErrorVisiable(true);
        console.error("Error fetching data:", error);
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
          <StatusText status={holidayStatus || attendance[day] || 'N'}>
            {displayStatus}
          </StatusText>
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
        <CalendarContainer>
          <NavButtonContainer onPress={() => changeMonth(-1)}>
            <Icon name="chevron-left" size={24} color="#3f87f9" />
          </NavButtonContainer>
          <MonthText>
            {`${date.toLocaleString('default', { month: 'long' })} ${currentYear}`}
          </MonthText>
          <NavButtonContainer onPress={() => changeMonth(1)}>
            <Icon name="chevron-right" size={24} color="#3f87f9" />
          </NavButtonContainer>
        </CalendarContainer>

        <WeekDays>
          {WEEK_DAYS.map((day, index) => (
            <WeekDayText key={index}>{day}</WeekDayText>
          ))}
        </WeekDays>

        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Calendar>
            {renderCalendarDays()}
          </Calendar>
          
          <StatusGuideContainer>
            <StatusGuideTitle>Status Guide</StatusGuideTitle>
            <StatusGuideItem status="P">P - Present</StatusGuideItem>
            <StatusGuideItem status="L">L - On Leave</StatusGuideItem>
            <StatusGuideItem status="C">C - Company Holiday</StatusGuideItem>
            <StatusGuideItem status="H">H - Weekly Holiday</StatusGuideItem>
            <StatusGuideItem status="N">N - Not Submitted</StatusGuideItem>
          </StatusGuideContainer>
        </ScrollView>

        <ErrorModal
          visible={isErrorVisiable}
          message="Your Holiday Calender did not setup for 2026"
          onClose={() => {
            setIsErrorVisiable(false);
            if (lastValidDate) {
              setDate(lastValidDate);
            }
          }}
        />
      </Container>
    </MainContainer>
  );
};

export default AttendanceStatus;