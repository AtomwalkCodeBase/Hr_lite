import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Keyboard, SafeAreaView, Alert } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { getExpenseItem, getExpenseProjectList, postClaim } from '../services/productServices';
import HeaderComponent from '../components/HeaderComponent';
import DropdownPicker from '../components/DropdownPicker';
import AmountInput from '../components/AmountInput';
import DatePicker from '../components/DatePicker';
import FilePicker from '../components/FilePicker';
import RemarksTextArea from '../components/RemarkInput';
import SubmitButton from '../components/SubmitButton';
import SuccessModal from '../components/SuccessModal'; // Import SuccessModal component
import Loader from '../components/old_components/Loader'; // Import Loader component
import styled from 'styled-components/native';
import { colors } from '../Styles/appStyle';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Container = styled.ScrollView`
  flex: 1;
  padding: 10px;
  background-color: #fff;
  height: 100%;
`;

const AddClaim = () => {
  const [claimAmount, setClaimAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileUri, setFileUri] = useState('');
  const [fileMimeType, setFileMimeType] = useState('');
  const [claimItem, setClaimItem] = useState([]);
  const [empId, setEmpId] = useState('');
  const [projectList, setProjectList] = useState([]);
  const [item, setItem] = useState('');
  const [project, setProject] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [errors, setErrors] = useState({});
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State for Loader visibility
  const navigation = useNavigation();
  const router = useRouter();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    fetchClaimItemList();
    fetchProjectList();
    fetchEmpId();
  }, []);


  const fetchClaimItemList = async () => {
    setIsLoading(true); // Show loader while fetching data
    try {
      const response = await getExpenseItem();
      const formattedData = response.data.map(item => ({
        label: item.name, // use `name` as the label
        value: item.id    // use `id` as the value
      }));
      setClaimItem(formattedData);
    } catch (error) {
      console.error("Error fetching expense items:", error);
    } finally {
      setIsLoading(false); // Hide loader when data is fetched
    }
  };

  const fetchProjectList = async () => {
    setIsLoading(true); // Show loader while fetching data
    try {
      const response = await getExpenseProjectList();
      const formattedData = response.data.map(project => ({
        label: project.title, // use `title` as the label
        value: project.id     // use `id` as the value
      }));
      setProjectList(formattedData);
    } catch (error) {
      console.error("Error fetching project list:", error);
    } finally {
      setIsLoading(false); // Hide loader when data is fetched
    }
  };

  const fetchEmpId = async () => {
    try {
      const id = await AsyncStorage.getItem('empId');
      setEmpId(id);
    } catch (error) {
      console.error("Error fetching employee ID:", error);
    }
  };

  // console.log("Emp id===+",empId)


  const handleBackPress = () => {
    router.push('ClaimScreen');
  };

  const handleError = (error, input) => {
    setErrors(prevState => ({ ...prevState, [input]: error }));
  };

  const validate = () => {
    Keyboard.dismiss();
    let isValid = true;

    if (!item) {
      handleError('Please select an Expense Item', 'item');
      isValid = false;
    }

    if (!expenseDate) {
      handleError('Please select the date', 'expenseDate');
      isValid = false;
    }

    if (!remark) {
      handleError('Please fill the remark field', 'remarks');
      isValid = false;
    }

    if (!claimAmount) {
      handleError('Please enter the claim amount', 'claimAmount');
      isValid = false;
    }

    if (!fileUri) {
      handleError('Please select a file', 'file');
      isValid = false;
    }

    if (isValid) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true); // Show loader during submission
    const expense_date = `${expenseDate.getDate().toString().padStart(2, '0')}-${(expenseDate.getMonth() + 1).toString().padStart(2, '0')}-${expenseDate.getFullYear()}`;

    const formData = new FormData();
    formData.append('file_1', {
      uri: fileUri,
      name: fileName,
      type: fileMimeType,
    });
    formData.append('remarks', remark);
    formData.append('item', item);
    formData.append('quantity', '1');
    formData.append('expense_amt', claimAmount);
    formData.append('expense_date', expense_date);
    formData.append('emp_id', empId);

    if (project) {
      formData.append('project', project);
    }

    try {
      const res = await postClaim(formData);
      // console.log("Claim Res OUT---",res)
      if (res.status === 200) {
        // console.log("Claim Res---",res)
        setIsSuccessModalVisible(true); // Show success modal on successful submission
      } else {
        console.error('Unexpected response:', res);
        Alert.alert('Claim Submission Error', 'Failed to claim. Unexpected response.');
      }
    } catch (error) {
      Alert.alert('Claim Submission Failed', `Failed to claim: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsLoading(false); // Hide loader after submission
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HeaderComponent headerTitle="Add Claim" onBackPress={handleBackPress} />
      {isLoading ? (
        // <Loader visible={isLoading}/> // Show Loader while loading
        <Loader
          visible={isLoading}
          onTimeout={() => {
            setIsLoading(false); // Hide loader
            Alert.alert('Timeout', 'Not able to add the Claim.');
          }}
        />
      ) : (
        <Container>
          <DropdownPicker
            label="Expense Item"
            data={claimItem}
            value={item}
            setValue={setItem}
            error={errors.item}
          />
          <DropdownPicker
            label="Project"
            data={projectList}
            value={project}
            setValue={setProject}
          />
          <DatePicker 
            cDate={expenseDate} 
            label="Expense Date" 
            setCDate={setExpenseDate}
            error={errors.expenseDate}
          />
          <AmountInput 
            claimAmount={claimAmount} 
            label="Expense Amount" 
            setClaimAmount={setClaimAmount}
            error={errors.claimAmount}
          />
          <FilePicker 
            label="Attach File"
            fileName={fileName}
            setFileName={setFileName}
            setFileUri={setFileUri}
            setFileMimeType={setFileMimeType}
            error={errors.file}
          />
          <RemarksTextArea 
            remark={remark} 
            setRemark={setRemark}
            error={errors.remarks}
          />
          <SubmitButton
            label="Submit Claim"
            onPress={validate}
            bgColor={colors.primary}
            textColor="white"
          />
        </Container>
      )}
      
      {/* Success Modal */}
      <SuccessModal 
        visible={isSuccessModalVisible} 
        onClose={() => {
          setIsSuccessModalVisible(false); // Hide modal on close
          router.push('ClaimScreen'); // Navigate back to ClaimScreen
        }} 
      />
    </SafeAreaView>
  );
};

export default AddClaim;
