import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AttendanceScreen from '../../src/screens/AttendanceScreen';


const index = () => {

  return (
    <View style={{ flex: 1,
        }}>
            <AttendanceScreen/>
    </View>
  )
}

export default index

const styles = StyleSheet.create({})