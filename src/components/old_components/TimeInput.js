import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import {React, useState, useEffect} from 'react'
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../Styles/appStyle';

const TimeInput = ({
    label,
    time,
    onSelectTime,
    error
}) => {


    const [TimePickerVisible, setTimePickerVisible] = useState(false);
    const [displayText, setDisplayText] = useState(time ? time: 'Select Time');
    const [selectedTime, setSelectedTime] = useState(new Date());

    useEffect(() => {
        if(time){
          const t_list = time.split(':');
            
          const d = new Date();
          d.setHours(Number(t_list[0]), Number(t_list[1]), 0);
          setSelectedTime(d);
          let t_str = ''  
          if(Number(t_list[0]) > 11){
            t_str = (Number(t_list[0]) - 12).toString() + ':' + t_list[1] + ' PM' ;
          }else {
            t_str = time + ' AM' ;
          }

          setDisplayText(t_str);
          onSelectTime(t_str);

        }
  
      } , []);
  
    
    const showTimePicker = () => {
        setTimePickerVisible(true);
    
    };
        
    const hideTimePicker = () => {
        setTimePickerVisible(false);
    };
        
    const handleConfirm = (date) => {
        const dt = new Date(date);
        const time = dt.toLocaleTimeString();
        x = time.split(' ')
        const t_lsit = x[0].split(':');
        const t_str = t_lsit[0] + ':' + t_lsit[1] + ' ' + x[1]
        // console.warn("A time has been picked: ", t_str);
        setDisplayText(t_str);
        onSelectTime(t_str);
        setSelectedTime(date);
        setTimePickerVisible(false);
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
        <TouchableOpacity 
            onPress={showTimePicker}
            >
            <DateTimePickerModal
                isVisible={TimePickerVisible}
                mode="time"
                date={selectedTime}
                onConfirm={handleConfirm}
                onCancel={hideTimePicker}
            />
            <Text style={{color: colors.darkBlue, flex: 1, paddingTop:10}}>
                <Icon
                    name='timer-cog-outline'
                    style={{color: colors.darkBlue, fontSize: 22}}
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
      fontSize: 12,
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
  
export default TimeInput