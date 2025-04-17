import React from 'react';
import styled from 'styled-components/native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { View, TouchableOpacity } from 'react-native';

const ClaimCardContainer = styled.TouchableOpacity`
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  elevation: 2;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  border-left-width: 4px;
  border-left-color: ${props => {
    switch(props.status) {
      case 'A': return '#4CAF50'; // Approved - Green
      case 'S': return '#2196F3'; // Submitted - Blue
      case 'F': return '#9C27B0'; // Forwarded - Purple
      case 'R': return '#F44336'; // Rejected - Red
      case 'B': return '#FF9800'; // Back to claimant - Orange
      default: return '#9E9E9E'; // Default - Gray
    }
  }};
`;

const HeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const ClaimIdText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #333;
`;

const StatusBadge = styled.View`
  background-color: ${props => {
    switch(props.status) {
      case 'A': return '#E8F5E9'; // Approved
      case 'S': return '#E3F2FD'; // Submitted
      case 'F': return '#F3E5F5'; // Forwarded
      case 'R': return '#FFEBEE'; // Rejected
      case 'B': return '#FFF3E0'; // Back to claimant
      default: return '#F5F5F5'; // Default
    }
  }};
  padding: 4px 8px;
  border-radius: 12px;
  flex-direction: row;
  align-items: center;
`;

const StatusText = styled.Text`
  color: ${props => {
    switch(props.status) {
      case 'A': return '#2E7D32'; // Approved
      case 'S': return '#1565C0'; // Submitted
      case 'F': return '#7B1FA2'; // Forwarded
      case 'R': return '#C62828'; // Rejected
      case 'B': return '#EF6C00'; // Back to claimant
      default: return '#424242'; // Default
    }
  }};
  font-size: 13px;
  font-weight: 600;
  margin-left: 4px;
`;

const DetailRow = styled.View`
  flex-direction: row;
  margin-bottom: 6px;
`;

const DetailLabel = styled.Text`
  font-size: 14px;
  color: #757575;
  width: 100px;
`;

const DetailValue = styled.Text`
  font-size: 14px;
  color: #212121;
  flex: 1;
`;

const AmountContainer = styled.View`
  background-color: #FFF8E1;
  padding: 6px 12px;
  border-radius: 16px;
  align-self: flex-start;
  margin-top: 8px;
`;

const AmountText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #FF8F00;
`;

const ViewFileButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  margin-top: 12px;
`;

const ViewFileText = styled.Text`
  color: #1976D2;
  font-size: 14px;
  font-weight: 500;
  margin-left: 6px;
`;

const ApprovalInfo = styled.View`
  margin-top: 8px;
  padding-top: 8px;
  border-top-width: 1px;
  border-top-color: #EEEEEE;
`;

const ApprovalText = styled.Text`
  font-size: 13px;
  color: #616161;
  font-style: italic;
`;

const ClaimCard = ({ claim, onPress, onViewFile, getStatusText }) => {
  const status = claim.expense_status;
  const statusText = getStatusText(status);

  return (
    <ClaimCardContainer onPress={() => onPress(claim)} status={status}>
      <HeaderRow>
        <ClaimIdText>{claim.claim_id}</ClaimIdText>
        <StatusBadge status={status}>
          <Feather 
            name={
              status === 'A' ? 'check-circle' : 
              status === 'R' ? 'x-circle' : 
              status === 'B' ? 'corner-up-left' : 
              status === 'F' ? 'share-2' : 'clock'
            } 
            size={14} 
            color={
              status === 'A' ? '#2E7D32' : 
              status === 'R' ? '#C62828' : 
              status === 'B' ? '#EF6C00' : 
              status === 'F' ? '#7B1FA2' : '#1565C0'
            } 
          />
          <StatusText status={status}>{statusText}</StatusText>
        </StatusBadge>
      </HeaderRow>

      <DetailRow>
        <DetailLabel>Item Name:</DetailLabel>
        <DetailValue>{claim.item_name}</DetailValue>
      </DetailRow>

      <DetailRow>
        <DetailLabel>Expense Date:</DetailLabel>
        <DetailValue>{claim.expense_date}</DetailValue>
      </DetailRow>

      <DetailRow>
        <DetailLabel>Submitted:</DetailLabel>
        <DetailValue>{claim.submitted_date}</DetailValue>
      </DetailRow>

      <AmountContainer>
        <AmountText>₹ {claim.expense_amt}</AmountText>
      </AmountContainer>

      {claim.submitted_file_1 && (
        <ViewFileButton onPress={() => onViewFile(claim.submitted_file_1)}>
          <MaterialIcons name="insert-drive-file" size={18} color="#1976D2" />
          <ViewFileText>View Attachment</ViewFileText>
        </ViewFileButton>
      )}

      {(status === 'A' || status === 'R') && claim.approved_date && (
        <ApprovalInfo>
          <ApprovalText>
            {status === 'A' ? 'Approved' : 'Rejected'} by {claim.approved_by} on {claim.approved_date}
          </ApprovalText>
        </ApprovalInfo>
      )}

      {status === 'F' && claim.approved_by && (
        <ApprovalInfo>
          <ApprovalText>
            Forwarded by {claim.approved_by}
          </ApprovalText>
        </ApprovalInfo>
      )}
    </ClaimCardContainer>
  );
};

export default ClaimCard;