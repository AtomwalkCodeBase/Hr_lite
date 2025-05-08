import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import Logos from '../../assets/images/Atom_walk_logo.jpg';
import { useRouter } from 'expo-router';
import { empLoginURL } from '../../src/services/ConstantServies';
import { getCompanyInfo, getDBListInfo } from '../../src/services/authServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { publicAxiosRequest } from '../../src/services/HttpMethod';
import DropdownPicker from '../../src/components/DropdownPicker';
import CompanyDropdown from '../../src/components/ComanyDropDown';
import { AppContext } from '../../context/AppContext';

const LoginScreen = () => {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState('');
  const [pin, setPin] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userPin, setUserPin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [companyError, setCompanyError] = useState('');
  const [dbList, setDbList] = useState([]); // Initialize as empty array instead of false
const [selectedCompany, setSelectedCompany] = useState(null);
const { setDropdownValue } = useContext(AppContext);
const [dbnameval,setDbnameval] = useState(""); // Initialize as null


  useEffect(() => {
    const fetchUserPin = async () => {
      try {
        const storedPin = await AsyncStorage.getItem('userPin');
        setUserPin(storedPin); // storedPin will be `null` if no value is found
      } catch (error) {
        console.error('Error fetching userPin from AsyncStorage:', error);
      }
    };
    fetchUserPin();
  }, []);

  useEffect(()=>{
    fetchDbName();
  },[])

  // useEffect(() => {
  //   if (selectedCompany && !dropdownValue) {
  //     setDropdownValue({
  //       label: selectedCompany.ref_cust_name,
  //       value: selectedCompany.ref_cust_name
  //     });
  //   }
  // }, [selectedCompany, dropdownValue]);

  useEffect(() => {
    if (selectedCompany && dbList.length > 0) {
      const company = dbList.find(c => c.ref_cust_name === selectedCompany.ref_cust_name);
      if (company) {
        const dbName = company.name.replace('SD_', '');
        AsyncStorage.setItem('dbName', dbName);
      }
    }
  }, [selectedCompany, dbList]);

  const fetchDbName = async () => {
    try {
      const DBData = await getDBListInfo();
      setDbList(DBData.data || []);
      
      if (DBData.data?.length === 1) {
        const company = DBData.data[0];
        setSelectedCompany({
          label: company.ref_cust_name,
          value: company.ref_cust_name
        });
      }
    } catch (error) {
      console.error('Error fetching DB List:', error);
    }
  };

  const handleCompanyChange = async (item) => {
    if (item) {
      setSelectedCompany(item);
      const selected = dbList.find(company => company.ref_cust_name === item.value);
      if (selected) {
        const dbName = selected.name.replace('SD_', '');
        await AsyncStorage.setItem('dbName', dbName);
        setDropdownValue(dbName);
        setDbnameval(dbName); // Set the dbnameval state
      }
    }
    setCompanyError(''); // Clear error when company is selected
  };

  const getDropdownValue = () => {
    if (!selectedCompany) return null;
    return {
      label: selectedCompany.ref_cust_name,
      value: selectedCompany.ref_cust_name
    };
  };

  
  


  const validateInput = () => {
    if (!selectedCompany) {
      setCompanyError('Please select your company');
      return false;
    }
    if (!mobileNumber) {
      setErrorMessage('Mobile number is required');
      return false;
    }
    if (!/^\d{10}$/.test(mobileNumber)) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return false;
    }
    if (!pin) {
      setErrorMessage('PIN is required');
      return false;
    }
    if (pin.length < 4) {
      setErrorMessage('PIN must be at least 4 characters long');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handlePressPassword = () => {
    router.push({ pathname: 'PinScreen' });
  };

  const handlePress = async () => {
    if (!validateInput()) {
      return;
    }

    setLoading(true); // Start loading

    try {
      const payload = {
        mobile_number: mobileNumber,
        pin: parseInt(pin, 10), // Convert pin to an integer
      };
      console.log('Sending payload:', payload);

      const response = await publicAxiosRequest.post(empLoginURL+`${dbnameval}/`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('API Response:', response);

      if (response.status === 200) {
        const { token, emp_id, e_id } = response.data;     
        // Store token and emp_id in AsyncStorage
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('mobileNumber', mobileNumber);
        await AsyncStorage.setItem('empId', emp_id);
        await AsyncStorage.setItem('empNoId', String(e_id));
        await AsyncStorage.setItem('userPin', pin);
  
        try {
          const companyInfoResponse = await getCompanyInfo();
          const companyInfo = companyInfoResponse.data;
          await AsyncStorage.setItem('companyInfo', JSON.stringify(companyInfo));
          // const dbName = companyInfo.db_name.substr(3);
          // await AsyncStorage.setItem('dbName', dbName);
          console.log('Company info stored:', companyInfo);
        } catch (error) {
          console.error('Error fetching company info:', error.message);
        }
        router.push('/home');
      } else {
        setErrorMessage('Invalid mobile number or PIN');
      }
    } catch (error) {
      console.error('API call error:', error.response.data);
      if (error.response) {
        setErrorMessage(`Error: ${error.response.data.error || 'Invalid mobile number or PIN'}`);
      } else if (error.request) {
        setErrorMessage('No response from the server. Please check your connection.');
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <Container>
      {/* Logo Section */}
      <LogoContainer>
        <Logo source={Logos} resizeMode="contain" />
      </LogoContainer>

      {/* Login Text */}
      <Title>Log In</Title>
      <Subtitle>Enter Your Mobile Number/Emp ID and PIN</Subtitle>

      {/* Input Fields Section */}
      <InputContainer>
      
      {dbList.length > 0 && (
  <CompanyDropdown
    label="Company"
    data={dbList.map(company => ({
      label: company.ref_cust_name,
      value: company.ref_cust_name
    }))}
    value={selectedCompany}
    setValue={handleCompanyChange}
    error={companyError}
  />
)}
        <InputWrapper>
          <MaterialIcons name="phone" size={20} color="#6c757d" />
          <Input
            placeholder="Enter your mobile number/ Emp Id"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            keyboardType="phone-pad"
            placeholderTextColor="#6c757d"
            maxLength={10}
          />
        </InputWrapper>

        <InputWrapper>
          <MaterialIcons name="lock-outline" size={20} color="#6c757d" />
          <Input
            placeholder="Enter your PIN"
            value={pin}
            onChangeText={setPin}
            secureTextEntry={!isPasswordVisible}
            keyboardType="numeric"
            placeholderTextColor="#6c757d"
            maxLength={4}
          />
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <MaterialIcons
              name={isPasswordVisible ? 'visibility' : 'visibility-off'}
              size={20}
              color="#6c757d"
            />
          </TouchableOpacity>
        </InputWrapper>

        {/* Error Message */}
        {errorMessage ? <ErrorText>{errorMessage}</ErrorText> : null}
      </InputContainer>

      {/* Sign In Button */}
      <Button onPress={handlePress} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ButtonText>Sign In</ButtonText>
        )}
      </Button>

      {/* Forgot Password Text */}
      {userPin && (
        <ForgotPasswordText onPress={handlePressPassword}>
          Login With Your Pin
        </ForgotPasswordText>
      )}

      {/* Bottom Navigation */}
      <BottomNav>
        <FontAwesome name="sign-in" size={24} color="#e74c3c" />
        <NavText>Login</NavText>
      </BottomNav>
    </Container>
  );
};

// Styled Components
const Container = styled.View`
  flex: 1;
  background-color: #fff;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
`;

const LogoContainer = styled.View`
  margin-bottom: 30px;
`;

const Logo = styled.Image`
  width: 200px;
  height: 100px;
`;

const Title = styled.Text`
  font-size: 32px;
  font-weight: bold;
  color: #000;
  margin-bottom: 5px;
`;

const Subtitle = styled.Text`
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 20px;
`;

const ErrorText = styled.Text`
  color: red;
  font-size: 14px;
  margin-bottom: 10px;
  text-align: center;
`;

const InputContainer = styled.View`
  width: 100%;
`;

const InputWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: #f1f3f5;
  padding: 10px 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  border: 1px solid #dfe2e5;
`;

const Input = styled.TextInput`
  flex: 1;
  padding: 0 10px;
  color: #000;
`;

const Button = styled.TouchableOpacity`
  background-color: ${({ disabled }) => (disabled ? '#ccc' : '#0062cc')};
  padding: 15px;
  border-radius: 8px;
  align-items: center;
  width: 100%;
  margin-bottom: 15px;
`;

const ButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: bold;
`;

const ForgotPasswordText = styled.Text`
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 20px;
`;

const BottomNav = styled.View`
  flex-direction: row;
  align-items: center;
  position: absolute;
  bottom: 20px;
`;

const NavText = styled.Text`
  font-size: 14px;
  color: #e74c3c;
  margin-left: 5px;
`;

export default LoginScreen;