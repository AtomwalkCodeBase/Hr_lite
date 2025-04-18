import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useRoute } from '@react-navigation/native';
import AddHelp from '../../src/screens/AddHelp';


const index = () => {
  const route = useRoute();
  const data = route?.params;

  return (
    <View style={{ flex: 1,
        
        }}>
            <AddHelp data={data}/>
    </View>
  )
}

export default index

const styles = StyleSheet.create({})