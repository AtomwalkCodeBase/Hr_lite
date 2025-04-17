import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import styled from 'styled-components/native';

const ButtonContainer = styled(TouchableOpacity)`
  background-color: ${(props) => props.bgColor || '#007BFF'};
  padding: 12px;
  border-radius: 5px;
  align-items: center;
  margin-top: 20px;
`;

const ButtonText = styled(Text)`
  color: ${(props) => props.textColor || '#fff'};
  font-size: 16px;
  font-weight: bold;
`;

const SubmitButton = ({ label, onPress, bgColor, textColor }) => {
  return (
    <ButtonContainer onPress={onPress} bgColor={bgColor}>
      <ButtonText textColor={textColor}>{label}</ButtonText>
    </ButtonContainer>
  );
};

export default SubmitButton;
