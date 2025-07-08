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
  font-weight: 600;
  margin-bottom: 5px;
`;

const Icon = styled.Image`
  width: 24px;
  height: 24px;
`;

const DatePicker = ({ error, label, cDate, setCDate, minimumDate, maximumDate }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <FieldContainer>
      <Label>{label}</Label>
      <DatePickerButton onPress={() => setShowDatePicker(true)}>
        <DateText>{cDate instanceof Date && !isNaN(cDate) ? cDate.toDateString() : '--:--:----'}</DateText>
        <Icon source={require('../../assets/images/c-icon.png')} />
      </DatePickerButton>

      {showDatePicker && (
        <DateTimePicker
          value={cDate instanceof Date && !isNaN(cDate) ? cDate : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            // Only update if user confirms (not cancel)
            if (Platform.OS === 'android') {
              if (event.type === 'set' && selectedDate) {
                setCDate(selectedDate);
              }
              setShowDatePicker(false);
            } else {
              // iOS: selectedDate is undefined if cancelled
              if (selectedDate) {
                setCDate(selectedDate);
              }
            }
          }}
          {...(minimumDate ? { minimumDate } : {})}
          {...(maximumDate ? { maximumDate } : {})}
        />
      )}

      {error && (
        <Text style={{ marginTop: 7, color: colors.red, fontSize: 12 }}>
          {error}
        </Text>
      )}
    </FieldContainer>
  );
};


export default DatePicker;
