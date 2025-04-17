import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AttendanceStatus from '../../src/screens/AttendanceStatus';
import { useRoute } from '@react-navigation/native';


const index = () => {
  const route = useRoute();
  const emp_data_id = route?.params?.id
  // console.log(emp_data_id,'jjjjjj')

  return (
    <View style={{ flex: 1}}>
            <AttendanceStatus id={emp_data_id}/>
    </View>
  )
}

export default index
