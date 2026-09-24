import React, { useEffect } from 'react';
import styled from 'styled-components/native';
import { Modal, View, Image } from 'react-native';

const ContentContainer = styled.View`
  width: 80%;
  max-width: 400px;
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
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <ContentContainer>
          <IconContainer>
            <Image
              source={require('../../assets/images/Like.png')}
              style={{ width: 60, height: 60 }}
            />
          </IconContainer>

          <MessageText>Success!</MessageText>

          <SubText>
            {message || 'Your action completed successfully.'}
          </SubText>

          <CloseButton onPress={onClose}>
            <CloseButtonText>Close</CloseButtonText>
          </CloseButton>
        </ContentContainer>
      </View>
    </Modal>
  );
};

export default SuccessModal;