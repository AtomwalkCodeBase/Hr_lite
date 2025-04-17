import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { FontAwesome5 } from '@expo/vector-icons'; // For calendar icon

const HolidayBox = styled.View`
  flex-direction: row;
  align-items: center;
  /* padding: 20px; */
  padding-right: 20px;
  margin: 5px 0;
  background-color: #f9f9f9;
  border-radius: 10px;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  shadow-offset: 0px 2px;
  border: 1px solid #666;
`;

const SideBar = styled.View`
  width: 15px;
  height: 100%;
  background-color: #007bff;
  border-radius:  9px 0px 00px 9px;
`;

const HolidayInfoContainer = styled.View`
  flex: 1;
  padding: 20px;
  justify-content: space-between;
`;

const DateContainer = styled.View`
  flex-direction: row;
  align-items: center;
  /* justify-content: space-between; */
  margin-bottom: 25px;
`;

const DateView = styled.View`
flex-direction: column;
align-items: center;
/* justify-content: space-between; */
margin-bottom: 5px;
`;


const HolidayDateText = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: black;
  margin-left: 5px;
`;

const HolidayName = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #000;
`;

const WeekdayText = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin-bottom: 15px;

`;

const HolidayButton = styled(TouchableOpacity)`
  padding: 6px 20px;
  border-radius: 15px;
  
  background-color: ${props => props.color || '#555'};
`;

const HolidayButtonText = styled.Text`
  font-size: 14px;
  color: #fff;
  font-weight: bold;
`;

const HolidayCard = ({ data, holiday, onOptClick, onCancelClick }) => {
  return (
    <HolidayBox key={data}>
      <SideBar />
      <HolidayInfoContainer>
        <DateContainer>
          <FontAwesome5 name="calendar-alt" size={20} color="black" />
          <HolidayDateText>{holiday.date}</HolidayDateText>
        </DateContainer>

        <HolidayName>{holiday.name}</HolidayName>
      </HolidayInfoContainer>
      <DateView>
      <WeekdayText>{holiday.weekday}</WeekdayText>
      {holiday.type === 'Optional' && (
        holiday.is_opted ? (
          <HolidayButton color="#FF0000" onPress={() => onCancelClick(holiday.date)}>
            <HolidayButtonText>Cancel</HolidayButtonText>
          </HolidayButton>
        ) : (
          <HolidayButton color="#555" onPress={() => onOptClick(holiday.date)}>
            <HolidayButtonText>Opt Holiday</HolidayButtonText>
          </HolidayButton>
        )
      )}

        </DateView>
    </HolidayBox>
  );
};

export default HolidayCard;
