import React, { useContext, useEffect, useState } from 'react';
import { Text, Modal } from 'react-native';
import styled from 'styled-components/native';
import { postEmpLeave } from '../services/productServices';
import RemarksInput from '../components/RemarkInput'; // Import your custom RemarksInput component
import { AppContext } from '../../context/AppContext';

// Styled Components
const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.View`
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  width: 80%;
  align-items: center;
  border-width: 1px;
  border-color: #000;
`;

const Header = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const TitleText = styled.Text`
  font-size: 18px;
  font-weight: bold;
`;

const CloseButton = styled.TouchableOpacity`
  padding: 5px;
  border-radius: 50px;
`;

const LabelText = styled.Text`
  font-size: 16px;
  margin-bottom: 10px;
  align-self: flex-start;
`;

const InputField = styled.View`
  background-color: #d3d3d3;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;
  width: 100%;
  align-items: center;
`;

const DateText = styled.Text`
  font-size: 16px;
  color: black;
`;

const ActionButton = styled.TouchableOpacity`
  background-color: ${(props) => (props.actionType === 'REJECT' || props.actionType === 'CANCEL' ? 'red' : 'green')};
  padding: 10px;
  border-radius: 8px;
  margin-top: 10px;
  width: 100%;
  align-items: center;
`;

const ButtonText = styled.Text`
  color: white;
  font-size: 16px;
`;

const LeaveActionModal = ({ isVisible, leave, onClose, actionType, setShowSuccessModal, setSuccessMessage }) => {
  const { profile } = useContext(AppContext);
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState(null);
  const [empId, setEmpId] = useState('');

  useEffect(() => {
    setEmpId(profile?.id)
  }, [empId]);

  const actionMessages = {
    APPROVE: 'Leave approved successfully',
    CANCEL: 'Leave canceled successfully',
    REJECT: 'Leave rejected successfully',
  };


  const handleAction = () => {
    if (!remarks.trim()) {
      setError('Remarks are required.');
      return;
    }

    const leavePayload = {
      emp_id: `${empId}`,
      from_date: leave.from_date,
      to_date: leave.to_date,
      remarks,
      leave_type: leave.leave_type,
      call_mode: actionType,
      leave_id: `${leave.id}`,
      hrm_lite: ''
    };


    postEmpLeave(leavePayload)
      .then(() => {
        setSuccessMessage(actionMessages[actionType]); // Set success message based on action
        setRemarks('');
        setError(null);
        // setSuccessMessage(actionMessages[actionType]); // Set success message based on action
        setShowSuccessModal(true); // Show SuccessModal after success
        onClose(); // Close the action modal
      })
      .catch((error) => {
        setError(`Failed to ${actionType.toLowerCase()} leave: ${error.message}`);
      });
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
      <ModalContainer>
        <ModalContent>
          <Header>
            <TitleText>{actionType} LEAVE - {leave?.emp_data?.emp_id}</TitleText>
            <CloseButton onPress={onClose}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>X</Text>
            </CloseButton>
          </Header>

          <LabelText>Leave: {leave?.leave_type_display}</LabelText>
          <InputField disabled>
            <DateText>{leave?.from_date}</DateText>
          </InputField>
          <InputField disabled>
            <DateText>{leave?.to_date}</DateText>
          </InputField>
          <RemarksInput remark={remarks} setRemark={setRemarks} error={error} />

          <ActionButton actionType={actionType} onPress={handleAction}>
            <ButtonText>{actionType}</ButtonText>
          </ActionButton>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};

export default LeaveActionModal;
