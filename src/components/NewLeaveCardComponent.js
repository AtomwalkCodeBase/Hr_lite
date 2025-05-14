import React from 'react';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';

const CardContainer = styled.TouchableOpacity`
  background-color: #fff;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 6px;
  elevation: 3;
  border-left-width: 6px;
  border-left-color: ${props => props.leaveTypeColor};
`;

const HeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;


const DateContainer = styled.View`
  width: 33%;
`;

const DateRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${props => props.last ? '0' : '6px'};
`;

const DateText = styled.Text`
  font-size: 16px;
  color: #444;
  font-weight: 600;
  margin-left: 8px;
`;

const BadgeContainer = styled.View`
  width: 33%;
  align-items: center;
`;

const LeaveTypeBadge = styled.View`
  background-color: ${props => props.color};
  padding: 6px 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  min-width: 100px; /* Minimum width */
  align-items: center;
`;

const LeaveTypeText = styled.Text`
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DaysText = styled.Text`
  font-size: 15px;
  color: #555;
  font-weight: 500;
  text-align: right;
`;

const StatusContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top-width: 1px;
  border-top-color: #f5f5f5;
`;

const StatusBadge = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${props => props.bgColor};
  padding: 6px 12px;
  border-radius: 16px;
  justify-content: center;
  min-width: 100px; /* Ensures a minimum width */
  max-width: 120px; /* Prevents excessive stretching */
  margin-left: auto; /* Pushes it to the right if needed */
`;

const StatusText = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.color};
  margin-left: 6px;
`;

const SubmittedText = styled.Text`
  font-size: 12px;
  color: #888;
`;

const getLeaveTypeColor = (type) => {
  const colors = {
    'EL': '#4CAF50',  // Green for Earned Leave
    'WH': '#2196F3',  // Blue for Work From Home
    'HL': '#FF9800',  // Orange for Half Day
    'LP': '#F44336'   // Red for Loss of Pay
  };
  return colors[type] || '#9E9E9E'; // Default gray
};

const getLeaveTypeDisplay = (type) => {
  const types = {
    'EL': 'EL',
    'WH': 'WFH',
    'HL': 'Half Day',
    'LP': 'LOP'
  };
  return types[type] || type;
};

const getStatusStyles = (status) => {
  switch (status) {
    case 'A': // Approved (Green)
      return { 
        bgColor: '#E8F5E9', 
        color: '#2E7D32', 
        icon: 'check-circle-outline'  // More modern outline variant
      };
    case 'S': // Submitted/Pending Approval (Blue)
      return { 
        bgColor: '#E3F2FD', 
        color: '#0D47A1',             // Darker blue for better contrast
        icon: 'schedule'              // Clock icon for "pending approval"
      };
    case 'C': // Cancelled (Red)
      return { 
        bgColor: '#FFEBEE', 
        color: '#C62828', 
        icon: 'cancel-presentation'   // More distinct "cancelled" icon
      };
    case 'R': // Rejected (Dark Red)
      return { 
        bgColor: '#FCE4EC', 
        color: '#B71C1C', 
        icon: 'block'                 // Stronger "rejected" connotation
      };
    default: // Pending (Orange)
      return { 
        bgColor: '#FFF3E0', 
        color: '#E65100',             // Darker orange for readability
        icon: 'hourglass-empty'      // Clear "waiting" metaphor
      };
  }
};



const formatDateWithoutYear = (dateString) => {
  const [day, month, year] = dateString.split('-');
  const date = new Date(`${year}-${month}-${day}`);
  const options = { day: 'numeric', month: 'short' };
  return date.toLocaleDateString('en-US', options);
};


const formatSubmitDate = (dateString) => {
  const [day, month, year] = dateString.split('-');
  const date = new Date(`${year}-${month}-${day}`);
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};


const NewLeaveCardComponent = ({ leave, onPress }) => {
  const leaveTypeColor = getLeaveTypeColor(leave.leave_type);
  const statusStyles = getStatusStyles(leave.status);
  const isHalfOrFullDay = leave.no_leave_count === '0.5' || leave.no_leave_count === '1.0' || leave.leave_type === 'WH';

  console.log("Leave---0",leave)
  
  return (
    <CardContainer onPress={() => onPress(leave)} leaveTypeColor={leaveTypeColor}>
      <HeaderRow>
        <DateContainer>
          <DateRow>
            <MaterialIcons name="event" size={18} color="#666" />
            <DateText>{formatDateWithoutYear(leave.from_date)}</DateText>
          </DateRow>
          
          {!isHalfOrFullDay && (
            <DateRow last>
              <MaterialIcons name="event" size={18} color="#666" />
              <DateText>{formatDateWithoutYear(leave.to_date)}</DateText>
            </DateRow>
          )}
        </DateContainer>
        
        <BadgeContainer>
          <LeaveTypeBadge color={leaveTypeColor}>
            <LeaveTypeText>{getLeaveTypeDisplay(leave.leave_type)}</LeaveTypeText>
          </LeaveTypeBadge>
          {!isHalfOrFullDay && (
          <DaysText>
            {leave.no_leave_count === '1.0' ? '1 day' : `${leave.no_leave_count} days`}
          </DaysText>
          )}
        </BadgeContainer>

        <StatusBadge bgColor={statusStyles.bgColor}>
          <MaterialIcons 
            name={statusStyles.icon} 
            size={16} 
            color={statusStyles.color} 
          />
          <StatusText color={statusStyles.color}>
            {leave.status_display}
          </StatusText>
        </StatusBadge>
      </HeaderRow>

      {/* <StatusContainer>
        
        
        <SubmittedText>Applied on {formatSubmitDate(leave.submit_date)}</SubmittedText>
      </StatusContainer> */}
    </CardContainer>
  );
};

export default NewLeaveCardComponent;