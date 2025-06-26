import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import EmplyoeeList from '../../src/screens/EmplyoeeList';


const index = () => {

  return (
    <View style={{ flex: 1}}>
            <EmplyoeeList />
    </View>
  )
}

export default index

const styles = StyleSheet.create({})