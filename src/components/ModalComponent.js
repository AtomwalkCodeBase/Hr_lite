import React from 'react';
import { Image, Modal } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../Styles/appStyle';

const ModalComponent = ({ isVisible, leave, claim, helpRequest, onClose, onCancelLeave, showCancelButton }) => {
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

  return `₹${integerPart}${decimalPart}`;
};

  const shouldDisplayField = (value) => {
    return value !== null && value !== undefined && value !== '';
  };

  const renderDetails = () => {
  const data = leave || claim || helpRequest;
  const type = leave ? 'leave' : claim ? 'claim' : helpRequest ? 'helpRequest' : null;

    if (!data || !type) return null;

  const getStatusValue = (status) => {
    if (!status) return undefined;
    return status.toLowerCase();
  };

  const detailConfigs = {
    leave: [
      { label: 'Leave Type', value: data.leave_type_display, bold: true },
      { label: 'Duration', value: `${data.from_date} to ${data.to_date} (${data.no_leave_count} days)` },
      { 
        label: 'Status', 
        value: data.status_display, 
        status: getStatusValue(data.status_display) ,
        bold: true
      },
      { label: 'Submitted', value: data.submit_date },
        { label: 'Remarks', value: data.remarks }
    ],
    claim: [
        { label: 'Item Name', value: data.item_name, bold: true },
        { 
          label: 'Amount', 
          value: data.expense_amt ? `${formatIndianCurrency(data.expense_amt)}` : null,
          bold: true,
          isCurrency: true
        },
      { label: 'Claim ID', value: data.claim_id, noWrap: true },
      { label: 'Submitted', value: data.submitted_date },
        { label: 'Expense Date', value: data.expense_date },
        { label: 'Project', value: data.project_name },
        { label: 'Remarks', value: data.remarks },
        { label: 'Manager Remarks', value: data.approval_remarks }
    ],
    helpRequest: [
      { label: 'Request ID', value: data.request_id, bold: true },
      { label: 'Category', value: data.request_sub_type },
      { label: 'Date', value: data.created_date },
      { 
        label: 'Status', 
        value: data.status_display, 
        status: getStatusValue(data.status_display) 
      },
      { label: 'Request Details', value: data.request_text },
      { label: 'Remarks', value: data.remarks},
      { label: 'Image', value: data.submitted_file_1, type: "image" },
    ]
  };

return (
  <DetailContainer>
    {detailConfigs[type].map((item, index) => {
      // If item is image type, only show if value exists
      if (item.type === "image") {
        if (!item.value) return null;
        return (
          <DetailItem key={index}>
            <DetailLabel bold={item.bold}>{item.label}:</DetailLabel>
            <Image
              source={{ uri: item.value }}
              style={{ width: 120, height: 120, borderRadius: 12, resizeMode: "cover", borderWidth: 1, borderColor: "#eee", marginLeft: 8 }}
            />
          </DetailItem>
        );
      }
      // For other types, show if condition is not false
      if (item.condition === false) return null;
      return (
        <DetailItem key={index}>
          <DetailLabel bold={item.bold}>{item.label}:</DetailLabel>
          {item.noWrap ? (
            <ClaimIDValue>{item.value}</ClaimIDValue>
              ) : item.isCurrency ? (
                <CurrencyValue bold={item.bold}>{item.value}</CurrencyValue>
          ) : (
            <DetailValue status={item.status} bold={item.bold}>
              {item.value}
            </DetailValue>
          )}
        </DetailItem>
      );
    })}
  </DetailContainer>
);
};

  const getTitle = () => {
    if (leave) return 'Leave Details';
    if (claim) return 'Claim Details';
    if (helpRequest) return 'Request Details';
    return '';
  };

  const getActionButton = () => {
    if (!showCancelButton) {
      return (
        <ActionButton onPress={onClose}>
          <ActionButtonText>CLOSE</ActionButtonText>
        </ActionButton>
      );
    }

    const buttonConfig = leave
      ? { text: 'CANCEL LEAVE', action: () => { onCancelLeave(leave); onClose(); } }
      : { text: 'DELETE CLAIM ITEM', action: () => { onCancelLeave(claim); onClose(); } };

    return (
      <ActionButton onPress={buttonConfig.action} danger>
        <ActionButtonText>{buttonConfig.text}</ActionButtonText>
      </ActionButton>
    );
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade">
      <ModalOverlay>
        <ModalContainer>
          <ModalHeader>
            <ModalTitle>{getTitle()}</ModalTitle>
            <CloseButton onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#6B7280" />
            </CloseButton>
          </ModalHeader>

          <ModalBody>
            {renderDetails()}
          </ModalBody>

          <ModalFooter>
            {getActionButton()}
          </ModalFooter>
        </ModalContainer>
      </ModalOverlay>
    </Modal>
  );
};

const CurrencyValue = styled.Text`
  font-size: 14px;
  color: #111827;
  font-weight: ${props => props.bold ? '600' : '400'};
  flex: 1;
  text-align: right;
  padding-left: 8px;
  line-height: 20px;
  font-family: monospace; /* Makes currency numbers align better */
`;

const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  padding: 24px;
`;

const ModalContainer = styled.View`
  background-color: white;
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  overflow: hidden;
  elevation: 4;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 10px;
`;

const ModalHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom-width: 1px;
  border-bottom-color: #E5E7EB;
  background-color: #F9FAFB;
`;

const ModalTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
`;

const CloseButton = styled.TouchableOpacity`
  padding: 4px;
  border-radius: 20px;
  background-color: #F3F4F6;
`;

const ModalBody = styled.View`
  padding: 20px;
  max-height: 500px;
`;

const DetailContainer = styled.View`
  gap: 16px;
`;

const DetailItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding-vertical: 4px;
`;

const DetailLabel = styled.Text`
  font-size: 14px;
  color: #4B5563;
  font-weight: ${props => props.bold ? '600' : '500'};
  flex: 1;
  padding-right: 8px;
  margin-bottom: 2px;
  letter-spacing: 0.2px;
`;

const DetailValue = styled.Text`
  font-size: 14px;
  color: ${props => props.status === 'approved' ? '#2E7D32' : 
                   props.status === 'submitted' ? '#0D47A1' : 
                   props.status === 'cancelled' ? '#C62828' : 
                   props.status === 'rejected' ? '#EF4444' : 
                   props.status === 'pending' ? '#F59E0B' : '#111827'};
  font-weight: ${props => props.bold ? '600' : '400'};
  flex: 1;
  text-align: right;
  padding-left: 8px;
  line-height: 20px;
`;

const ClaimIDValue = styled.Text`
  font-size: 14px;
  color: #111827;
  text-align: right;
  border-radius: 4px;
  overflow: hidden;
  line-height: 20px;
  min-width: 60%;
  margin-left: auto;
  text-align: right;
`;

const ModalFooter = styled.View`
  padding: 16px 20px;
  border-top-width: 1px;
  border-top-color: #E5E7EB;
  flex-direction: row;
  justify-content: flex-end;
  background-color: #F9FAFB;
`;

const ActionButton = styled.TouchableOpacity`
  padding: 12px 24px;
  border-radius: 8px;
  background-color: ${props => props.danger ? '#EF4444' : colors.primary};
  margin-left: 12px;
  min-width: 120px;
  align-items: center;
  justify-content: center;
`;

const ActionButtonText = styled.Text`
  color: white;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
`;

export default ModalComponent;