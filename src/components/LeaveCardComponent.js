import React from 'react';
import styled from 'styled-components/native';
import { View, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';

const ApplicationCard = styled.TouchableOpacity`
  background-color: #fff;
  padding: 16px;
  border-radius: 12px;
  border-left-width: 4px;
  border-left-color: ${props => props.borderColor || '#ddd'};
  margin-bottom: 12px;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const CardHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const LeaveType = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const DaysBadge = styled.View`
  background-color: #f0f7ff;
  padding: 4px 8px;
  border-radius: 12px;
`;

const DaysText = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: #4d88ff;
`;

const CardBody = styled.View`
  margin-bottom: 12px;
`;

const DateRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 6px;
`;

const DateText = styled.Text`
  font-size: 14px;
  color: #666;
  margin-left: 6px;
  
  font-weight: 600;
`;

const RemarksText = styled.Text`
  font-size: 14px;
  color: #666;
  font-style: italic;
`;

const CardFooter = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-top-width: 1px;
  border-top-color: #f0f0f0;
  padding-top: 12px;
`;

const StatusBadge = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${props => props.bgColor || '#f5f5f5'};
  padding: 4px 10px;
  border-radius: 14px;
`;

const StatusText = styled.Text`
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.color || '#666'};
  margin-left: 6px;
`;

const SubmitDate = styled.Text`
  font-size: 12px;
  color: #999;
`;

const CancelButton = styled.TouchableOpacity`
  background-color: #ffecec;
  padding: 6px 12px;
  border-radius: 6px;
  flex-direction: row;
  align-items: center;
`;

const CancelButtonText = styled.Text`
  color: #ff2400;
  font-size: 13px;
  font-weight: 500;
  margin-left: 4px;
`;

const LeaveCardComponent = ({ leave, statusStyles, onPress, onCancelPress, showCancelButton }) => {
  const { bgColor, color, borderColor } = statusStyles;

  // Format dates if needed
  const formatDate = (dateString) => {
    // Add your date formatting logic here if needed
    return dateString;
  };

  console.log("Leave----",leave)
  return (
    <ApplicationCard onPress={() => onPress(leave)} borderColor={borderColor}>
      <CardHeader>
        <LeaveType>{leave.leave_type_display}</LeaveType>

        <StatusBadge bgColor={bgColor}>
            <MaterialIcons 
              name={leave.status === 'A' ? 'check-circle' : leave.status === 'R' ? 'cancel' : 'access-time'} 
              size={16} 
              color={color} 
            />
            <StatusText color={color}>{leave.status_display}</StatusText>
          </StatusBadge>
      </CardHeader>
      {/* <CardHeader>
      <DateRow>
          <MaterialIcons name="date-range" size={16} color="#666" />
          <DateText>
            {formatDate(leave.from_date)} - {formatDate(leave.to_date)}
          </DateText>
        </DateRow>
        <StatusBadge bgColor={bgColor}>
            <MaterialIcons 
              name={leave.status === 'A' ? 'check-circle' : leave.status === 'R' ? 'cancel' : 'access-time'} 
              size={16} 
              color={color} 
            />
            <StatusText color={color}>{leave.status_display}</StatusText>
          </StatusBadge>
      </CardHeader> */}

      {/* <CardBody> */}
        {/* <DateRow>
          <MaterialIcons name="date-range" size={16} color="#666" />
          <DateText>
            {formatDate(leave.from_date)} - {formatDate(leave.to_date)}
          </DateText>
          
        </DateRow> */}
        
        
        {/* {leave.remarks && (
          <View style={{ marginTop: 8 }}>
            <RemarksText>"{leave.remarks}"</RemarksText>
          </View>
        )} */}
      {/* </CardBody> */}

      <CardFooter>
      <DateRow>
          <MaterialIcons name="date-range" size={16} color="#666" />
          <DateText>
            {formatDate(leave.from_date)} - {formatDate(leave.to_date)}
          </DateText>
        </DateRow>
        <DaysBadge>
          <DaysText>{leave.no_leave_count} day{leave.no_leave_count !== "1.0" ? 's' : ''}</DaysText>
        </DaysBadge>
        {/* {showCancelButton && (
          <CancelButton onPress={() => onCancelPress(leave)}>
            <MaterialIcons name="cancel" size={16} color="#ff2400" />
            <CancelButtonText>Cancel</CancelButtonText>
          </CancelButton>
        )} */}
      </CardFooter>
    </ApplicationCard>
  );
};

export default LeaveCardComponent;