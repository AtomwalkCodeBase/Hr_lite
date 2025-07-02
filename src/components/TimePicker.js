import React, { useState } from 'react';
import { Platform, Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import styled from 'styled-components/native';
import { colors } from '../Styles/appStyle';
import { Ionicons } from '@expo/vector-icons';

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

const TimePicker = ({ error, label, cDate, setCDate }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const isValidDate = cDate instanceof Date && !isNaN(cDate);

  // Format time as HH:MM AM/PM or '--:--' if invalid
  const formatTime = (date) => {
    if (!isValidDate) return '--:--';
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <FieldContainer>
      <Label>{label}</Label>
      <DatePickerButton onPress={() => setShowDatePicker(true)}>
        <DateText>{formatTime(cDate)}</DateText>
        <Ionicons name="time-outline" size={22} color="black" />
      </DatePickerButton>

      {showDatePicker && (
        <DateTimePicker
          value={isValidDate ? cDate : new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            if (selectedDate) {
              setShowDatePicker(Platform.OS === 'ios'); // Stay open on iOS
              setCDate(selectedDate);
              console.log('Selected time:', selectedDate);
            }
          }}
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


export default TimePicker;
