import { View, Stack, Text, StyleSheet } from 'react-native'
import {React, useState} from 'react'
import { CheckBox } from '@rneui/themed';
import { colors } from '../Styles/appStyle';


const RadioInput = ({
    label,
    title1,
    title2,
    onSelectedType,
    error
    }) => {
    
    const [selectedValue, setValue] = useState('C');
  
    const handleSelected = (selectedValue) => {
        onSelectedType(selectedValue)
        setValue(selectedValue);
    };   

    return (
        <View style={{marginBottom: 10}}>
            {label && (
            <Text style={style.labels}>{label}</Text>
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
                    checked={selectedValue === 'C'}
                    onPress={() => handleSelected('C')}
                    checkedIcon="dot-circle-o"
                    uncheckedIcon="circle-o"
                    title={title1}
                />
                <CheckBox
                    checked={selectedValue === 'L'}
                    onPress={() => handleSelected('L')}
                    checkedIcon="dot-circle-o"
                    uncheckedIcon="circle-o"
                    title={title2}
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
    labels: {
      marginVertical: 3,
      fontSize: 15,
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
  
export default RadioInput