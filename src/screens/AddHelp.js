import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, Keyboard, Alert, Image } from 'react-native';
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

const AddHelp = (props) => {
  const itemdata = JSON.parse(props?.data?.item || '{}');
  const [empId, setEmpId] = useState("");
  const [requestText, setRequestText] = useState(itemdata?.request_text || "");
  const [remark, setRemark] = useState(itemdata?.remarks || "");
  const [fileName, setFileName] = useState(itemdata?.submitted_file_1 ? 'Current file' : '');
  const [fileUri, setFileUri] = useState(itemdata?.submitted_file_1 || '');
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
  const call_type = props.data.call_type;
  const is_shift_request = props.data.shift_request;
  
  // Check if we're in update mode
  const isUpdateMode = Boolean(
    (props?.data?.headerTitle === "Update Request" || props?.data?.headerTitle === "Update Help") && itemdata.request_id
  );
  
  // Dynamic header title
  const headerTitle = is_shift_request 
    ? 'Change Shift Request' 
    : props?.data?.headerTitle 
      ? props?.data?.headerTitle 
      : call_type === 'H' 
        ? 'Add Help Request' 
        : 'Add General Request';

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
        
        if (is_shift_request) {
          const shiftCategory = filtered.find(category => 
            category.name.includes('HR Requests') || 
            category.name.includes('Workforce Management')
          );
          if (shiftCategory) {
            setSelectedCategory(shiftCategory.id.toString());
          }
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleBackPress = () => {
    router.setParams({ empId });
    router.back();
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

    // Don't require file for update mode (since we might keep the existing one)
    if (!isUpdateMode && !fileUri) {
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
    formData.append('call_mode', isUpdateMode ? "UPDATE" : "ADD");
    formData.append('request_type', itemdata.request_type || call_type);
    formData.append('request_id', isUpdateMode ? `${itemdata.id}` : '0');
    formData.append('request_text', requestText);
    formData.append('remarks', remark);
    
    // Only append file if a new one was selected
    if (fileUri && (!isUpdateMode || fileUri !== itemdata.submitted_file_1)) {
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
        Alert.alert(
          'Request Error', 
          `Failed to submit request. Status: ${res.status}`
        );
      }
    } catch (error) {
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
  
  useEffect(() => {
    if (itemdata.request_sub_type) {
      const matchedCategory = filteredCategories.find(
        (category) => category.name == itemdata.request_sub_type
      );
      if (matchedCategory) {
        setSelectedCategory(matchedCategory.id.toString());
      }
    }
  }, [filteredCategories]);

  // Show current file in update mode
  const renderCurrentFile = () => {
    if (isUpdateMode && itemdata.submitted_file_1) {
      return (
        <View style={{ marginVertical: 10 }}>
          <Text style={{ marginBottom: 5 }}>Current File:</Text>
          <Image 
            source={{ uri: itemdata.submitted_file_1 }} 
            style={{
              width: 120,
              height: 120,
              borderRadius: 12,
              resizeMode: "cover",
              borderWidth: 1,
              borderColor: "#eee"
            }}
          />
        </View>
      );
    }
    return null;
  };
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HeaderComponent 
        headerTitle={headerTitle} 
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
            setValue={isUpdateMode ? () => {} : setSelectedCategory}
            error={errors.category}
            disabled={is_shift_request || isUpdateMode} // Disable in shift request or update mode
          />

          <RequestTextInput
            label={is_shift_request ? "Shift Change Details" : call_type === 'H' ? "Help Details" : "Request Details"}
            value={requestText}
            onChangeText={setRequestText}
            placeholder={is_shift_request 
              ? "Describe your shift change request in detail..."
              : call_type === 'H' 
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

          {renderCurrentFile()}

          <FilePicker 
            label={isUpdateMode ? "Update Supporting Document (Optional)" : "Attach Supporting Document"}
            fileName={fileName}
            setFileName={setFileName}
            fileUri={fileUri}
            setFileUri={setFileUri}
            setFileMimeType={setFileMimeType}
            error={errors.file}
          />

          <SubmitButton
            label={isUpdateMode 
              ? "Update Request" 
              : is_shift_request 
                ? "Submit Shift Request" 
                : call_type === 'H' 
                  ? "Submit Help Request" 
                  : "Submit Request"}
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
        message={isUpdateMode
          ? "Request updated successfully!"
          : is_shift_request 
            ? "Shift request submitted successfully!" 
            : call_type === 'H' 
              ? "Help request submitted successfully!" 
              : "Request submitted successfully!"}
      />
    </SafeAreaView>
  );
};

export default AddHelp;