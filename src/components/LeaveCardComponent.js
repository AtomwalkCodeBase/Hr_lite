import React from 'react';
import styled from 'styled-components/native';
import { View, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';

const ApplicationCard = styled.TouchableOpacity`
  background-color: #fff;
  padding: 16px;
  border-radius: 12px;
  border-width: 1px;
  border-color: ${props => props.borderColor || '#ddd'};
  margin-bottom: 12px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

const ApplicationStatusContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
`;

const ApplicationStatus = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.bgColor || 'transparent'};
  padding: 2px 8px;
  border-radius: 20px;
`;

const ApplicationStatusText = styled.Text`
  font-size: 14px;
  font-weight: bold;
  padding: 2px;
  color: ${props => props.color || '#000'};
  /* margin-left: 8px; */
`;

const DetailText = styled.Text`
  font-size: 14px;
  color: #333;
`;

const DetailHighlight = styled.Text`
  font-weight: bold;
  color: #333;
`;

const CancelButton = styled.TouchableOpacity`
  background-color: #ff2400;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 8px;
  border-radius: 5px;
  margin-top: 10px;
  /* border: 1px solid black; */
`;

const CancelButtonText = styled.Text`
  color: #fff;
  font-size: 14px;
  font-weight: bold;
`;

const LeaveCardComponent = ({ leave, statusStyles, onPress, onCancelPress, showCancelButton }) => {
  const { bgColor, color, borderColor, icon } = statusStyles;

  return (
    <ApplicationCard onPress={() => onPress(leave)} borderColor={borderColor}>
      <ApplicationStatusContainer>
        <View>
          <DetailText>
            <DetailHighlight>{leave.leave_type_display}</DetailHighlight>
          </DetailText>
          <DetailText>{leave.from_date} to {leave.to_date}</DetailText>
          <DetailText>
            <DetailHighlight>{leave.no_leave_count} Days</DetailHighlight>
          </DetailText>
        </View>
        <View style={{ flexDirection: 'column' }}>
        <ApplicationStatus bgColor={bgColor}>
          <ApplicationStatusText color={color}>{leave.status_display}</ApplicationStatusText>
          {/* {icon === 'time-outline' ? (
            <Ionicons name={icon} size={20} color={color} />
          ) : (
            <MaterialIcons name={icon} size={20} color={color} />
          )} */}
        </ApplicationStatus>

          {showCancelButton && (
            <CancelButton onPress={() => onCancelPress(leave)}>
              <CancelButtonText>Cancel</CancelButtonText>
            </CancelButton>
          )}
        </View>
      </ApplicationStatusContainer>
    </ApplicationCard>
  );
};

export default LeaveCardComponent;
