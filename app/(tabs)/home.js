import { StyleSheet, Text, View } from 'react-native'
import React, { useContext } from 'react'
import { AppContext } from '../../context/AppContext';
import HomeScreen from '../../src/screens/HomeScreen';
import FingerPopup from '../../src/screens/FingerPopup';
const home = () => {
  const { state } = useContext(AppContext);

  return (
    <View style={{flex: 1}}>
      <HomeScreen/>
      <FingerPopup/>
    </View>
  )
}

export default home

const styles = StyleSheet.create({})