import {View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { colors } from '../../Styles/appStyle' 
import { MaterialIcons } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';



const CustomButton = ({onPress, text, type = "PRIMARY", bgColor, fgColor, icon}) => {
  return (
    <View style={{flexDirection: 'row'}}>
    <TouchableOpacity 
        onPress={onPress} 
        style={[
            styles.container, 
            styles[`container_${type}`],
            bgColor ? {backgroundColor: bgColor} : {}
        ]}>
        {icon && (
          <Ionicons name="bag-check" size={24} color="white"/>
        )}
                    
        <Text 
            style={[
                styles.text, 
                styles[`text_${type}`],
                fgColor ? {color: fgColor}: {}]}> 
                
                {text}
        </Text>
    </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        
        width: '100%',
        padding: 12,
        marginVertical: 10,
        marginHorizontal: 0,
        alignItems: 'center',
        borderRadius: 10,
        flexDirection:'row',
        justifyContent: 'center',
    },
    container_PRIMARY: {
        backgroundColor: '#3871F3',
    },
    container_SECONDARY: {
        backgroundColor: colors.secondary,
    },
    container_LARGE: {
        backgroundColor: colors.grey,
        height:84,
        width: '100%',
        borderRadius: 10,
        padding:15,
        marginVertical:10,
        flexDirection:'row',
        justifyContent: 'flex-start',
    },
    container_LINK_ONLY: {
        
    },
    text: {
        fontWeight: 'bold',
        color: 'white',
        fontSize:16,
        marginLeft: 10,  
    },
    text_LINK_ONLY: {
        color: 'gray',
    },
    text_LARGE: {
        fontSize: 25,
        color: colors.navyblue,
        fontWeight: 'bold',
        marginLeft: 10,    
    },
})
export default CustomButton