import React from 'react';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

const CardContainer = styled.TouchableOpacity`
  background-color: #fff;
  padding: 16px;
  border-radius: 12px;
  border-width: 1px;
  border-color: ${props => props.borderColor || '#ddd'};
  margin-bottom: 12px;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  shadow-offset: 0px 2px;
  elevation: 4;
`;

const StatusContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const Status = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.bgColor || 'transparent'};
  padding: 4px 8px;
  border-radius: 8px;
`;

const StatusText = styled.Text`
  font-size: 14px;
  color: ${props => props.color || '#000'};
  margin-left: 8px;
  font-weight: bold;
`;

const DetailText = styled.Text`
  font-size: 14px;
  margin-bottom: 10px;
  color: #333;
`;

const RejectButton = styled.TouchableOpacity`
  background-color: #ff6666;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 3px 28px;
  border-radius: 22px;
  margin-top: 10px;
`;

const ApproveButton = styled.TouchableOpacity`
  background-color: #007bff;
  align-items: center;
  justify-content: center;
  padding: 3px 20px;
  border-radius: 22px;
  margin-top: 10px;
  height: 40px;
`;

const ButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
`;

const ApproveLeaveCard = ({ leave, onPress, onApprove, onReject }) => {
  const getStatusStyles = (status_display) => {
    switch (status_display) {
      case 'Submitted':
        return { bgColor: '#fff7e6', color: '#FFA800', borderColor: '#FFA800' };
      case 'Rejected':
        return { bgColor: '#ffe6e6', color: '#FF0000', borderColor: '#FF0000', icon: 'cancel' };
      case 'Cancelled':
        return { bgColor: '#ffe6e6', color: '#ff6666', borderColor: '#ff6666', icon: 'cancel' };
      case 'Approved':
        return { bgColor: '#eaffea', color: '#66cc66', borderColor: '#66cc66', icon: 'check-circle' };
      default:
        return { bgColor: '#fff', color: '#000', borderColor: '#ddd', icon: 'check-circle' };
    }
  };

  const { bgColor, color, borderColor, icon } = getStatusStyles(leave.status_display);

  return (
    <CardContainer borderColor={borderColor} onPress={() => onPress(leave)}>
      <StatusContainer>
        <View>
          <DetailText>
            {leave.emp_data.emp_id} [{leave.emp_data.name}]
          </DetailText>
          <DetailText>Date: {leave.from_date} to {leave.to_date}</DetailText>
        </View>
        <Status bgColor={bgColor}>
          <StatusText color={color}>{leave.leave_type_display}</StatusText>
          <MaterialIcons name={icon} size={24} color={color} />
        </Status>
      </StatusContainer>
      {leave.status_display === 'Submitted' && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <RejectButton onPress={() => onReject(leave)}>
            <ButtonText>Reject</ButtonText>
          </RejectButton>
          <ApproveButton onPress={() => onApprove(leave)}>
            <ButtonText>Approve</ButtonText>
          </ApproveButton>
        </View>
      )}
    </CardContainer>
  );
};

export default ApproveLeaveCard;
