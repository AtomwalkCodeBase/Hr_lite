import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ApproveLeave from '../../src/screens/ApproveLeave'
import { useRoute } from '@react-navigation/native';

const index = () => {

  const route = useRoute();
  const data = route?.params;
  // const emp_data_id = leave.id
  // console.log(emp_data_id,"data--->")
  return (
    <View style={{ flex: 1,
        
        }}>
            <ApproveLeave data={data}/>
    </View>
  )
}

export default index

const styles = StyleSheet.create({})