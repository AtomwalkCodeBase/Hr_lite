import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { View, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Keyboard, StatusBar, SafeAreaView, 
  KeyboardAvoidingView, Platform, ScrollView, Dimensions, Image } from 'react-native';
import { FontAwesome, Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Logos from '../../assets/images/Atom_walk_logo.jpg';
import { useRouter } from 'expo-router';
import { empLoginURL } from '../../src/services/ConstantServies';
import { getCompanyInfo, getDBListInfo } from '../../src/services/authServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { publicAxiosRequest } from '../../src/services/HttpMethod';
import DropdownPicker from '../../src/components/DropdownPicker';
import CompanyDropdown from '../../src/components/ComanyDropDown';



const { width, height } = Dimensions.get('window');

// Responsive scaling functions
const scaleWidth = (size) => (width / 375) * size;
const scaleHeight = (size) => (height / 812) * size;


const LoginScreen = () => {
  const router = useRouter();
  const [mobileNumberOrEmpId, setMobileNumberOrEmpId] = useState('');
  const [dbName, setDBName] = useState('');
  const [username, setUsername] = useState('');
  const [profileName, setProfileName] = useState('');
  const [pin, setPin] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userPin, setUserPin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [companyError, setCompanyError] = useState('');
  const [keyboardStatus, setKeyboardStatus] = useState(false);
  const [dbList, setDbList] = useState([]);
  const isLoginDisabled = !mobileNumberOrEmpId || !pin;
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [previousDbName, setPreviousDbName] = useState('');
  const [bioStatus, setBioStatus] = useState(false);
  

      useEffect(() => {
  const loadSavedUsername = async () => {
    try {
      const savedEmpId = await AsyncStorage.getItem('empId');
      if (savedEmpId) {
        setMobileNumberOrEmpId(savedEmpId);
      }

      const storedName = await AsyncStorage.getItem('profilename');
      if (storedName) {
        setProfileName(storedName);
      } else {
        const profileData = await AsyncStorage.getItem('profile');
        if (profileData) {
          const parsedProfile = JSON.parse(profileData);
          setProfileName(parsedProfile?.name || 'Employee');
        }
      }

      // Check fingerprint status
      const fingerprintStatus = await AsyncStorage.getItem('useFingerprint');
      setBioStatus(fingerprintStatus === 'true');
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  loadSavedUsername();
}, []);


  useEffect(() => {
    const fetchUserPin = async () => {
      try {
        const storedPin = await AsyncStorage.getItem('userPin');
        setUserPin(storedPin);
      } catch (error) {
        console.error('Error fetching userPin from AsyncStorage:', error);
      }
    };
    fetchUserPin();
  }, []);

  useEffect(() => {
    fetchDbName();
  }, []);

  useEffect(() => {
  const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardStatus(true)
  );
  const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardStatus(false)
  );

  return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
  };
}, []);

  // useEffect(() => {
  //   if (selectedCompany && dbList.length > 0) {
  //     const company = dbList.find(c => c.ref_cust_name === selectedCompany.ref_cust_name);
  //     if (company) {
  //       const dbName = company.name.replace('SD_', '');
  //       AsyncStorage.setItem('dbName', dbName);
  //     }
  //   }
  // }, [selectedCompany, dbList]);

 const fetchDbName = async () => {
  try {
    const DBData = await getDBListInfo();
    setDbList(DBData.data || []);
    
    // Load both current and previous dbNames
    const savedDBName = await AsyncStorage.getItem('dbName');
    const prevDBName = await AsyncStorage.getItem('previousDbName') || savedDBName;
    setPreviousDbName(prevDBName);
    
    const matchingCompany = DBData.data.find(company => {
      const companyDbName = company.name.replace(/^SD_/, '');
      return companyDbName === savedDBName;
    });
    
    if (matchingCompany) {
      setSelectedCompany({
        label: matchingCompany.ref_cust_name,
        value: matchingCompany.ref_cust_name
      });
    } else if (DBData.data?.length === 1) {
      const firstCompany = DBData.data[0];
      const defaultDbName = firstCompany.name.replace(/^SD_/, '');
      
      setSelectedCompany({
        label: firstCompany.ref_cust_name,
        value: firstCompany.ref_cust_name
      });
      await AsyncStorage.multiSet([
        ['dbName', defaultDbName],
        ['previousDbName', defaultDbName]
      ]);
    }
  } catch (error) {
    console.error('DB List loading error:', error);
  }
};

const handleCompanyChange = async (item) => {
  if (!item) return;

  setSelectedCompany(item);
  const selected = dbList.find(c => c.ref_cust_name === item.value);
  
  if (selected) {
    const newDbName = selected.name.replace(/^SD_/, ''); 
    setDBName(newDbName); // Update state only
  }
  
  setCompanyError('');
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
    if (!mobileNumberOrEmpId) {
      setErrorMessage('Mobile number or Employee ID is required');
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

  const handlePressPassword = async () => {
  try {
    // Mark that fingerprint is supported
    // await AsyncStorage.setItem('useFingerprint', 'true');

    // Retrieve the previously used database name
    const prevDbName = await AsyncStorage.getItem('previousDbName');

    // If available, set it as the current dbName
    if (prevDbName) {
      await AsyncStorage.setItem('dbName', prevDbName);
    }

    // Navigate to the PIN screen
    router.push({ pathname: 'PinScreen' });
  } catch (error) {
    console.error('Error handling PIN/fingerprint login:', error);
  }
};



  // Add this to verify AsyncStorage updates
useEffect(() => {
  const logCurrentDbName = async () => {
    // console.log('Current AsyncStorage dbName:', await AsyncStorage.getItem('dbName'));
  };
  logCurrentDbName();
}, [selectedCompany]);

  const handlePress = async () => {
    if (!validateInput()) {
      return;
    }
  
    setLoading(true);
  
    try {

      // First, update dbName if a new company was selected
    if (selectedCompany) {
      const selected = dbList.find(c => c.ref_cust_name === selectedCompany.value);
      if (selected) {
        const newDbName = selected.name.replace(/^SD_/, '');
        await AsyncStorage.multiSet([
          ['dbName', newDbName],
          ['previousDbName', newDbName]
        ]);
      }
    }
      // Determine if the input is a mobile number (10 digits) or employee ID
      const isMobileNumber = /^\d{10}$/.test(mobileNumberOrEmpId);
      
      const payload = isMobileNumber 
        ? {
            mobile_number: mobileNumberOrEmpId,
            pin: parseInt(pin, 10),
          }
        : {
            emp_id: mobileNumberOrEmpId,
            pin: parseInt(pin, 10),
          };
          
  
      const url = await empLoginURL();
      // console.log("Payload--------",payload)
      const response = await publicAxiosRequest.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
      });


      if (response.status === 200) {
        const { token, emp_id, e_id } = response.data;
        await AsyncStorage.setItem('userToken', token);
        // Determine if the input is a mobile number (10 digits) or employee ID
        const isMobileNumber = /^\d{10}$/.test(mobileNumberOrEmpId);
        
        if (isMobileNumber) {
          await AsyncStorage.setItem('mobileNumber', mobileNumberOrEmpId);
        } else {
          await AsyncStorage.setItem('empId', mobileNumberOrEmpId);
        }
        // await AsyncStorage.setItem('mobileNumber', mobileNumberOrEmpId);
        await AsyncStorage.setItem('empId', emp_id);
        await AsyncStorage.setItem('empNoId', String(e_id));
        await AsyncStorage.setItem('userPin', pin);
  
        try {
          const companyInfoResponse = await getCompanyInfo();
          const companyInfo = companyInfoResponse.data;
          await AsyncStorage.setItem('companyInfo', JSON.stringify(companyInfo));
        } catch (error) {
          console.error('Error fetching company info:', error.message);
        }
        router.push('/home');
      } else {
        setErrorMessage('Invalid credentials');
      }
    } catch (error) {
      console.error('API call error:', error.response?.data || error.message);
      if (error.response) {
        setErrorMessage(`Error: ${error.response.data.error || 'Invalid credentials'}`);
      } else if (error.request) {
        setErrorMessage('No response from the server. Please check your connection.');
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaContainer>
      <StatusBar barStyle="light-content" backgroundColor="#a970ff" />
          <Container>
            <Header style={styles.headerContainer}>
              <LinearGradient 
                colors={['#a970ff', '#8a5bda']} 
                start={[0, 0]} 
                end={[1, 1]}
                style={styles.headerGradient}
              >
                <View style={styles.headerTop}>
                  
                  
                  <View style={styles.logoContainer}>
                                      {Logos ? (
                                      <Image source={Logos} style={styles.logo} />
                                      ) : (
                                      <View style={styles.companyPlaceholder}>
                                          <MaterialIcons name="business" size={scaleWidth(40)} color="#fff" />
                                      </View>
                                      )}
                                  </View>
                  {profileName && (
                    <WelcomeContainer>
                      <GreetingText>Welcome back,</GreetingText>
                      <UserNameText>{profileName}</UserNameText>
                    </WelcomeContainer>
                  )}
                </View>
              </LinearGradient>
            </Header>
            <MainContent keyboardStatus={keyboardStatus}>
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
                <Content>
                  <Card>
                    <Title>Login</Title>
                    
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
        
                      <InputLabel>Enter your Mobile number or Emp ID</InputLabel>
                      <InputWrapper>
          <MaterialIcons name="person" size={20} color="#6c757d" />
                        <Input
            placeholder="Mobile number or Emp ID"
            value={mobileNumberOrEmpId}
            onChangeText={setMobileNumberOrEmpId}
            keyboardType="default" // Changed to default to allow both numbers and text
            placeholderTextColor="#6c757d"
            maxLength={20} // Increased max length for employee IDs
                        />
                      </InputWrapper>

                      <InputLabel>Enter your PIN (min 4 digits)</InputLabel>
                      <InputWrapper>
          <MaterialIcons name="lock-outline" size={20} color="#6c757d" />
                        <Input
            placeholder="PIN (min 4 digits)"
            value={pin}
            onChangeText={setPin}
                          secureTextEntry={!isPasswordVisible}
            keyboardType="numeric"
            placeholderTextColor="#6c757d"
            maxLength={10} // Increased max length but validation still requires min 4
          />
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <MaterialIcons
              name={isPasswordVisible ? 'visibility' : 'visibility-off'}
              size={20}
              color="#6c757d"
                          />
          </TouchableOpacity>
                      </InputWrapper>
                      
                      {errorMessage ? <ErrorText>{errorMessage}</ErrorText> : null}
                      
                      <LoginButton 
                        onPress={handlePress}
                        disabled={isLoginDisabled}
                        style={{ backgroundColor: isLoginDisabled ? '#fff' : '#0062cc' }}
                      >
                        <LoginButtonText style={{ color: isLoginDisabled ? '#454545' : '#fff' }}>
                          LOGIN
                        </LoginButtonText>
                      </LoginButton>

                    </InputContainer>
                  </Card>

                  {(userPin && bioStatus) && (
                    <AlternativeLogin onPress={handlePressPassword}>
                      <FingerprintIcon>
                        <Entypo name="fingerprint" size={scaleWidth(24)} color="#fff" />
                      </FingerprintIcon>
                      <AlternativeLoginText>Login with PIN/Fingerprint</AlternativeLoginText>
                    </AlternativeLogin>
                  )}
                </Content>
                </ScrollView>
                </MainContent>

            <Footer style={styles.fixedFooter}>
              <FooterText>Version Code: 1.0.8</FooterText>
            </Footer>
          </Container>
        {/* </KeyboardAvoidingView> */}
      </SafeAreaContainer>
  );
};

// Styled Components (remain the same as in your original code)
const styles = StyleSheet.create({
  headerContainer: {
    overflow: 'visible',
    zIndex: 10,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + scaleHeight(10) : scaleHeight(10),
    paddingHorizontal: scaleWidth(20),
    paddingBottom: scaleHeight(20),
    borderBottomLeftRadius: scaleWidth(30),
    borderBottomRightRadius: scaleWidth(30),
  },
  headerTop: {
    paddingVertical: scaleHeight(10),
  },
  companySection: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scaleHeight(20),
  },

  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    borderRadius: scaleWidth(10),
    overflow: 'hidden'
},

logo: {
    width: scaleWidth(150),
    height: scaleHeight(60),
    borderRadius: scaleWidth(10),
    resizeMode: 'contain',
    backgroundColor: '#fff',
},
  companyPlaceholder: {
    width: scaleWidth(80),
    height: scaleWidth(80),
    borderRadius: scaleWidth(40),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    flex: 1,
    position: 'relative', // Needed for absolute positioning of footer
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: scaleHeight(70), // Add padding to prevent content from being hidden behind footer
  },
  hiddenFooter: {
    display: 'none',
  },
  visibleFooter: {
    padding: scaleHeight(15),
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    width: '100%',
  },

});

const SafeAreaContainer = styled(SafeAreaView)`
  flex: 1;
  background-color: #a970ff;
`;

const Container = styled.View`
  flex: 1;
  background-color: #f5f5f5;
`;

const Header = styled.View`
  background-color: transparent;
`;

const ContentContainer = styled.View`
  flex: 1;
  margin-top: ${scaleHeight(-40)}px;
`;

const Content = styled.View`
  padding: ${scaleWidth(20)}px;
  padding-bottom: ${scaleHeight(80)}px;
`;

const Logo = styled.Image`
  width: ${scaleWidth(150)}px;
  height: ${scaleHeight(60)}px;
  border-radius: ${scaleWidth(10)}px;
  resize-mode: contain;
`;

const Card = styled.View`
  background-color: #fff;
  border-radius: ${scaleWidth(10)}px;
  margin-top: ${scaleHeight(20)}px;
  padding: ${scaleWidth(20)}px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const Title = styled.Text`
  font-size: ${scaleWidth(22)}px;
  font-weight: bold;
  color: #333;
  margin-bottom: ${scaleHeight(25)}px;
  text-align: center;
`;

const InputContainer = styled.View`
  width: 100%;
`;

const InputLabel = styled.Text`
  font-size: ${scaleWidth(14)}px;
  color: #666;
  margin-bottom: ${scaleHeight(5)}px;
  font-weight: 500;
`;

const InputWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: #f9f9f9;
  border-radius: ${scaleWidth(5)}px;
  border: 1px solid #ddd;
  margin-bottom: ${scaleHeight(15)}px;
  padding: 0 ${scaleWidth(15)}px;
  height: ${scaleHeight(50)}px;
`;

const Input = styled.TextInput`
  flex: 1;
  color: #333;
  font-size: ${scaleWidth(16)}px;
`;

const EyeButton = styled.TouchableOpacity`
  padding: ${scaleWidth(5)}px;
`;

const ErrorText = styled.Text`
  color: #e74c3c;
  font-size: ${scaleWidth(14)}px;
  margin-bottom: ${scaleHeight(15)}px;
`;

const LoginButton = styled.TouchableOpacity`
  background-color: ${props => props.disabled ? '#fff' : '#0062cc'};
  border: 1px solid #0062cc;
  padding: ${scaleHeight(15)}px;
  border-radius: ${scaleWidth(5)}px;
  align-items: center;
  margin-top: ${scaleHeight(10)}px;
`;


const LoginButtonText = styled.Text`
  color: #fff;
  font-size: ${scaleWidth(16)}px;
  font-weight: bold;
`;

const WelcomeContainer = styled.View`
  margin-bottom: ${scaleHeight(20)}px;
  align-items: center;
`;

const GreetingText = styled.Text`
  color: rgba(255, 255, 255, 0.9);
  font-size: ${scaleWidth(16)}px;
  font-weight: 500;
`;

const UserNameText = styled.Text`
  color: #fff;
  font-size: ${scaleWidth(24)}px;
  font-weight: bold;
  margin-top: ${scaleHeight(3)}px;
`;

const AlternativeLogin = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: ${scaleHeight(30)}px;
`;

const FingerprintIcon = styled.View`
  background-color: #a970ff;
  width: ${scaleWidth(40)}px;
  height: ${scaleWidth(40)}px;
  border-radius: ${scaleWidth(20)}px;
  align-items: center;
  justify-content: center;
  margin-right: ${scaleWidth(10)}px;
`;

const AlternativeLoginText = styled.Text`
  color: #a970ff;
  font-size: ${scaleWidth(16)}px;
  font-weight: 500;
`;
const MainContent = styled.View`
  flex: 1;
  margin-bottom: ${props => props.keyboardStatus ? 0 : scaleHeight(50)}px;
`;
const Footer = styled.View`
  padding: ${scaleHeight(10)}px;
  align-items: center;
  justify-content: center;
  border-top-width: 1px;
  border-top-color: #eee;
  background-color: #fff;
  width: 100%;
`;

const FooterText = styled.Text`
  color: #a970ff;
  font-size: ${scaleWidth(14)}px;
  font-weight: 500;
`;

export default LoginScreen;