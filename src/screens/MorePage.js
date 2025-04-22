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

const MenuIconContainer = styled(Animated.View)`
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

const SectionTitle = styled(Animated.Text)`
  font-size: ${width * 0.038}px;
  color: #999;
  font-weight: 600;
  margin: 10px 0;
  padding-left: 5px;
`;

const MorePage = (props) => {
  const router = useRouter();
  const [isManager, setIsManager] = useState(false);
  const [empId, setEmpId] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Animation states
  const [headerAnim] = useState(new Animated.Value(0));
  const [sectionTitleAnim] = useState(new Animated.Value(0));
  const [menuItemAnims] = useState(() => 
    Array(5).fill().map(() => ({
      scale: new Animated.Value(0.8),
      opacity: new Animated.Value(0),
      iconScale: new Animated.Value(0)
    }))
  );

  useEffect(() => {
    setLoading(true);
    getEmployeeInfo()
      .then((res) => {
        setEmpId(res?.data[0]?.emp_id);
        setIsManager(res?.data[0]?.is_manager);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Header animation
    Animated.spring(headerAnim, {
      toValue: 1,
      tension: 10,
      friction: 6,
      useNativeDriver: true
    }).start();

    // Section title animation
    Animated.sequence([
      Animated.delay(150),
      Animated.spring(sectionTitleAnim, {
        toValue: 1,
        tension: 10,
        friction: 6,
        useNativeDriver: true
      })
    ]).start();

    // Menu items animation
    menuItemAnims.forEach((anim, index) => {
      Animated.sequence([
        Animated.delay(200 + index * 80),
        Animated.parallel([
          Animated.spring(anim.scale, {
            toValue: 1,
            tension: 60,
            friction: 7,
            useNativeDriver: true
          }),
          Animated.spring(anim.opacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
          }),
          Animated.spring(anim.iconScale, {
            toValue: 1,
            tension: 60,
            friction: 7,
            useNativeDriver: true
          })
        ])
      ]).start();
    });
  }, [isManager]);

  const handlePressHelp = () => {  
    router.push({
      pathname: 'HelpScr',
      params: { empId },
    });
  };

  const handlePressRequest = () => {  
    router.push({
      pathname: 'RequestScr',
      params: { empId },
    });
  };
  
  const handlePressProfile = () => router.push('profile');
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
      subTitle: "Manage team members",
      icon: <MaterialIcons name="person-add" size={24} color="#7e57c2" />,
      action: handleAppointee,
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
      icon: <Ionicons name="settings-outline" size={24} color="#7e57c2" />,
      action: handlePressRequest,
      show: true
    },
  ].filter(item => item.show);

  return (
    <Container>
      <Loader visible={loading} />
      <HeaderComponent 
        headerTitle="More Options" 
        onBackPress={handleBackPress} 
        headerStyle={{ 
          backgroundColor: '#7e57c2',
          transform: [{
            translateY: headerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-60, 0]
            })
          }],
          opacity: headerAnim
        }}
      />
      
      <MenuContainer>
        <SectionTitle
          style={{
            transform: [{
              translateX: sectionTitleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0]
              })
            }],
            opacity: sectionTitleAnim
          }}
        >
          ACCOUNT
        </SectionTitle>
        
        {menuItems.slice(0, isManager ? 2 : 1).map((item, index) => {
          const anim = menuItemAnims[index];
          return (
            <MenuItem 
              key={`account-${index}`}
              onPress={item.action}
              style={{
                transform: [{ scale: anim.scale }],
                opacity: anim.opacity
              }}
              activeOpacity={0.7}
            >
              <MenuIconContainer style={{
                transform: [{ scale: anim.iconScale }]
              }}>
                {item.icon}
              </MenuIconContainer>
              <MenuTextContainer>
                <MenuText>{item.title}</MenuText>
                <MenuSubText>{item.subTitle}</MenuSubText>
              </MenuTextContainer>
              <Animated.View style={{
                transform: [{
                  scale: anim.iconScale.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1]
                  })
                }]
              }}>
                <MaterialIcons name="chevron-right" size={24} color="#ccc" />
              </Animated.View>
            </MenuItem>
          );
        })}
        
        <SectionTitle
          style={{
            transform: [{
              translateX: sectionTitleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0]
              })
            }],
            opacity: sectionTitleAnim
          }}
        >
          APP
        </SectionTitle>
        
        {menuItems.slice(isManager ? 2 : 1).map((item, index) => {
          const animIndex = isManager ? index + 2 : index + 1;
          const anim = menuItemAnims[animIndex];
          return (
            <MenuItem 
              key={`app-${index}`}
              onPress={item.action}
              style={{
                transform: [{ scale: anim.scale }],
                opacity: anim.opacity
              }}
              activeOpacity={0.7}
            >
              <MenuIconContainer style={{
                transform: [{ scale: anim.iconScale }]
              }}>
                {item.icon}
              </MenuIconContainer>
              <MenuTextContainer>
                <MenuText>{item.title}</MenuText>
                <MenuSubText>{item.subTitle}</MenuSubText>
              </MenuTextContainer>
              <Animated.View style={{
                transform: [{
                  scale: anim.iconScale.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1]
                  })
                }]
              }}>
                <MaterialIcons name="chevron-right" size={24} color="#ccc" />
              </Animated.View>
            </MenuItem>
          );
        })}
      </MenuContainer>
    </Container>
  );
};

export default MorePage;