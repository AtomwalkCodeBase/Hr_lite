import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Keyboard, Alert } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { getRequestCategory, postEmpRequest } from '../services/productServices';
import HeaderComponent from '../components/HeaderComponent';
import DropdownPicker from '../components/DropdownPicker';
import FilePicker from '../components/FilePicker';
import RemarksTextArea from '../components/RemarkInput';
import SubmitButton from '../components/SubmitButton';
import SuccessModal from '../components/SuccessModal';
import Loader from '../components/old_components/Loader';
import styled from 'styled-components/native';
import { colors } from '../Styles/appStyle';
import RequestTextInput from '../components/RequestTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';

const Container = styled.ScrollView`
  flex: 1;
  padding: 10px;
  background-color: #fff;
  height: 100%;
`;

const UpdateHelp = (props) => {
  const  data  = useLocalSearchParams();
  const [empId, setEmpId] = useState("");
  const [requestText, setRequestText] = useState('');
  const [remark, setRemark] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileUri, setFileUri] = useState('');
  const [fileMimeType, setFileMimeType] = useState('');
  const [requestCategories, setRequestCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();
  const call_type = props.data.item;

  useEffect(() => {
    if (props?.data?.empId) {
      setEmpId(props.data.empId);
    }
  }, [props?.data?.empId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    fetchRequestCategory();
  }, []);

  const fetchRequestCategory = () => {
    setLoading(true);
    getRequestCategory()
      .then((res) => {
        setRequestCategories(res.data);
        const filtered = res.data.filter(category => category.request_type === call_type);
        setFilteredCategories(filtered);
      })
      .catch((err) => {
        console.error("Error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleBackPress = () => {
    router.push({
      pathname: call_type === 'H' ? 'HelpScr' : 'RequestScr',
      params: {
        empId,
      },
    });
  };

  const handleError = (error, input) => {
    setErrors(prevState => ({ ...prevState, [input]: error }));
  };

  const validate = () => {
    Keyboard.dismiss();
    let isValid = true;

    if (!selectedCategory) {
      handleError('Please select a category', 'category');
      isValid = false;
    }

    if (!requestText) {
      handleError('Please describe your request', 'requestText');
      isValid = false;
    }

    if (!remark) {
      handleError('Please fill the remark field', 'remarks');
      isValid = false;
    }

    if (!fileUri) {
      handleError('Please attach supporting document', 'file');
      isValid = false;
    }

    if (isValid) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('emp_id', empId);
    formData.append('request_category_id', selectedCategory);
    formData.append('call_mode', 'UPDATE');
    formData.append('request_type', call_type);
    formData.append('request_id', '0');
    formData.append('request_text', requestText);
    formData.append('remarks', remark);
    
    if (fileUri) {
      formData.append('uploaded_file', {
        uri: fileUri,
        name: fileName || 'supporting_document.jpg',
        type: fileMimeType || 'image/jpeg',
      });
    }

    try {
      const res = await postEmpRequest(formData);
      
      if (res.status === 200) {
        setIsSuccessModalVisible(true);
      } else {
        console.error('Unexpected response:', res);
        Alert.alert(
          'Request Error', 
          `Failed to submit request. Status: ${res.status}`
        );
      }
    } catch (error) {
      console.error('Submission error:', error);
      console.error('Error response:', error.response);
      
      Alert.alert(
        'Submission Failed', 
        error.response?.data?.message || 
        error.message || 
        'Failed to submit request'
      );
    } finally {
      setIsLoading(false);

    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HeaderComponent 
        headerTitle='Update' 
        onBackPress={handleBackPress} 
      />
      {isLoading ? (
        <Loader
          visible={isLoading}
          onTimeout={() => {
            setIsLoading(false);
            Alert.alert('Timeout', 'Not able to submit the request.');
          }}
        />
      ) : (
        <Container>
          <DropdownPicker
            label={call_type === 'H' ? "Help Category" : "Request Category"}
            data={filteredCategories.map(category => ({
              label: category.name,
              value: category.id.toString()
            }))}
            value={selectedCategory}
            setValue={setSelectedCategory}
            error={errors.category}
          />

          <RequestTextInput
            label={call_type === 'H' ? "Help Details" : "Request Details"}
            value={requestText}
            onChangeText={setRequestText}
            placeholder={call_type === 'H' 
              ? "Describe your help request in detail..." 
              : "Describe your request in detail..."}
            error={errors.requestText}
          />

          <RemarksTextArea 
            remark={remark} 
            setRemark={setRemark}
            placeholder="Additional remarks (optional)"
            error={errors.remarks}
          />

          <FilePicker 
            label="Attach Supporting Document"
            fileName={fileName}
            setFileName={setFileName}
            setFileUri={setFileUri}
            setFileMimeType={setFileMimeType}
            error={errors.file}
          />

          <SubmitButton
            label={call_type === 'H' ? "Submit Help Request" : "Submit Request"}
            onPress={validate}
            bgColor={colors.primary}
            textColor="white"
          />
        </Container>
      )}
      
      <SuccessModal 
        visible={isSuccessModalVisible} 
        onClose={() => {
          setIsSuccessModalVisible(false);
          handleBackPress();
        }} 
        message={call_type === 'H' 
          ? "Help request submitted successfully!" 
          : "Request submitted successfully!"}
      />
    </SafeAreaView>
  );
};

export default UpdateHelp;