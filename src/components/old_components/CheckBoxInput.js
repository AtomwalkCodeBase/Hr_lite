import { View, Text, StyleSheet } from 'react-native'
import {React, useState} from 'react'
import { CheckBox } from '@rneui/themed';
import { colors } from '../Styles/appStyle';


const CheckBoxInput = ({
    label,
    title,
    onCheckAddTask,
    checked,
    error
}) => {
  
  const [isChecked, setIsChecked] = useState(checked == null?true:checked)
  
  const handleIsChecked = (isChecked) => {
    setIsChecked(!isChecked);
    onCheckAddTask(!isChecked)
    };   

  return (
    <View style={{marginBottom: 10}}>
        {label && (
        <Text style={style.label}>{label}</Text>
        )}  
      
        <View style={[
          style.inputContainer,
          {
            borderColor: error
              ? colors.red
              : colors.light,
            alignItems: 'center',
          },
        ]}>
            <CheckBox
                center
                title={title}
                checked={isChecked}
                onPress={() => handleIsChecked(isChecked)}
            />
        </View>
        {error && (
            <Text style={{marginTop: 7, color: colors.red, fontSize: 12}}>
            {error}
            </Text>
        )}
    </View>
    
  );
};

const style = StyleSheet.create({
    label: {
      marginVertical: 3,
      fontSize: 12,
      color: colors.black,
    },
    inputContainer: {
      height: 55,
      backgroundColor: colors.light,
      flexDirection: 'row',
      paddingHorizontal: 0,
      borderWidth: 0.5,
      borderRadius: 6
    },
    checkbox: {
        alignSelf: 'center',
    },
    label: {
        margin: 8,
    },
  });
  
export default CheckBoxInput