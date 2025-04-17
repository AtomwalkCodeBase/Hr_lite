import React from "react";
import { View, Image } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';


import { SIZES, SHADOWS, assets } from "../constant_s";
import { SubInfo, EthPrice, CardTitle } from "./SubInfo";
import { RectButton, CircleButton } from "./Button";
import { colors } from "../Styles/appStyle";
import styled from 'styled-components/native';

const CardContainer = styled.View`
  background-color: #fff;
  border-radius: 10px;
  padding: 15px;
  margin: 10px;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  elevation: 3;
  border: 1px solid #e0e0e0;
  position: relative;
`;

const CardDetails = styled.View`
  /* flex: 1; */
`;
const LogoImage = styled.Image`
  width: 50px;
  height: 50px;
`;
const CardTitles = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #000;
`;
const AmountDueButton = styled.TouchableOpacity`
  flex-direction: row;
  /* width: 130px; */
  height: 40px;
  align-items: center;
  background-color: '#fffff';
  border: 1px solid ;
  border-color: ${props => props.color ? '#3c9df1' : 'red'};
  border-radius: 10px;
  padding: 5px;
  margin-top: 10px;
  margin-right: 50px;
  justify-content: center;
`;

const AmountDue = styled.Text`
margin-left: 5px;
font-size: 14px;
/* color: red; */
color: ${props => props.color ? 'black' : 'red'};
`;
const AmountDues = styled.Text`
/* margin-left: 5px; */
font-size: 14px;
font-weight:500;
margin-top: 5px;
/* margin-top: 10px; */
/* color: red; */
margin-right: 4px;
color:green;
`;

const CardSubText = styled.Text`
  font-size: 14px;
  color: #666;
  margin-top: 5px;
`;

const ActionButtonsContainer = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
  justify-content: space-between;
  /* align-items:end;
  justify-content: end; */
`;

const ActionButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  border: 1px solid ${props => (props.color ? 'white' : '#00bcd4')};
  border-radius: 20px;
  padding: 9px 12px;
  margin-right: 10px;
  background-color: ${props => (props.disabled ? '#f5f5f5' : '#fff')};
`;
const ActionButton2 = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  border: 1px solid ${props => (props.color ? 'white' : '#00bcd4')};
  border-radius: 20px;
  margin-right: 10px;
  margin-top: 5px;
  background-color: ${props => (props.disabled ? '#f5f5f5' : '#fff')};
`;

const ActionButtonText = styled.Text`
  font-size: 14px;
  color: ${props => (props.disabled ? 'black' : 'black')};
  margin-left: 5px;
  font-weight: 500;
`;

const AssignTaskButton = styled.TouchableOpacity`
  background-color:  ${props => (props.color ? '#007bff' : 'red')};
  border-radius: 20px;
  padding: 10px 20px;
`;

const AssignTaskText = styled.Text`
  color: #fff;
  font-size: 14px;
  font-weight: bold;
`;

const ProfileIconContainer = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #ffff;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 20px;
  right: 18px;
`;
const CardItem = ({data, navigation, screen, handleIconPress, icon, buttonTittle, colour, isAmtApplicable, 
                   handleDisplayPress, iconName1, handleIconName1Press, iconName2, iconScreen2 }) => {
    const sub_title = data.customer?data.customer.name: data.gstn_number? `GSTN ${data.gstn_number}`: data.address_line_1
    const cardColour = colour ? colour: colors.primary
    
    const handleNavigation = () => {
      console.log('Screen name', screen);
      if (screen == 'CustomerTasks'){
        navigation.navigate('CustomerTasks',  {customer_id: data.id, name: data.name, lead_id: '', call_mode:'C' });
      }else if (screen == 'LeadTasks'){
        navigation.navigate('CustomerTasks',  {customer_id: '', name: data.name, lead_id: data.id, call_mode:'L' });
      } else if (screen == 'ProductInterest' || screen == 'TaskInterest') {
        navigation.navigate(screen,  {task_id: data.id, screen: screen,
          name: data.customer? data.customer.name: data.lead? data.lead.name:'', task_name: data.name,
          call_mode: data.customer? 'C': data.lead? 'L':'' });
      } 
      else {
        navigation.navigate(screen, { data });
      }

    }

    
  const handleIconNavigation2 = () => {
      console.log('Icon Screen name', iconScreen2, data);
      if (iconScreen2 == 'ViewInterest'){
          navigation.navigate(iconScreen2, {data: data, call_mode: callMode, delete_mode: 'Y'});
      } 
      else if (iconScreen2 == 'InvoiceSendMail') {
          Alert.alert('Not Enabled')
      }
      else {
        navigation.navigate(buttonScreen, { data });
      }

    }
    return (
      <CardContainer>
      <ProfileIconContainer>
      <LogoImage source={{ uri: data.customer?data.customer.image: data.image }} />
      </ProfileIconContainer>
        <CardTitles>{data.name}</CardTitles>
        {sub_title&&<CardSubText>{sub_title}</CardSubText>}
        {data.task_date &&<CardSubText>Planned on: {data.task_date}</CardSubText>}
        {isAmtApplicable&&data.outstanding_amt?<ActionButton2 color={true} onPress={() => handleDisplayPress({data})}>
          <FontAwesome name="rupee" size={20} color="red" />
          <AmountDue>{data.outstanding_amt} - DUE AMT</AmountDue>
        </ActionButton2>:isAmtApplicable&&<AmountDues>NO OUTSTANDING</AmountDues>}
        <ActionButtonsContainer>
          {iconName1&&<ActionButton onPress={() =>   handleIconName1Press(data)}>
            <FontAwesome5 name="eye" size={16} color="gray" />
            <ActionButtonText>Task</ActionButtonText>
          </ActionButton>}
          <ActionButton onPress={()=>handleNavigation()}>
            <FontAwesome5 name="th-list" size={16} color="#aaa" />
            <ActionButtonText disabled>{buttonTittle}</ActionButtonText>
          </ActionButton>
          <AssignTaskButton color={buttonTittle!='Product Interest'?true:false} onPress={()=>handleIconPress(data)}>
            {buttonTittle!='Product Interest'?<AssignTaskText>Add Task</AssignTaskText>:<AssignTaskText>Assign Task</AssignTaskText>}
          </AssignTaskButton>
        </ActionButtonsContainer>
      
    </CardContainer>
    );
};

export default CardItem


// return (
//   <View
//     style={{
//       backgroundColor: cardColour,
//       borderRadius: SIZES.font,
//       marginBottom: SIZES.extraLarge,
//       margin: SIZES.base,
//       ...SHADOWS.dark,
//     }}
//   >
//     <View
//       style={{
//         width: "100%",
//         height:80,
//       }}
//     >
//       <Image
//         source={{ uri: data.customer?data.customer.image: data.image }}
//         resizeMode="contain"
//         style={{
//           width: "40%",
//           height: "80%",
//           borderRadius: SIZES.font,
//           marginTop:10,
//           marginLeft:10,
//           borderTopRightRadius: SIZES.font,
//         }}
//       />

//       <CircleButton imgUrl={assets.heart} 
//                     handlePress={handleIconPress} data={data} icon={icon} right={10} top={10} />
//     </View>
        
//     {data.task_date && (<SubInfo task_date={data.task_date}/>)}    
    
//     <View style={{ width: "100%", padding: SIZES.font }}>
//       <CardTitle
//         title={data.name}
//         subTitle={sub_title}
//         titleSize={SIZES.extraLarge}
//         subTitleSize={SIZES.small}
//       />
      
//       <View
//         style={{
//           marginTop: SIZES.font,
//           flexDirection: "row",
//           justifyContent: "space-between",
//           alignItems: "center",
//         }}
//       >
//         {isAmtApplicable && (<EthPrice price={data.outstanding_amt}
//                                        data={data}
//                                        handlePress={ handleDisplayPress }/>)}
//         { iconName1 && (
//         <CircleButton imgUrl={assets.heart} 
//                     handlePress= {handleIconName1Press} data={data} icon={iconName1} right={0} bottom={5} />  
//           )}
//         { iconName2 && (
//           <CircleButton imgUrl={assets.heart} 
//                     handlePress={handleIconNavigation2} data={data} icon={iconName2} right={50} bottom={5} />  
//           )}
        
//         <RectButton
//           minWidth={120}
//           fontSize={SIZES.font}
//           handlePress={handleNavigation}
//           title={buttonTittle}
//         />
        
//       </View>
//     </View>
//   </View>
// );
// };
