import React, {useState} from "react";
import { TouchableOpacity, Text, Image } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { SIZES, SHADOWS } from "../constant_s";
import { colors } from "../Styles/appStyle";

export const CircleButton = ({ imgUrl, handlePress, data, icon, text, ...props }) => {
  
  const [item, setItem] = useState(data)
  
  const onPress = () => {
    // console.log(item)
    handlePress(item)
  }

  return (
    <TouchableOpacity
      style={{
        width: text? 70: 40,
        height: text? 50: 40,
        backgroundColor: colors.offwhite,
        position: "absolute",
        borderRadius: SIZES.xxLarge,
        alignItems: "center",
        justifyContent: "center",
        ...SHADOWS.light,
        ...props,
      }}
      onPress={onPress}
    >
      {icon && (
        <MaterialIcons name={icon} size={24} color={(icon=='delete')? colors.red: colors.black} />
      )}  
      
      {!icon && (
      <Image
        source={imgUrl}
        resizeMode="contain"
        style={{ width: 24, height: 24 }}
      />
      )}
      {text && (
      <Text style={{textAlign: "center", fontSize: 10,}}>{text}  </Text>
      )}
    </TouchableOpacity>
  );
};

export const RectButton = ({ minWidth, fontSize, handlePress, title, ...props }) => {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.black,
        padding: SIZES.small,
        borderRadius: SIZES.extraLarge,
        minWidth: minWidth,
        ...props,
      }}
      onPress={handlePress}
    >
      <Text
        style={{
          fontSize: 12,
          color: colors.white,
          textAlign: "center",
        }}
      >
        {title ? title : 'View Details'}
      </Text>
    </TouchableOpacity>
  );
};