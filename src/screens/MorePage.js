import React, { useEffect, useState } from 'react';
import { View, Text, Image, StatusBar, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';
import styled from 'styled-components/native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons, Feather, FontAwesome } from '@expo/vector-icons';
import HeaderComponent from '../components/HeaderComponent';
import { getEmployeeInfo, getProfileInfo } from '../services/authServices';
import Loader from '../components/old_components/Loader';

const { width, height } = Dimensions.get('window');

// Styled Components
const Container = styled.View`
  background-color: #f8f9fa;
  flex: 1;
`;

const MenuContainer = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
  contentContainerStyle: {
    paddingBottom: 20
  }
})`
  flex: 1;
  padding: 15px;
`;

const MenuItem = styled(Animated.createAnimatedComponent(TouchableOpacity))`
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

const Divider = styled.View`
  height: 1px;
  background-color: #eee;
  margin: 15px 0;
`;

const SectionTitle = styled.Text`
  font-size: ${width * 0.038}px;
  color: #999;
  font-weight: 600;
  margin: 10px 0;
  padding-left: 5px;
`;

const MorePage = (props) => {
  const router = useRouter();
  const [isManager, setIsManager] = useState(false);
  // const [profile, setProfile] = useState([]);
  const [empId, setEmpId] = useState([]);
  const [loading, setLoading] = useState(false);
  const [animations] = useState(() => 
    Array(5).fill().map(() => new Animated.Value(0))
  );

  useEffect(()=>{
    setLoading(true);
    getEmployeeInfo()
    .then((res) => {
        // setProfile(res?.data?.emp_data);
        setEmpId(res?.data[0]?.emp_id);
        setIsManager(res?.data[0]?.is_manager);
        setLoading(false);
    })
    .catch((error) => {
        setLoading(false);
        // setIsManager(false);
    });
  },[])

  console.log("Emp Id====",empId);

  useEffect(() => {
    // setIsManager(props?.data?.isManager === "true" || props?.data?.isManager === true);
    
    // setEmpId(profile?.emp_id);
    // Staggered animation for menu items
    animations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true
      }).start();
    });
  }, [props?.data?.isManager]);

  // console.log("Is manager==",isManager)

  // const handlePressRequest = () => {
  //   router.push({
  //     pathname: 'RequestScr' 
  //   });
  // };

  // const handlePressHelp = () => {
  //   router.push({
  //     pathname: 'HelpScr' 
  //   });
  // };

  const handlePressHelp = () => {  
    router.push({
      pathname: 'HelpScr',
      params: {
        empId,
      },
    });
};

  const handlePressRequest = () => {  
    router.push({
      pathname: 'RequestScr',
      params: {
        empId,
      },
    });
};

  
  

  // const handlePressSettings = () => router.push('settings');
  // const handlePressSupport = () => router.push('support');
  const handlePressProfile = () => router.push('profile');
  const handleBackPress = () => {
    router.navigate({
      pathname: 'home',
      params: { screen: 'HomePage' }
    });
  };
  const handleAppointee = () => router.push({ pathname: 'AddAppointee' });

  // Inside your menu items array
const menuItems = [
  {
    title: "My Profile",
    subTitle: "View and edit your profile",
    icon: <Ionicons name="person-outline" size={24} color="#7e57c2" />,
    action: handlePressProfile,
    show: true // Always show
  },
  {
    title: "Add Appointee",
    subTitle: "Manage team members",
    icon: <MaterialIcons name="person-add" size={24} color="#7e57c2" />,
    action: handleAppointee,
    show: isManager // Only show if isManager is true
  },
  {
    title: "Help Desk",
    subTitle: "Raise your consern at Help Desk",
    icon: <Feather name="help-circle" size={24} color="#7e57c2" />,
    action: handlePressHelp,
    show: true
  },
  {
    title: "Request Desk",
    subTitle: "Add your request in Request",
    icon: <Ionicons name="settings-outline" size={24} color="#7e57c2" />,
    action: handlePressRequest,
    show: true
  },
  // {
  //   title: "Logout",
  //   subTitle: "Sign out of your account",
  //   icon: <MaterialIcons name="logout" size={24} color="#7e57c2" />,
  //   action: handlePressLogout,
  //   show: true
  // }
].filter(item => item.show); // This filters out any items where show is false

  return (
    <Container>
      {/* <StatusBar barStyle={'light-content'} backgroundColor={'#7e57c2'} /> */}
      <Loader visible={loading} />
      <HeaderComponent 
        headerTitle="More Options" 
        onBackPress={handleBackPress} 
        headerStyle={{ backgroundColor: '#7e57c2' }}
      />
      
      <MenuContainer>
        <SectionTitle>ACCOUNT</SectionTitle>
        {menuItems.slice(0, isManager ? 2 : 1).map((item, index) => (
          <MenuItem 
            key={`account-${index}`}
            onPress={item.action}
            style={{
              opacity: animations[index],
              transform: [{
                translateX: animations[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0]
                })
              }]
            }}
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
        {menuItems.slice(isManager ? 2 : 1).map((item, index) => (
          <MenuItem 
            key={`app-${index}`}
            onPress={item.action}
            style={{
              opacity: animations[index + (isManager ? 2 : 1)],
              transform: [{
                translateX: animations[index + (isManager ? 2 : 1)].interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0]
                })
              }]
            }}
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
    </Container>
  );
};

export default MorePage;