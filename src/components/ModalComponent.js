import React from 'react';
import { Modal } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../Styles/appStyle';

const ModalComponent = ({ isVisible, leave, claim, helpRequest, onClose, onCancelLeave, showCancelButton  }) => {
  return (
    <Modal visible={isVisible} transparent={true} animationType="fade">
      <ModalOverlay>
        <ModalContainer>
          <ModalHeader>
            <ModalTitle>
              {leave ? 'Leave Details' : 
               claim ? 'Claim Details' : 
               helpRequest ? 'Request Details' : ''}
            </ModalTitle>
            <CloseButton onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#6B7280" />
            </CloseButton>
          </ModalHeader>

          <ModalBody>
            {leave && (
              <DetailContainer>
                <DetailItem>
                  <DetailLabel bold>Leave Type</DetailLabel>
                  <DetailValue bold>{leave.leave_type_display}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Duration</DetailLabel>
                  <DetailValue>
                    {leave.from_date} to {leave.to_date} ({leave.no_leave_count} days)
                  </DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Status</DetailLabel>
                  <DetailValue status={leave.status_display?.toLowerCase()}>

                    {leave.status_display}
                  </DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Submitted:</DetailLabel>
                  <DetailValue>
                    {leave.submit_date}
                  </DetailValue>
                </DetailItem>
                {leave.remarks && (
                  <DetailItem>
                    <DetailLabel>Remarks</DetailLabel>
                    <DetailValue>{leave.remarks}</DetailValue>
                  </DetailItem>
                )}
              </DetailContainer>
            )}

            {claim && (
              <DetailContainer>
                <DetailItem>
                  <DetailLabel bold>Claim ID</DetailLabel>
                  <DetailValue bold>{claim.claim_id}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel bold>Amount</DetailLabel>
                  <DetailValue bold>₹{claim.expense_amt}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Submitted</DetailLabel>
                  <DetailValue>{claim.submitted_date}</DetailValue>
                </DetailItem>
                {claim.expense_date && (
                  <DetailItem>
                    <DetailLabel>Expense Date</DetailLabel>
                    <DetailValue>{claim.expense_date}</DetailValue>
                  </DetailItem>
                )}
                
                {claim.project_name && (
                  <DetailItem>
                    <DetailLabel>Project</DetailLabel>
                    <DetailValue>{claim.project_name}</DetailValue>
                  </DetailItem>
                )}
                {claim.item_name && (
                  <DetailItem>
                    <DetailLabel>Item Name</DetailLabel>
                    <DetailValue>{claim.item_name}</DetailValue>
                  </DetailItem>
                )}
                {claim.remarks && (
                  <DetailItem>
                    <DetailLabel>Remarks</DetailLabel>
                    <DetailValue>{claim.remarks}</DetailValue>
                  </DetailItem>
                )}
                {claim.approval_remarks && (
                  <DetailItem>
                    <DetailLabel>Manager Remarks</DetailLabel>
                    <DetailValue>{claim.approval_remarks}</DetailValue>
                  </DetailItem>
                )}
                
              </DetailContainer>
            )}

            {helpRequest && (
              <DetailContainer>
                <DetailItem>
                  <DetailLabel>Request ID</DetailLabel>
                  <DetailValue bold>{helpRequest.request_id}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Category</DetailLabel>
                  <DetailValue>{helpRequest.request_sub_type}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Date</DetailLabel>
                  <DetailValue>{helpRequest.created_date}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Status</DetailLabel>
                  <DetailValue status={helpRequest.status_display.toLowerCase()}>
                    {helpRequest.status_display}
                  </DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Request Details</DetailLabel>
                  <DetailValue>{helpRequest.request_text}</DetailValue>
                </DetailItem>
                {helpRequest.remarks && (
                  <DetailItem>
                    <DetailLabel>Remarks</DetailLabel>
                    <DetailValue>{helpRequest.remarks}</DetailValue>
                  </DetailItem>
                )}
              </DetailContainer>
            )}
          </ModalBody>

          <ModalFooter>
            {leave && showCancelButton ? (
              <ActionButton 
                onPress={() => {
                  onCancelLeave(leave);
                  onClose();
                }}
                style={{ backgroundColor: '#EF4444' }}
              >
                <ActionButtonText>CANCEL</ActionButtonText>
              </ActionButton>
            ) : (
              <ActionButton onPress={onClose}>
                <ActionButtonText>Close</ActionButtonText>
              </ActionButton>
            )}
          </ModalFooter>
        </ModalContainer>
      </ModalOverlay>
    </Modal>
  );
};

// Styled Components (same as before)
const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const ModalContainer = styled.View`
  background-color: white;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  overflow: hidden;
`;

const ModalHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom-width: 1px;
  border-bottom-color: #F3F4F6;
`;

const ModalTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
`;

const CloseButton = styled.TouchableOpacity`
  padding: 4px;
`;

const ModalBody = styled.View`
  padding: 16px;
`;

const DetailContainer = styled.View`
  gap: 12px;
`;

const DetailItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const DetailLabel = styled.Text`
  font-size: 14px;
  color: #454545;
  font-weight: ${props => props.bold ? '600' : '400'};
  flex: 1;
`;

const DetailValue = styled.Text`
  font-size: 14px;
  color: ${props => props.status === 'approved' ? '#10B981' : 
                   props.status === 'rejected' ? '#EF4444' : 
                   props.status === 'pending' ? '#F59E0B' : '#111827'};
  font-weight: ${props => props.bold ? '600' : '400'};
  flex: 1;
  text-align: right;
`;

const ModalFooter = styled.View`
  padding: 16px;
  border-top-width: 1px;
  border-top-color: #F3F4F6;
  align-items: flex-end;
`;

const ActionButton = styled.TouchableOpacity`
  background-color: ${colors.primary};
  padding: 10px 20px;
  border-radius: 6px;
`;

const ActionButtonText = styled.Text`
  color: white;
  font-weight: 500;
  font-size: 14px;
`;

export default ModalComponent;