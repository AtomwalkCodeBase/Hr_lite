import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useRoute } from '@react-navigation/native';
import EventScreen from '../../src/screens/EventScreen';
import ShiftScreen from '../../src/screens/ShiftScreen';


const index = () => {
  const route = useRoute();
  const data = route?.params;

  return (
    <View style={{ flex: 1,
        
        }}>
            {/* <EventScreen data={data}/> */}
            <ShiftScreen data={data}/>
    </View>
  )
}

export default index

const styles = StyleSheet.create({})