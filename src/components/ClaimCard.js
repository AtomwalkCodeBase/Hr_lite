import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


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
      case 'N': return '#FFA000'; // Draft - Yellow
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
      case 'N': return '#FFF8E1'; // Draft - Light yellow
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
  padding: 6px 12px;
  border-radius: 16px;
  align-self: flex-start;
  margin-top: 8px;
`;

const AmountText = styled.Text`
  font-size: 16px;
  font-weight: bold;
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

const DeleteButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  margin-top: 6px;
  background-color: rgb(239, 17, 51);
  padding: 6px 12px;
  border-radius: 6px;
  align-self: flex-start;
`;

const DeleteButtonText = styled.Text`
  color: rgb(255, 255, 255);
  font-size: 14px;
  font-weight: 500;
  margin-left: 6px;
`;

const UpdateButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  margin-top: 6px;
  background-color: #1976D2;
  padding: 6px 12px;
  border-radius: 6px;
  align-self: flex-start;
`;

const UpdateButtonText = styled.Text`
  color: rgb(255, 255, 255);
  font-size: 14px;
  font-weight: 500;
  margin-left: 6px;
`;
const ButtonContainer = styled.View`
  flex-direction: column;
  margin-left: 10px;
  justify-content: center;
`;

const ButtonContainer2 = styled.View`
  flex-direction: row;
  /* margin-left: 10px; */
  justify-content: space-between;
  align-items: center;
`;

const ClaimCard = ({ claim, onPress, onViewFile, getStatusText, onDelete = () => {}, onUpdate = () => {} }) => {

  const status = claim.expense_status;
  const statusText = getStatusText(status);
  const [showUpdate, setShowUpdate] = useState(false);

 

  const employeeId = async() => {
      const EmpId = await AsyncStorage.getItem("empNoId")
      if (claim.employee_id == EmpId){
        setShowUpdate(true);
      }
  }

  useEffect(()=> {
    employeeId()
  },[])

  // const handleDelete = () => onDelete(claim.id);
  const formatIndianCurrency = (num) => {
  if (!num && num !== 0) return null; // handles null, undefined, empty string
  
  // Convert to number to handle cases like "12.00"
  const numberValue = Number(num);
  if (isNaN(numberValue)) return null;

  // Check if it's an integer (has no decimal or decimal is .00)
  const isInteger = Number.isInteger(numberValue);
  
  // Format the number based on whether it's an integer
  const numStr = isInteger ? numberValue.toString() : numberValue.toString();
  const parts = numStr.split('.');
  let integerPart = parts[0];
  const decimalPart = !isInteger && parts.length > 1 ? `.${parts[1]}` : '';

  // Format the integer part with Indian comma separators
  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  
  if (otherNumbers !== '') {
    integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  } else {
    integerPart = lastThree;
  }

  return `₹ ${integerPart}${decimalPart}`;
};
  const handleUpdate = () => onUpdate(claim);

  return (
    <ClaimCardContainer onPress={() => onPress(claim)} status={status}>
      <HeaderRow>
        <ClaimIdText>{claim.item_name}</ClaimIdText>
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

      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          
           {status !== 'N' && (
          
            
            <DetailRow>
            {/* <DetailLabel>Item Name:</DetailLabel> */}
            <DetailValue>{claim.claim_id}</DetailValue>
          </DetailRow>
        )}

          {/* <DetailRow>
            <DetailLabel>Expense Date:</DetailLabel>
            <DetailValue>{claim.expense_date}</DetailValue>
          </DetailRow> */}

          <DetailRow>
            <DetailLabel>Submitted:</DetailLabel>
            <DetailValue>{claim.submitted_date}</DetailValue>
          </DetailRow>
        </View>

        {/* Action buttons aligned to right of detail rows */}
        {status === 'N' && (
          <ButtonContainer>
            
            {/* {onDelete && (
              <DeleteButton onPress={handleDelete}>
                <Ionicons name="trash-outline" size={18} color="#fff" />
                <DeleteButtonText>Delete</DeleteButtonText>
              </DeleteButton>
            )} */}
          </ButtonContainer>
        )}
      </View>

      <AmountContainer status={status}>
        <AmountText status={status}>
          {formatIndianCurrency(claim.expense_amt)}
        </AmountText>
      </AmountContainer>

      {/* {claim.submitted_file_1 && (
        <ViewFileButton onPress={() => onViewFile(claim.submitted_file_1)}>
          <MaterialIcons name="insert-drive-file" size={18} color="#1976D2" />
          <ViewFileText>View Attachment</ViewFileText>
        </ViewFileButton>
      )} */}
      <ButtonContainer2>
        {claim.submitted_file_1 && (
          <ViewFileButton onPress={() => onViewFile(claim.submitted_file_1)}>
            <MaterialIcons name="insert-drive-file" size={18} color="#1976D2" />
            <ViewFileText>View Attachment</ViewFileText>
          </ViewFileButton>
        )}

        {(status === 'N' || status === 'B' && showUpdate) && (
          <UpdateButton onPress={handleUpdate}>
              <Ionicons name="create-outline" size={18} color="#fff" />
              <UpdateButtonText>Update</UpdateButtonText>
            </UpdateButton>
        )}
      </ButtonContainer2>


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