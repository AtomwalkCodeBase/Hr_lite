import React, { useEffect } from 'react';
import styled from 'styled-components/native';
import { Modal, View, Image, Text, TouchableOpacity } from 'react-native';

const ModalContainer = styled.Modal`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ContentContainer = styled.View`
  width: 80%;
  padding: 20px;
  background-color: #fff;
  border: 1px solid #a970ff;
  border-radius: 10px;
  align-items: center;
`;

const IconContainer = styled.View`
  margin-bottom: 20px;
`;

const MessageText = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
`;

const SubText = styled.Text`
  font-size: 14px;
  color: #888;
  text-align: center;
  margin-bottom: 20px;
`;

const CloseButton = styled.TouchableOpacity`
  background-color: #007bff;
  padding: 10px 20px;
  border-radius: 25px;
`;

const CloseButtonText = styled.Text`
  color: #fff;
  font-weight: bold;
  font-size: 16px;
`;

const SuccessModal = ({ visible, onClose, message }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto close after 10 seconds
      
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  return (
    <ModalContainer
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ContentContainer>
          <IconContainer>
            <Image source={require('../../assets/images/Like.png')} style={{ width: 60, height: 60 }} />
          </IconContainer>
          <MessageText>Success!</MessageText>
          <SubText>{message || "Your action completed successfully."}</SubText>
          <CloseButton onPress={onClose}>
            <CloseButtonText>Close</CloseButtonText>
          </CloseButton>
        </ContentContainer>
      </View>
    </ModalContainer>
  );
};

export default SuccessModal;
