import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getEmpAttendance, getEmpHoliday } from '../services/productServices';
import { useNavigation } from 'expo-router';
import HeaderComponent from '../components/HeaderComponent';

const Container = styled.View`
  flex: 1;
  padding: 20px;
  background-color: #fff;
`;

const Header = styled.View`
  align-items: center;
  margin-bottom: 10px;
`;

const HeaderText = styled.Text`
  font-size: 18px;
  font-weight: bold;
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

const getStatusColor = (status) => {
  switch (status) {
    case 'L':
      return 'orange'; // On Leave
    case 'N':
      return 'red'; // Not Submitted
    case 'C':
      return 'blue'; // Company Holiday
    case 'P':
      return 'green'; // Present
    case 'H':
      return 'blue'; // Weekly Holiday
    default:
      return 'black'; // Default color if no status matches
  }
};

const StatusGuideItem = styled.Text`
  font-size: 15px;
  margin: 2px 0;
  font-weight: bold;
  color: ${(props) => getStatusColor(props.status)};
`;

const AttendanceStatus = (props) => {
  const [date, setDate] = useState(new Date());
  const [attData, setAttData] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [holiday, setHoliday] = useState({});
  const empId = props.id;
  
  const navigation = useNavigation();

  // console.log('Att Data====>',attData[2]?.geo_data)
  // console.log('Attendance Data---->',attendance)

  
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();


  

  useEffect(() => {
    const data = {
      emp_id: empId,
      month: currentMonth + 1, // Month is 0-indexed, so add 1
      year: currentYear,
    };

    fetchAttendanceDetails(data);
  }, [currentMonth, currentYear, empId]);

  const fetchAttendanceDetails = (data) => {
    getEmpAttendance(data).then((res) => {
      setAttData(res.data);
      processAttendanceData(res.data);
    });
    getEmpHoliday(data).then((res) => {
      // console.log('Holiday Data---',res.data)
      processHolidayData(res.data);
    });
  };


  const processAttendanceData = (data) => {
    const attendanceMap = {};
    data.forEach((item) => {
      const day = parseInt(item.a_date.split('-')[0], 10);
      attendanceMap[day] = item.attendance_type;
    });
    setAttendance(attendanceMap);
  };

  const monthNameMap = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };
  
  const processHolidayData = (data) => {
    const holidayMap = {};

    // Process holiday_list
    if (data.holiday_list && Array.isArray(data.holiday_list)) {
      data.holiday_list.forEach((holidayDate) => {
        if (holidayDate) {
          const [day, monthName, year] = holidayDate.split('-');
          const month = monthNameMap[monthName];

          if (month !== undefined && month === currentMonth && parseInt(year, 10) === currentYear) {
            holidayMap[parseInt(day, 10)] = 'C';
          } else {
            // console.log(`Skipping holiday: ${holidayDate} (month mismatch or invalid month)`);
          }
        } else {
          // console.log('Skipping empty holiday date');
        }
      });
    }

    // Process holiday_saturday_list
    if (data.holiday_saturday_list) {
      const saturdayDates = data.holiday_saturday_list.split('|');
      
      saturdayDates.forEach((saturdayDate) => {
        if (saturdayDate) {
          const [day, monthName] = saturdayDate.split('-');
          const year = currentYear; // Use the current year for Saturday holidays
          const month = monthNameMap[monthName];

          if (month !== undefined && month === currentMonth) {
            holidayMap[parseInt(day, 10)] = 'H';
          } else {
            // console.log(`Skipping Saturday holiday: ${saturdayDate} (month mismatch or invalid month)`);
          }
        } else {
          // console.log('Skipping empty Saturday holiday date');
        }
      });
    }

    // Mark all Sundays in the current month as 'H'
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);

      // Check if the day is Sunday (0 represents Sunday)
      if (date.getDay() === 0) {
        holidayMap[day] = 'H'; // Mark this day as a holiday
        // console.log(`Marking ${day}-${currentMonth + 1}-${currentYear} as holiday (Sunday)`);
      }
    }

    setHoliday(holidayMap);
    // console.log('Processed Holiday Map:', holidayMap);
  };

  // Days of the week
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Function to get the number of days in the current month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Function to get the starting day of the month (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  // Change month function
  const changeMonth = (direction) => {
    setDate((prevDate) => {
      const newMonth = prevDate.getMonth() + direction;
      return new Date(prevDate.setFullYear(prevDate.getFullYear(), newMonth));
    });
  };

  // Generate days for the calendar
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear);

  

  return (

    <>
    <HeaderComponent headerTitle="Attendance Status" onBackPress={() => navigation.goBack()} />
      
    <Container>
      <CalendarContainer>
        <NavButtonContainer onPress={() => changeMonth(-1)}>
          <Icon name="chevron-left" size={24} color="#3f87f9" />
        </NavButtonContainer>
        <MonthText>{`${date.toLocaleString('default', { month: 'long' })} ${currentYear}`}</MonthText>
        <NavButtonContainer onPress={() => changeMonth(1)}>
          <Icon name="chevron-right" size={24} color="#3f87f9" />
        </NavButtonContainer>
      </CalendarContainer>
      <WeekDays>
        {weekDays.map((day, index) => (
          <WeekDayText key={index}>{day}</WeekDayText>
        ))}
      </WeekDays>
      <ScrollView>
        <Calendar>
          {/* Create empty placeholders for days before the first day of the month */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <DayContainer key={`empty-${index}`}>
              <DayText></DayText>
            </DayContainer>
          ))}

          {/* Generate the days of the current month */}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;

            // Get the holiday status for the day (if it exists)
            const holidayStatus = holiday[day];
            
            // Determine the display status based on holiday status and attendance status
            let displayStatus = 'N'; // Default to 'N'
            
            if (holidayStatus === 'C') {
              displayStatus = 'C'; // Display 'C' for comp holiday
            } else if (holidayStatus === 'H') {
              displayStatus = 'H'; // Display 'H' for holiday
            } else {
              const attendanceStatus = attendance[day]; // Get attendance status for the day
              displayStatus = attendanceStatus === 'A' ? 'P' : attendanceStatus || 'N'; // Convert 'A' to 'P', otherwise show attendance or 'N'
            }

            return (
              <DayContainer key={day}>
                <DayText>{day}</DayText>
                <StatusText status={holidayStatus || attendance[day] || 'N'}>
                  {displayStatus}
                </StatusText>
              </DayContainer>
            );
          })}
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
    </Container>
    </>
  );
};

export default AttendanceStatus;
