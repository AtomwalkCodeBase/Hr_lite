import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import styled from 'styled-components/native';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons, Feather, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import HeaderComponent from '../components/HeaderComponent';
import Loader from '../components/old_components/Loader';
import { AppContext } from '../../context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Styled Components
const MainContainer = styled(SafeAreaView)`
  flex: 1;
  background-color: #f8f9fa;
`;

const ContentContainer = styled.View`
  flex: 1;
`;



const MenuContainer = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
  contentContainerStyle: {
    paddingBottom: 20,
    flexGrow: 1
  }
})`
  padding: 15px;
`;

const MenuItem = styled(TouchableOpacity)`
  width: 100%;
  height: ${height * 0.085}px;
  background-color: #fff;
  padding: 0 20px;
  border-radius: 12px;
  margin-bottom: 12px;
  flex-direction: row;
  align-items: center;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
`;

const MenuIconContainer = styled.View`
  width: ${width * 0.12}px;
  height: ${width * 0.12}px;
  border-radius: ${width * 0.06}px;
  background-color: #f0e7ff;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
`;

const MenuTextContainer = styled.View`
  flex: 1;
`;

const MenuText = styled.Text`
  font-size: ${width * 0.04}px;
  font-weight: 600;
  color: #333;
`;

const MenuSubText = styled.Text`
  font-size: ${width * 0.032}px;
  color: #888;
  margin-top: 2px;
`;

const SectionTitle = styled.Text`
  font-size: ${width * 0.038}px;
  color: #999;
  font-weight: 600;
  margin: 10px 0;
  padding-left: 5px;
`;

const MorePage = () => {
  const { profile } = useContext(AppContext);
  const router = useRouter();
  const [isManager, setIsManager] = useState(false);
  const [empId, setEmpId] = useState([]);
  const [empShift, setEmpShift] = useState({});
  const [loading, setLoading] = useState(false);
  const [isShift, setIsShift] = useState(false);

  useEffect(() => {
    setLoading(true);
        setEmpShift(profile?.current_shift);
        setEmpId(profile?.emp_id);
        setIsManager(profile?.is_manager);
        setIsShift(profile?.is_shift_applicable);
        setLoading(false);
  }, []);

  

  const handlePressHelp = () => {  
    router.push({
      pathname: 'HelpScr',
      params: { empId },
    });
  };

  const handlePressResolve = () => {  
    router.push({
      pathname: 'ResolveScreen',
      params: { empId },
    });
  };

  const handlePressRequest = () => {  
    router.push({
      pathname: 'RequestScr',
      params: { empId },
    });
  };

  const handlePressEvent = () => {  
    router.push({
      pathname: 'EventScr',
      params: { empId },
    });
  };

  const handlePressShift = () => {  
    router.push({
      pathname: 'ShiftScr',
      params: { empId, empShift },
    });
  };

  const handlePressTraining = () => {  
    router.push({
      pathname: 'TrainingScr',
    });
  };
  
  const handlePressEmployee = () => {  
    router.push({
      pathname: 'EmployeeList',
    });
  };

const handlePressProfile = () => {
  router.push('profile');
};

  
  const handleBackPress = () => {
    router.navigate({
      pathname: 'home',
      params: { screen: 'HomePage' }
    });
  };
  const handleAppointee = () => router.push({ pathname: 'AddAppointee' });

  const menuItems = [
    {
      title: "My Profile",
      subTitle: "View and edit your profile",
      icon: <Ionicons name="person-outline" size={24} color="#7e57c2" />,
      action: handlePressProfile,
      show: true
    },
    {
      title: "Add Appointee",
      subTitle: "Scan your appointee resume",
      icon: <MaterialIcons name="person-add" size={24} color="#7e57c2" />,
      action: handleAppointee,
      show: isManager
    },
    {
      title: "Employee List",
      subTitle: "See All the Employee List",
      icon: <FontAwesome6 name="users" size={20} color="#7e57c2" />,
      action: handlePressEmployee,
      show: isManager
    },
    {
      title: "Help Desk",
      subTitle: "Raise your concern at Help Desk",
      icon: <Feather name="help-circle" size={24} color="#7e57c2" />,
      action: handlePressHelp,
      show: true
    },
    {
      title: "Request Desk",
      subTitle: "Add your request in Request",
      icon: <FontAwesome6 name="headset" size={24} color="#7e57c2" />,
      action: handlePressRequest,
      show: true
    },
    {
      title: "Resolve Desk",
      subTitle: "See your issues at Resolve Desk",
      icon: <MaterialCommunityIcons name="checkbox-multiple-marked-circle-outline" size={24} color="#7e57c2" />,
      action: handlePressResolve,
      show: true
    },
  // {
  //   title: "Resolve Help & request",
  //   subTitle: "Resolve your Help & request",
  //   icon: <AntDesign name="customerservice" size={24} color="#7e57c2" />,
  //   action: handlePressResolve,
  //   show: true
  // },
  {
    title: "Event Updates",
    subTitle: "Get your recent updates and events",
    icon: <MaterialIcons name="tips-and-updates" size={24} color="#7e57c2" />,
    action: handlePressEvent,
    show: true
  },
  {
    title: "Shift Information",
    subTitle: "Check your scheduled shifts",
    icon: <MaterialIcons name="calendar-month" size={24} color="#7e57c2" />,
    action: handlePressShift,
    show: isShift
  },
  {
    title: "My Training",
    subTitle: "Check your training details",
    icon: <MaterialIcons name="book" size={24} color="#7e57c2" />,
    action: handlePressTraining,
    show: true
}
].filter(item => item.show); // This filters out any items where show is false

  return (
    <MainContainer edges={['top']}>
      <ContentContainer>
        <Loader visible={loading} />
        <HeaderComponent 
          headerTitle="More Options" 
          onBackPress={handleBackPress} 
          headerStyle={{ backgroundColor: '#7e57c2' }}
        />
        
        <MenuContainer>
          <SectionTitle>ACCOUNT</SectionTitle>
          
          {menuItems.slice(0, isManager ? 3 : 1).map((item, index) => (
            <MenuItem 
              key={`account-${index}`}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <MenuIconContainer>
                {item.icon}
              </MenuIconContainer>
              <MenuTextContainer>
                <MenuText>{item.title}</MenuText>
                <MenuSubText>{item.subTitle}</MenuSubText>
              </MenuTextContainer>
              <MaterialIcons name="chevron-right" size={24} color="#ccc" />
            </MenuItem>
          ))}
          
          <SectionTitle>APP</SectionTitle>
          
          {menuItems.slice(isManager ? 3 : 1).map((item, index) => (
            <MenuItem 
              key={`app-${index}`}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <MenuIconContainer>
                {item.icon}
              </MenuIconContainer>
              <MenuTextContainer>
                <MenuText>{item.title}</MenuText>
                <MenuSubText>{item.subTitle}</MenuSubText>
              </MenuTextContainer>
              <MaterialIcons name="chevron-right" size={24} color="#ccc" />
            </MenuItem>
          ))}
        </MenuContainer>
      </ContentContainer>
    </MainContainer>
  );
};

export default MorePage;