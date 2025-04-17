import React from "react";
import { View, Image, Text, TouchableOpacity } from "react-native";

import { SIZES, COLORS, SHADOWS, assets } from "../constant_s";
import { colors } from "../Styles/appStyle";

export const CardTitle = ({ title, subTitle, titleSize, subTitleSize }) => {
  return (
    <View style={{ width: '100%', paddingVertical: 8, paddingHorizontal: 16 }}>
    <Text
      style={{
        fontSize: 20,
        color:" #454545",
        fontWeight: '500',
        marginBottom: 4, // Margin between title and subtitle
      }}
    >
      {title}
    </Text>
    <Text
      style={{
        fontSize: 15,
        color: '#333',
        fontWeight: '400', // Semi-bold for subtitle
      }}
    >
      {subTitle}
    </Text>
  </View>
  );
};

export const EthPrice = ({ price, data, handlePress }) => {

  const onPress = () => {
    handlePress({data})
  }

  if (price){
  
  return (
    
    <View style={{ flexDirection: "row", alignItems: "center", }}>
      
      <TouchableOpacity
      style={{
        backgroundColor: colors.black,
        padding: SIZES.small,
        borderRadius: SIZES.extraLarge,
        alignItems:'center',
        minWidth: 200,
        }}
        onPress={onPress}
      >
      <Text
        style={{
          fontSize: SIZES.font,
          fontWeight: 'bold',
          color: colors.red,
          flex: 1,
          alignItems:'center'
          
        }}
      > 
        <Image
        source={assets.rupeeB}
        resizeMode="contain"
        style={{ width: 20, height: 20, paddingRight: 15, marginLeft:10 , }}
        />
      
        - {price} - DUE AMT
      </Text>
      </TouchableOpacity>
      
    </View>
  );
      } else {

        return (
    
          <View style={{ flexDirection: "row", alignItems: "center", }}>
            <Image
              source={assets.rupeeB}
              resizeMode="contain"
              style={{ width: 20, height: 20, paddingRight: 15, marginLeft:10 , }}
              />
            
            <Text
              style={{
                fontSize: SIZES.font,
                fontWeight: 'bold',
                color: colors.black,
                alignItems:'center',
                backgroundColor: colors.lightgreen,
                borderRadius:8,
                
              }}
            > 
              
              {price ? price: ' NO outstanding'} {price ? ' - DUE AMT': ''}
            </Text>
            
          </View>
        );

      }
};

const ImageCmp = ({ imgUrl, index }) => {
  return (
    <Image
      source={imgUrl}
      resizeMode="contain"
      style={{
        width: 48,
        height: 48,
        marginLeft: index === 0 ? 0 : -SIZES.font,
      }}
    />
  );
};

export const EndDate = ({date, colour, dateTitle}) => {

  const bgColor = colour? colour: colors.offwhite
  const textColor = colour? colors.white: colors.navyblue
  
  return (
    <View
      style={{
        paddingHorizontal: SIZES.font,
        paddingVertical: SIZES.base,
        backgroundColor: bgColor,
        borderRadius: SIZES.font,
        justifyContent: "center",
        alignItems: "center",
        ...SHADOWS.light,
        elevation: 1,
        maxWidth: "50%",
      }}
    >
      <Text
        style={{
          fontSize: SIZES.medium,
          fontWeight:'400',
          color: textColor,
        }}
      >
        {dateTitle? dateTitle : 'Planned On'}
      </Text>
      <Text
        style={{
          fontSize: SIZES.medium,
          color: textColor,
        }}
      >
        {date}
      </Text>
    </View>
  );
};

export const SubInfo = ({task_date, dateColour, dateTitle, data, handlePress}) => {

  const onPress = () => {
    handlePress(data)
  }

  if (handlePress){
    return (
      <TouchableOpacity onPress={onPress}>
      <View
        style={{
          width: "100%",
          paddingHorizontal: SIZES.font,
          marginTop: -SIZES.extraLarge,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      > 
        <View style={{ flexDirection: "row" }}></View>
        <EndDate date={task_date}
                 colour={dateColour}
                 dateTitle={dateTitle}
        />
      </View>
      </TouchableOpacity>
    );  
  }

  return (
    <View
      style={{
        width: "100%",
        paddingHorizontal: SIZES.font,
        marginTop: -SIZES.extraLarge,
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    > 
      <View style={{ flexDirection: "row" }}></View>
      <EndDate date={task_date}
               colour={dateColour}
               dateTitle={dateTitle}
      />
    </View>
  );
};