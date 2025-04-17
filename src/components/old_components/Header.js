import React from 'react';
import { HeaderView, HeaderTitle, HeaderTitleLong, HeaderButton, HeaderLogo, 
         HeaderSubTitle, HeaderSubTitleText, colors } from '../Styles/appStyle';
import { Image } from 'react-native'
import {Entypo} from "@expo/vector-icons";

const Header = ({label, image, long, icon, onPress, subTitle}) => {
  return (
    <>
    <HeaderView>
      {image && (
        <HeaderLogo>
        <Image
              source={{ uri: image }}
              style={{
                resizeMode: 'stretch',
                width: 80,
                height: 40,
                padding:0,
                borderRadius:6,
              }}
        />
        </HeaderLogo>
      )} 
      {long && (
        <HeaderTitleLong> {label} </HeaderTitleLong>
      )}
      {!long && (
      <HeaderTitle> {label} </HeaderTitle>
      )}
      
      <HeaderButton 
        onPress={onPress}>
        <Entypo name={icon} size={30} color={'#4491FE'} />
      </HeaderButton>
      
    </HeaderView>
    {subTitle && (<HeaderSubTitle><HeaderSubTitleText>{subTitle}</HeaderSubTitleText></HeaderSubTitle>)}
    </>
  )
}

export default Header