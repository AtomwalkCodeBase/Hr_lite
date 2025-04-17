import React, {useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useRouter } from "expo-router";
import HeaderComponent from '../components/HeaderComponent';
const ResetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const [userPin, setUserPin] = useState(null);

  useEffect(() => {
      const fetchUserPin = async () => {
          const storedPin = await AsyncStorage.getItem('userPin');
          setUserPin(storedPin); // storedPin will be `null` if no value is found
      };
      fetchUserPin();
  }, []);
  const shakeAnim = new Animated.Value(0); // Animation for shaking error message

  
  const navigation = useNavigation();

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmit = async () => {
    const userPassword = await AsyncStorage.getItem('Password');
    console.log(userPassword,"yrfyfyr")
    const finalUsername = await AsyncStorage.getItem('Username');
    if (userPassword !== password) {
      setErrorMessage('Wrong Password');
      triggerShake();
      return;
    }
    if (pin !== confirmPassword) {
      setErrorMessage('PIN do not match!');
      triggerShake();
      return;
    } else if (pin.length !== 4) {
      setErrorMessage('Please enter a 4-digit PIN.');
      triggerShake();
      return;
    }

    try {
      await AsyncStorage.setItem('userPin', pin);
      Alert.alert('Success', 'Your PIN and password have been saved.');
      setErrorMessage('');
      router.push({pathname: 'home' });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while saving your data.');
    }
  };

  return (
    <>
    <HeaderComponent headerTitle={`${userPin?"Update Your PIN":"Set Your PIN"}`} onBackPress={() => navigation.goBack()}></HeaderComponent>
    
    <View style={styles.container}>
    
      <Text style={styles.title}>{userPin?"Update Your PIN":"Set Your PIN"}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Your 4-Digit PIN"
        keyboardType="numeric"
        maxLength={4}
        value={pin}
        onChangeText={setPin}
        secureTextEntry
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Confirm PIN"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholderTextColor="#888"
      />
      {errorMessage ? (
        <Animated.Text style={[styles.error, { transform: [{ translateX: shakeAnim }] }]}>
          {errorMessage}
        </Animated.Text>
      ) : null}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>
    </View>
    </>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#45454',
  },
  input: {
    height: 50,
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#ececec',
    color: '#45454',
    fontSize: 16,
  },
  error: {
    color: '#ff6b6b',
    marginBottom: 15,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  submitButton: {
    height: 50,
    backgroundColor: '#007bff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
