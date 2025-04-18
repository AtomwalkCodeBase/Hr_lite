import React from 'react';
import { Text } from 'react-native';
import styled from 'styled-components/native';
import { colors } from '../Styles/appStyle';

const RequestTextArea = styled.TextInput`
  border: 1px solid #ccc;
  padding: 12px;
  text-align-vertical: top;
  border-radius: 8px;
  font-size: 16px;
  width: 100%;
  min-height: 120px;
  background-color: ${colors.lightGray};
`;

const Label = styled.Text`
  font-size: 16px;
  margin-top: 15px;
  margin-bottom: 5px;
`;

const ErrorText = styled.Text`
  margin-top: 7px;
  color: ${colors.red};
  font-size: 12px;
`;

const RequestTextInput = ({ 
  error, 
  value, 
  onChangeText, 
  placeholder = "Describe your help request in detail...", 
  label = "Help Request Details" 
}) => {
  return (
    <>
      <Label>{label} :</Label>
      <RequestTextArea
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline
        numberOfLines={5}
        placeholderTextColor={colors.mediumGray}
      />
      {error && <ErrorText>{error}</ErrorText>}
    </>
  );
};

export default RequestTextInput;