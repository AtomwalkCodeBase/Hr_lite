import React from "react";
import { View, Alert,TouchableOpacity,Text  } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
// import { SIZES, SHADOWS, assets } from "../constant_s";
import { SubInfo, CardTitle } from "./SubInfo";
import Icon from 'react-native-vector-icons/MaterialIcons';
// import { RectButton, CircleButton } from "./Button";
import { colors } from "../Styles/appStyle";
import styled from 'styled-components/native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const SIZES = {
  font: 14,
  base: 8,
  extraLarge: 24,
  large: 18,
};

const SHADOWS = {
  dark: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
};

// Styled components
const CardContainer = styled.View`
  background-color: ${(props) => props.cardColour};
  border-radius: ${SIZES.font}px;
  margin: ${SIZES.base}px;
  margin-bottom: ${SIZES.extraLarge}px;
  ${SHADOWS.dark};
  margin-top: 30px;
`;

const InfoContainer = styled.View`
  width: 100%;
  height: 50px;
`;

const ContentContainer = styled.View`
  width: 100%;
  padding: ${SIZES.font}px;
`;

const ButtonContainer = styled.View`
  margin-top: ${SIZES.font}px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const CircleButton = styled.TouchableOpacity`
  flex-direction: row;
  margin-top: 10px;
  gap: 5px;
  min-width: ${(props) => props.minWidth || 100}px;
  padding: 10px 25px;
  border-radius: 20px;
  background-color: #4491FE;
  border-width: 1px;
  border-color: #3c9df1;
  align-items: center;
  justify-content: center;
`;
const CircleButton2 = styled.TouchableOpacity`
  flex-direction: row;
  margin-top: 10px;
  gap: 5px;
  min-width: ${(props) => props.minWidth || 100}px;
  padding: 8px 10px;
  border-radius: 20px;
  background-color: #fff;
  border-width: 1px;
  border-color: #00bcd4;
  align-items: center;
  justify-content: center;
`;

const RectButton = styled.TouchableOpacity`
  margin-top: 8px;
  flex-direction: row;
  gap: 5px;
  /* min-width: ${(props) => props.minWidth || 120}px; */
  padding: 7px 10px;
  border-radius: 20px;
  background-color:${(props) => props.bcolor || "#fff"};
  border-width: 1px;
  border-color: #00bcd4;
  align-items: center;
  justify-content: center;
`;

const ButtonText = styled.Text`
  color: black;
  font-size: ${(props) => props.fontSize || SIZES.font}px;
`;

const SmallCard = ({data, navigation, colour, title, subTitle, date, dateTitle, dateColour, 
                    buttonTittle, buttonScreen, iconName, iconName2, iconScreen, handleIcon, handleIcon2, text1, text2, 
                    callMode, name, task_name, handleInfo,logo}) => {
    
    const cardColour = colour ? colour: colors.primary
    
    const handleNavigation = () => {
      // console.log('Navigation Screen name', buttonScreen, data);
      if (buttonScreen == 'UpdateInterest' || buttonScreen == 'UpdateTaskInterest'){
        navigation.navigate(buttonScreen,  
                            {task_id: data.task_id, variation_name_id: data.variation_name?data.variation_name.id: '', 
                             variation_value: data.variation_value, 
                             variation_name_1_id: data.variation_name_1?data.variation_name_1.id: '', variation_value_1: data.variation_value_1,
                             variation_name_2_id: data.variation_name_2?data.variation_name_2.id: '', variation_value_2: data.variation_value_2,
                             category_id: data.category?data.category.id:'',
                             due_date: data.due_date, product_info: data.product_info, id: data.id, 
                             call_mode: callMode? callMode:'', screen:buttonScreen,
                             name: name? name:'', task_name: task_name? task_name:''});
      }
      else if (buttonScreen == 'LeadTasks'){
        navigation.navigate('CustomerTasks',  {customer_id: '', name: data.name, lead_id: data.id, call_mode:'L' });
      }
      else if (buttonScreen == 'ViewOrderItem') {
        Alert.alert('Will be supported shortly !!!');

      }
      else {
        console.log('Not Valid screen call mode')
      }

    }

    const handleIconNavigation = () => {
        // console.log('Icon Screen name', iconScreen, data);
        if (iconScreen == 'ViewInterest' || iconScreen == 'ViewTaskInterest'){
            navigation.navigate(iconScreen, {data: data, call_mode: callMode, delete_mode: ''});
        } 
        else if (iconScreen == 'InvoiceSendMail') {
          Alert.alert('Not Enabled');
        }
        else {
          Alert.alert('Not Enabled');  
        }
  
      }
      
    const handleDeleteNavigation = () => {
        // console.log('Icon Screen name', iconScreen, data);
        if (iconScreen == 'ViewInterest' || iconScreen == 'ViewTaskInterest'){
            navigation.navigate(iconScreen, {data: data, call_mode: callMode, delete_mode: 'Y', screen:iconScreen});
        } 
        else if (iconScreen == 'InvoiceSendMail') {
            Alert.alert('Not Enabled')
        }
        else {
            Alert.alert('Not Enabled');
        }
  
      }
    
    return (
      <CardContainer cardColour={cardColour}>
      <InfoContainer>
        {/* Assuming SubInfo is a separate component */}
        {date && (
          <SubInfo
            task_date={date}
            dateColour={dateColour}
            dateTitle={dateTitle}
            data={data}
            handlePress={handleInfo}
          />
        )}
      </InfoContainer>

      <ContentContainer>
        <CardTitle
          title={title}
          subTitle={subTitle}
          titleSize={SIZES.extraLarge}
          subTitleSize={SIZES.large}
        />

      {buttonTittle!='UPDATE'?  <ButtonContainer>
          
        <RectButton minWidth={120} fontSize={SIZES.font} onPress={handleNavigation}>
        { !logo&&<FontAwesome5 name="th-list" size={16} color="#aaa" />}
            <ButtonText>{buttonTittle}</ButtonText>
          </RectButton>
          {/* <View> */}
        

          {iconName2 &&text2&& (
            <CircleButton2
              onPress={handleIcon2 ? handleIcon2 : handleDeleteNavigation}
              right={82}
              bottom={5}
            >
              {/* <Icon name={iconName2} size={24} color="#fff" /> */}
              <FontAwesome5 name="th-list" size={16} color="#aaa" />
              <Text style={{color:"#454545",fontWeight:"500"}}>Product {text2}</Text>
            </CircleButton2>
          )}
            { text1&&<CircleButton
            onPress={iconScreen? handleIconNavigation: handleIcon}
            right={5}
            bottom={5}
          >
            {/* <Icon name={iconName} size={24} color="red" /> */}
            <Text style={{color:"white",fontWeight:"500"}}>Add {text1}</Text>
          </CircleButton>}
          {/* </View> */}
        </ButtonContainer>: <ButtonContainer>
          <RectButton
            onPress={iconScreen? handleIconNavigation: handleIcon}
            right={5}
            bottom={5}
          >
           <FontAwesome5 name="eye" size={25} color="#3c9df1" />
            <Text>Detail</Text>
          </RectButton>

          {/* {iconName2 && (
            <CircleButton
              onPress={handleIcon2 ? handleIcon2 : handleDeleteNavigation}
              right={82}
              bottom={5}
            >
              <Icon name={iconName2} size={24} color="white" />
              <Text>{text2}</Text>
            </CircleButton>
          )} */}
          <View style={{flexDirection:"row"}} >
          <RectButton
              bcolor="red"
              onPress={handleIcon2 ? handleIcon2 : handleDeleteNavigation}
              right={82}
              bottom={5}
            >
              <Icon name={iconName2} size={24} color="white" />
              <Text style={{color:"#fff",fontWeight:"500"}}>Delete</Text>
            </RectButton>
          <View style={{marginTop:5,marginLeft:3}}></View>
          <RectButton bcolor="orange"  minWidth={120} fontSize={SIZES.font} onPress={handleNavigation}>
          <MaterialIcons name="security-update-good" size={24} color="#fff" />
            <Text style={{fontWeight:"400",color:"white"}}>{buttonTittle}</Text>
          </RectButton></View></ButtonContainer>}
      </ContentContainer>
    </CardContainer>
    );
};

export default SmallCard