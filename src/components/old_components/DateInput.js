import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import {React, useState, useEffect} from 'react'
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../Styles/appStyle';

const DateInput = ({
    label,
    iconName,
    date,
    onSelectDate,
    error
}) => {
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [displayText, setDisplayText] = useState(date ? date: 'Select Date');
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
      if(date){
        const d_list = date.split('-');
        var y = d_list[2]; 
        var m = (Number(d_list[1]) - 1).toString();  
        var d =  Number(d_list[0]).toString(); 

        var date_obj = new Date();
        date_obj.setFullYear(y, m, d)
        setSelectedDate(date_obj)
               
      }

    } , []);

    const showDatePicker = () => {
        setDatePickerVisibility(true);
        setIsFocused(true);
        };
        
    const hideDatePicker = () => {
        setDatePickerVisibility(false);
        };
        
    const handleConfirm = (date) => {
        const dt = new Date(date);
        const x = dt.toISOString().split('T');
        const d_lsit = x[0].split('-');
        const d_str = d_lsit[2] + '-' + d_lsit[1] + '-' + d_lsit[0];
        // console.warn(d_str);
        // console.warn("A date has been picked: ", date);
        setDisplayText(d_str);
        setSelectedDate(date)
        onSelectDate(d_str)
        hideDatePicker();
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
              : isFocused
              ? colors.darkBlue
              : colors.light,
            alignItems: 'center',
          },
        ]}>
        <TouchableOpacity 
            onPress={showDatePicker}
            >
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                date={selectedDate}
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
            />
            <Text style={{color: colors.darkBlue, flex: 1, paddingTop:10}}>
                <Icon
                    name={iconName}
                    style={{color: colors.darkBlue, fontSize: 22, marginRight: 20}}
                />
                {' '}
                {displayText}
            </Text>
        </TouchableOpacity>
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
      fontSize: 15,
      marginLeft: 5,
      fontWeight: '400',
      color: colors.black,
    },
    inputContainer: {
      height: 50,
      backgroundColor: colors.light,
      flexDirection: 'row',
      paddingHorizontal:20,
      borderWidth: 0.5,
      borderRadius: 8,
    },
  });
  
export default DateInput