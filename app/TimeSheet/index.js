import { StyleSheet, Text, View } from 'react-native'
import React from 'react';
import TimeSheet from '../../src/screens/TimeSheet';
import { useRoute } from '@react-navigation/native';

const index = () => {
	 const route = useRoute();
	  const emp_data_id = route?.params?.id
  return (
    <View style={{ flex: 1}}>
            <TimeSheet EmpId={emp_data_id}/>
    </View>
  )
}

export default index

const styles = StyleSheet.create({})