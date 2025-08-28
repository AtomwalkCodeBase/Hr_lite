import React from 'react';
import styled from 'styled-components/native';
import { Image } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const EmptyMessageContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #fff;
`;

const IconContainer = styled.View`
  margin-bottom: 10px;
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
`;

const EmptyMessage = ({ iconName, message = 'Nothing to Display', subMessage, data }) => {
  const hasIcon = !!iconName;

  return (
    <EmptyMessageContainer>
      <IconContainer>
        {hasIcon ? (
          <MaterialCommunityIcons name={iconName} size={60} color="#6c757d" />
        ) : (
          <Image
            source={require('../../assets/images/Tasks.png')}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />
        )}
      </IconContainer>
      <MessageText>{message}</MessageText>
      <SubText>{subMessage || `There are no ${data || 'relevant'} data found.`}</SubText>
    </EmptyMessageContainer>
  );
};

export default EmptyMessage;
