import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useRoute } from '@react-navigation/native';
import AddHelp from '../../src/screens/AddHelp';
import UpdateHelp from '../../src/screens/UpdateHelp';


const index = () => {
  const route = useRoute();
  const data = route?.params;

  return (
    <View style={{ flex: 1 }}>
            <UpdateHelp data={data}/>
    </View>
  )
}

export default index

const styles = StyleSheet.create({})