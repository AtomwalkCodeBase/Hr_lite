// CalendarContainer.js
import React from 'react';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CalendarContainerWrapper = styled.View`
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

const CalendarContainer = ({ month, year, onPrevMonth, onNextMonth }) => (
  <CalendarContainerWrapper>
    {onPrevMonth && (
      <NavButtonContainer onPress={onPrevMonth}>
        <Icon name="chevron-left" size={24} color="#3f87f9" />
      </NavButtonContainer>
    )}
    {month && year && <MonthText>{`${month} ${year}`}</MonthText>}
    {onNextMonth && (
      <NavButtonContainer onPress={onNextMonth}>
        <Icon name="chevron-right" size={24} color="#3f87f9" />
      </NavButtonContainer>
    )}
  </CalendarContainerWrapper>
);

export default CalendarContainer;
