import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, useRouter } from 'expo-router';
import Logo from '../assets/images/Atom_walk_logo.jpg'

export default function Index() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const userToken = AsyncStorage.getItem('userToken');
// if(userToken){
//   return(
//     <Redirect href={"/home"}></Redirect>
//   )
// }
  useEffect(() => {
    const checkUserToken = async () => {
      try {
        // Check for token in AsyncStorage
        const userToken = await AsyncStorage.getItem('userToken');
        const storedMPIN = await AsyncStorage.getItem('userPin');
        if(storedMPIN){
          router.replace('/PinScreen');
        } 
        else if (userToken) {
          // If token exists, navigate to HomeScreen
          router.replace('/home');
        } else {
          // Else, navigate to AuthScreen
          router.replace('/AuthScreen');
        }
      } catch (error) {
        console.error('Error fetching userToken from AsyncStorage', error);
      } finally {
        setLoading(false); // Stop loading after check
      }
    };

    checkUserToken();
  }, []);

  if (loading) {
    // Show loader with an image while loading
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image
          source={Logo} // Replace with actual loader image path
          style={{ width: 100, height: 100 }}
        />
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text>Redirecting...</Text>
    </View>
  );
}
