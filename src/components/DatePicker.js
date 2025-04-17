import React, { useState } from 'react';
import { Platform, Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import styled from 'styled-components/native';
import { colors } from '../Styles/appStyle';

const DatePickerButton = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-width: 1px;
  border-color: #ccc;
  padding: 10px;
  border-radius: 5px;
`;

const FieldContainer = styled.View`
  /* margin-bottom: 20px; */
  margin-top: 5px;
`;


const DateText = styled.Text`
  font-size: 16px;
`;
const Label = styled.Text`
  font-size: 16px;
  margin-bottom: 5px;
`;

const Icon = styled.Image`
  width: 24px;
  height: 24px;
`;

const DatePicker = ({ error, label, cDate, setCDate }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <FieldContainer>
      <Label>{label}</Label>
      <DatePickerButton onPress={() => setShowDatePicker(true)}>
        <DateText>{cDate.toDateString()}</DateText>
        <Icon source={require('../../assets/images/c-icon.png')} />
      </DatePickerButton>
      {showDatePicker && (
        <DateTimePicker
          value={cDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || cDate;
            setShowDatePicker(Platform.OS === 'ios');
            setCDate(currentDate);
          }}
        />
      )}
      {error && (
        <Text style={{marginTop: 7, color: colors.red, fontSize: 12}}>
          {error}
        </Text>
      )}
    </FieldContainer>
  );
};

export default DatePicker;
