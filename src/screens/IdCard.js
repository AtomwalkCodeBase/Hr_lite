import React, { useEffect, useState, useContext, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useNavigation } from '@react-navigation/native';
import { AppContext } from '../../context/AppContext';
import { getCompanyInfo, getEmployeeInfo, getProfileInfo } from '../services/authServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderComponent from '../components/HeaderComponent';

import QRCode from 'react-native-qrcode-svg';
import QRModal from '../components/QRModal';
import { LinearGradient } from 'expo-linear-gradient';
import Loader from '../components/old_components/Loader';  // Import Loader component

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #f4f4f4;
`;

const StyledScrollView = styled(ScrollView).attrs({
  showsVerticalScrollIndicator: false,  // Hide vertical scrollbar
  showsHorizontalScrollIndicator: false, // Hide horizontal scrollbar
  keyboardShouldPersistTaps: 'handled', // Allow taps to be handled while keyboard is open
  contentContainerStyle: { flexGrow: 1 }, // Ensures full content scrollability
})``;


const CardContainer = styled.View`
  border-radius: 15px;
  padding: 25px;
  width: 90%;
  align-items: center;
  overflow: hidden;
  max-width: 800px;
`;

const CompanyLogo = styled.Image`
  width: 120px;
  height: 120px;
  margin-top: -50px; /* Reduce space above the logo */
  margin-bottom: -10px; /* Reduce space below the logo */
  resize-mode: contain;
`;


const ProfileImage = styled.Image`
  width: 160px;
  height: 160px;
  border-radius: 80px;
  margin-bottom: 10px;
  border-width: 2px;
  border-color: #ddd;
`;

const UserName = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
`;

const InfoText = styled.Text`
  font-size: 12px;
  color: rgb(29, 29, 29);
  margin-bottom: 10px;
  text-align: center;
`;
const GradeText = styled.Text`
  font-size: 13px;
  font-weight: bold;
  color: rgb(29, 29, 29);
  margin-bottom: 5px;
  text-align: center;
`;

const UrlContainer = styled(LinearGradient).attrs({
  colors: ['#2E71F7', '#2E5DB7'], // Adjusted gradient with a closer shade
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 }, // Horizontal gradient for a smoother transition
})`
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
  position: absolute;
  bottom: 0;
`;


const UrlText = styled.Text`
  font-size: 12px;
  color: #fff;
  font-weight: bold;
  text-align: center;
`;

const Button = styled.TouchableOpacity`
  margin-top: 20px;
  background-color: #00796b;
  padding: 12px 25px;
  border-radius: 8px;
  align-items: center;
  width: 100%;
  max-width: 250px;
`;

const ButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: bold;
`;

const IdCard = () => {
  const navigation = useNavigation();
  const { logout } = useContext(AppContext);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [profile, setProfile] = useState({});
  const [company, setCompany] = useState({});
  const [userPin, setUserPin] = useState(null);
  const cardRef = useRef();
  const [hideButtons, setHideButtons] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Added loading state

  useEffect(() => {
    const fetchUserPin = async () => {
      const storedPin = await AsyncStorage.getItem('userPin');
      setUserPin(storedPin);
    };

    const fetchData = async () => {
      try {
        const [profileResponse, companyResponse] = await Promise.all([
          getEmployeeInfo(),
          getCompanyInfo(),
        ]);

        setProfile(profileResponse?.data[0] || {});
        setCompany(companyResponse?.data || {});
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPin();
    fetchData();
  }, []);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleQRPress = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleDownload = async () => {
    try {
      setHideButtons(true);
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (!cardRef.current) {
        console.error("cardRef is not attached to a native component.");
        setHideButtons(false);
        return;
      }

      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
      });

      setHideButtons(false);
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('Error capturing ID Card:', error);
      setHideButtons(false);
    }
  };


  return (
    <>
      <HeaderComponent headerTitle="My Id" onBackPress={handleBackPress} />

      {/* Loader - Appears while fetching data */}
      <Loader visible={isLoading} onTimeout={() => setIsLoading(false)} />

      {!isLoading && (
        <StyledScrollView>
        <Container>
          <View ref={cardRef} collapsable={false} style={{ alignItems: 'center', width: '100%' }}>
            <ImageBackground
              source={require('../../assets/images/Id-Bg.png')}
              style={{
                borderRadius: 15,
                overflow: 'hidden',
                padding: 20,
                alignItems: 'center',
                justifyContent: 'center',
                maxWidth: 800,
                position: "relative",
              }}
              resizeMode="cover"
            >
              <CardContainer>
                  <View style={{ alignItems: 'center', marginBottom: 10 }}>
                    

                    {company.image ? (
                      <CompanyLogo source={{ uri: company.image }} />
                    ) : (
                      <Text style={{ color: '#fff', fontSize: 12 }}>No Logo Available</Text>
                    )}
                  </View>
                <ProfileImage source={{ uri: profile?.image }} />
                <UserName>{profile?.name}</UserName>
                {profile?.grade_name ? (
                      <GradeText>{profile?.grade_name}</GradeText>
                    ) : null}
                {/* <GradeText>{profile?.emp_data?.grade_name}</GradeText> */}

                {/* Row layout for QR Code and InfoText */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <QRCode
                  value={profile?.emp_id || 'Employee Id Not Allocated'}
                  size={65} // Set fixed size
                />
                <View style={{ marginLeft: 15, alignItems: 'flex-start', marginTop: 6 }}>  
                  <InfoText>Employee ID: {profile?.emp_id}</InfoText>
                  <InfoText>Department: {profile?.department_name}</InfoText>
                  {/* <InfoText>Grade: {profile?.emp_data?.grade_name}</InfoText> */}
                  {profile?.mobile_number ? (
                      <InfoText>Mobile: {profile?.mobile_number}</InfoText>
                    ) : null}
                  {/* <InfoText>Mobile: {profile?.mobile_number}</InfoText> */}
                </View>
              </View>
              {company.name ? (
                      <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#454545', margin: -5 }}>
                      {company.name}
                    </Text>
                    ) : null}
              </CardContainer>

              {/* Full-width URL container - positioned at the bottom */}
              <UrlContainer>
                <UrlText>{company.web_page}</UrlText>
              </UrlContainer>

            </ImageBackground>
          </View>

          {!hideButtons && (
            <>
              {/* <Button onPress={handleQRPress}>
                <ButtonText>Show QR Code</ButtonText>
              </Button> */}
              <Button onPress={handleDownload}>
                <ButtonText>Share ID Card</ButtonText>
              </Button>
            </>
          )}

          <QRModal
            isVisible={isModalVisible}
            onClose={handleCloseModal}
            qrValue={profile?.emp_id || 'No Id'}
          />
        </Container>
        </StyledScrollView>
      )}
    </>
  );
};

export default IdCard;
