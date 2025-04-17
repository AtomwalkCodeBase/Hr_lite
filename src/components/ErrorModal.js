import React from 'react';
import { Modal, View, Image, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.View`
  width: 80%;
  padding: 20px;
  background-color: #fff;
  border-radius: 16px;
  align-items: center;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
`;

const IconContainer = styled.View`
  margin-bottom: 20px;
`;

const TitleText = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
`;

const MessageText = styled.Text`
  font-size: 16px;
  color: #666;
  text-align: center;
  margin-bottom: 20px;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  gap: 10px;
`;

const ModalButton = styled.TouchableOpacity`
  padding: 10px 25px;
  border-radius: 25px;
  background-color: ${({ color }) => color || '#007aff'};
`;

const ButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: bold;
`;

const ErrorModal = ({ visible, message, onClose, onRetry }) => (
  <Modal transparent visible={visible} animationType="fade">
    <ModalContainer>
      <ModalContent>
        <IconContainer>
          <Image
            source={require('../../assets/images/EmptyState.png')}
            style={{ width: 80, height: 80 }}
          />
        </IconContainer>
        <TitleText>Oops!</TitleText>
        <MessageText>{message || "Something went wrong, please try again"}</MessageText>
        
        <ButtonContainer>
          {onRetry && (
            <ModalButton color="#28a745" onPress={onRetry}>
              <ButtonText>Retry</ButtonText>
            </ModalButton>
          )}
          <ModalButton onPress={onClose}>
            <ButtonText>Close</ButtonText>
          </ModalButton>
        </ButtonContainer>
      </ModalContent>
    </ModalContainer>
  </Modal>
);

export default ErrorModal;
