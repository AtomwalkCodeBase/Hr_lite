import React from 'react';
import styled from 'styled-components/native';
import { Text, View, Image } from 'react-native';

const EmptyMessageContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #fff;
`;

const IconContainer = styled.View`
  margin-bottom: 0px;
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

const EmptyMessage = (res) => {
  return (
    <EmptyMessageContainer>
      <IconContainer>
        <Image source={require('../../assets/images/Tasks.png')} style={{ width: 120, height: 120 }} />
      </IconContainer>
      <MessageText>Nothing to Display</MessageText>
      <SubText>There are no {res.data} data found.</SubText>
      
    </EmptyMessageContainer>
  );
};

export default EmptyMessage;
