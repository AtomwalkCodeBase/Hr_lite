import React from 'react';
import { Modal, Text, View, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import QRCode from 'react-native-qrcode-svg';

// Styled Components
const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const QRContainer = styled.View`
  background-color: white;
  padding: 20px;
  border-radius: 15px;
  align-items: center;
  shadow-color: #000;
  shadow-opacity: 0.3;
  shadow-radius: 10px;
  elevation: 10;
`;

const CloseButton = styled.TouchableOpacity`
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #ff5c5c;
  border-radius: 10px;
`;

const CloseButtonText = styled.Text`
  color: white;
  font-size: 16px;
`;

const QRModal = ({ isVisible, onClose, qrValue }) => {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
    >
      <ModalContainer>
        <QRContainer>
          <Text style={{ fontSize: 18, marginBottom: 20 }}>Your QR Code</Text>
          <QRCode value={qrValue || 'No Value Provided'} size={200} />
          <CloseButton onPress={onClose}>
            <CloseButtonText>Close</CloseButtonText>
          </CloseButton>
        </QRContainer>
      </ModalContainer>
    </Modal>
  );
};

export default QRModal;
