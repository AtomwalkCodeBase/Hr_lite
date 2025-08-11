import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useRoute } from '@react-navigation/native';
import TravelList from '../../src/screens/TravelList';


const index = () => {
  const route = useRoute();
  const data = route?.params;

  return (
    <View style={{ flex: 1,
        
        }}>
            {/* <RequestScreen data={data}/> */}
            <TravelList data={data}/>
    </View>
  )
}

export default index

const styles = StyleSheet.create({})