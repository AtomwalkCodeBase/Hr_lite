import React, { useState, useCallback, useLayoutEffect, useEffect, useContext } from 'react';
import { Keyboard, SafeAreaView, Alert } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { postEmpLeave } from '../services/productServices';
import DatePicker from '../components/DatePicker';
import RemarksTextArea from '../components/RemarkInput';
import SubmitButton from '../components/SubmitButton';
import SuccessModal from '../components/SuccessModal'; // Import the SuccessModal component
import Loader from '../components/old_components/Loader'; // Import the Loader component
import styled from 'styled-components/native';
import { colors } from '../Styles/appStyle';
import HeaderComponent from '../components/HeaderComponent';
import { AppContext } from '../../context/AppContext';

const Container = styled.ScrollView`
  flex: 1;
  padding: 10px;
  background-color: #fff;
  height: 100%;
`;

const ApplyLeave = (props) => {
  const { profile } = useContext(AppContext);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [remarks, setRemarks] = useState('');
  const [numOfDays, setNumOfDays] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false); // Error modal visibility state
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // State to control Loader visibility
  const call_mode = 'ADD';

  const navigation = useNavigation();
  const router = useRouter();


  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleBackPress = () => {
    router.push('leave');
  };


  const handleError = (error, input) => {
    setErrors((prevState) => ({ ...prevState, [input]: error }));
  };

  const validate = (res) => {
    Keyboard.dismiss();
    let isValid = true;
    let isEL = res === 'EL';
    let isLP = res === 'LP';
    let isWH = res === 'WH';
    let isHL = res === 'HL'; // Add this line for Half Day leave type
  
    if (!fromDate) {
      handleError('Please select From Date', 'fromDate');
      isValid = false;
    }
  
    if (!toDate) {
      handleError('Please select To Date', 'toDate');
      isValid = false;
    } else if (toDate < fromDate) {
      handleError("'To Date' should not be earlier than 'From Date.'", 'toDate');
      isValid = false;
    } else if (isHL && fromDate.toDateString() !== toDate.toDateString()) {
      // Add this condition for Half Day leave
      handleError("For Half Day leave, 'From Date' and 'To Date' must be the same.", 'toDate');
      isValid = false;
    }
  
    if (!remarks) {
      handleError('Please fill the Remark field', 'remarks');
      isValid = false;
    }
  
    if (isValid) {
      addLeave(res);
    }
  };
  

  const addLeave = (res) => {
    setIsLoading(true); // Show loader before submission
    const leavePayload = {
      emp_id: `${props.id || profile?.id}`,
      from_date: `${fromDate.getDate().toString().padStart(2, '0')}-${(fromDate.getMonth() + 1).toString().padStart(2, '0')}-${fromDate.getFullYear()}`,
      to_date: `${toDate.getDate().toString().padStart(2, '0')}-${(toDate.getMonth() + 1).toString().padStart(2, '0')}-${toDate.getFullYear()}`,
      remarks,
      leave_type: res,
      call_mode,
    };

    postEmpLeave(leavePayload)
      .then(() => {
        setIsLoading(false);
        setIsSuccessModalVisible(true);
      })
      .catch((error) => {
        setIsLoading(false); // Hide loader on error
        Alert.alert(
          'Leave Application Failed',
          'Please verify the selected dates. Either the dates are already approved or fall on a holiday.'
        );
      });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HeaderComponent headerTitle="Apply Leave" onBackPress={handleBackPress} />
      <Container>
        <DatePicker 
          label="From Date" 
          cDate={fromDate} 
          setCDate={setFromDate} 
          error={errors.fromDate} 
        />
        <DatePicker 
          label="To Date" 
          cDate={toDate} 
          setCDate={setToDate} 
          error={errors.toDate} 
        />
        <RemarksTextArea 
          remark={remarks} 
          setRemark={setRemarks}
          error={errors.remarks} 
        />
        <SubmitButton
          label="Apply Leave (EL)"
          onPress={() => { validate('EL'); }}
          bgColor={colors.primary}
          textColor="white"
        />
        <SubmitButton
          label="Apply WFH"
          onPress={() => { validate('WH'); }}
          bgColor={colors.yellow}
          textColor="black"
        />
        <SubmitButton
        label="Apply Half Day"
        onPress={() => { validate('HL'); }}
        bgColor={colors.yellow}
        textColor="black"
      />
        <SubmitButton
          label="Apply LOP"
          onPress={() => { validate('LP'); }}
          bgColor={colors.red}
          textColor="white"
        />
        
      </Container>

      {/* Loader */}
      <Loader visible={isLoading} />

      {/* Success Modal */}
      <SuccessModal 
        visible={isSuccessModalVisible} 
        onClose={() => {
          setIsSuccessModalVisible(false); // Hide modal on close
          router.push('leave'); // Navigate back to leave page
        }} 
      />
    </SafeAreaView>
  );
};

export default ApplyLeave;
