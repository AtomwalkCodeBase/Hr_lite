import { StyleSheet, Text, View } from 'react-native'
import React, { useContext } from 'react'
import { AppContext } from '../../context/AppContext';
import HomeScreen from '../../src/screens/HomeScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import PinPopup from '../../src/screens/PinPopup';
const home = () => {
  const { state } = useContext(AppContext);

  return (
    <SafeAreaView>
      <HomeScreen/>
      <PinPopup></PinPopup>
    </SafeAreaView>
  )
}

export default home

const styles = StyleSheet.create({})