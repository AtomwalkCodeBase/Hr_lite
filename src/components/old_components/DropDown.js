import { View, Text, StyleSheet } from 'react-native'
import {React, useState} from 'react'
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import { colors } from '../../Styles/appStyle';

const DropDown = ({
    inputlabel,
    inputvalue, 
    placeholder='',
    data = [] , 
    error,
    onSelect = () => {}
}) => {
    const [isFocus, setIsFocus] = useState(false);
    const [value, setValue] = useState(inputvalue);

    const onSelectedItem = (val) => {
        setIsFocus(false)
        onSelect(val)
        setValue(val)
        };

    const renderLabel = () => {
        if (value || isFocus) {
          return (
            <Text style={[styles.label, isFocus && { color: 'blue' }]}>
              {inputlabel}
            </Text>
          );
        }
        return null;
      };

  return (
    <View style={{marginBottom: 10}}>
      {inputlabel && (
        <Text style={styles.label}>{inputlabel}</Text>
      )}  
      
    
        <View style={styles.container}>
        <Dropdown
          style={[styles.dropdown, isFocus && { borderColor: colors.blue }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={data}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Select ' + placeholder : '...'}
          searchPlaceholder="Search..."
          value={value}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            onSelectedItem(item.value);
          }}
          renderLeftIcon={() => (
            <AntDesign
              style={styles.icon}
              color={isFocus ? 'blue' : 'black'}
              name="down-square-o"
              size={20}
            />
          )}
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

const styles = StyleSheet.create({
    container: {
      height: 50,
      backgroundColor: colors.light,
      padding: 0,
      borderWidth: 0,
      borderRadius: 8

    },
    dropdown: {
      height: 50,
      borderColor: colors.light,
      borderWidth: 0.5,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8
    },
    icon: {
      marginRight: 5,
    },
    labelDropdown: {
      position: 'absolute',
      backgroundColor: 'white',
      left: 22,
      top: 5,
      zIndex: 999,
      paddingHorizontal: 8,
      fontSize: 14,
    },
    label: {
        marginVertical: 3,
        fontSize: 15,
        color: colors.black,
    },
    placeholderStyle: {
      fontSize: 16,
    },
    selectedTextStyle: {
      fontSize: 16,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },
  });

export default DropDown