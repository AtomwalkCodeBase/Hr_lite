import React from 'react';
import { Image, Modal } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../Styles/appStyle';

const ModalComponent = ({ isVisible, leave, claim, helpRequest, onClose, onCancelLeave, showCancelButton }) => {
  const renderDetails = () => {
  const data = leave || claim || helpRequest;
  const type = leave ? 'leave' : claim ? 'claim' : helpRequest ? 'helpRequest' : null;

  if (!data || !type) return null; // 👈 Prevents crashes when no valid data

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
        status: getStatusValue(data.status_display) 
      },
      { label: 'Submitted', value: data.submit_date },
      { label: 'Remarks', value: data.remarks, condition: data.remarks }
    ],
    claim: [
      { label: 'Item Name', value: data.item_name, bold: true, condition: data.item_name },
      { label: 'Amount', value: `₹${data.expense_amt}`, bold: true },
      { label: 'Claim ID', value: data.claim_id, noWrap: true },
      { label: 'Submitted', value: data.submitted_date },
      { label: 'Expense Date', value: data.expense_date, condition: data.expense_date },
      { label: 'Project', value: data.project_name, condition: data.project_name },
      { label: 'Remarks', value: data.remarks, condition: data.remarks },
      { 
        label: 'Manager Remarks', 
        value: data.approval_remarks, 
        condition: data.approval_remarks 
      }
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
      { label: 'Remarks', value: data.remarks, condition: data.remarks },
      { label: 'Image', value: data.submitted_file_1, type: "image" },
    ]
  };

return (
  <DetailContainer>
    {detailConfigs[type].map((item, index) => (
      item.condition !== false && (
        <DetailItem key={index}>
          <DetailLabel bold={item.bold}>{item.label}:</DetailLabel>
          {item.type === "image" && item.value ? (
            <Image
              source={{ uri: item.value }}
              style={{ width: 120, height: 120, borderRadius: 12, resizeMode: "cover", borderWidth: 1, borderColor: "#eee", marginLeft: 8}}
            />
          ) : item.noWrap ? (
            <ClaimIDValue>{item.value}</ClaimIDValue>
          ) : (
            <DetailValue status={item.status} bold={item.bold}>
              {item.value}
            </DetailValue>
          )}
        </DetailItem>
      )
    ))}
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
  color: ${props => props.status === 'approved' ? '#10B981' : 
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
  min-width: 60%;  /* Increased minimum width */
  margin-left: auto; /* Push to right side */
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