import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useRoute } from '@react-navigation/native';
import ClaimScreen from '../../src/screens/ClaimScreen';
import AppointeeScreen from '../../src/screens/AppointeeScreen';


const index = () => {

  const route = useRoute();
  return (
    <View style={{ flex: 1,
        
        }}>
            <AppointeeScreen/>
    </View>
  )
}

export default index

const styles = StyleSheet.create({})