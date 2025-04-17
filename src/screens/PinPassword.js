import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginURL } from '../../src/services/ConstantServies';
import { publicAxiosRequest } from '../../src/services/HttpMethod';
const PinPassword = ({modalVisible,setModalVisible}) => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [newPin, setNewPin] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const shakeAnim = new Animated.Value(0); // Animation for error message
  
    const triggerShake = () => {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    };
  
    const handleForgotPin = async () => {
      // Basic validation
      if (!userId || !password || !newPin) {
        setErrorMessage('All fields are required!');
        triggerShake();
        return;
      }
  
      if (newPin.length !== 4) {
        setErrorMessage('PIN must be 4 digits!');
        triggerShake();
        return;
      }
  
      try {
        // Make API call
        const res =  await publicAxiosRequest.post(loginURL, {
          username: userId,
          password: password,
        });
        const userToken = res.data['key']
        if (userToken) {
          // If login is successful, close modal and show success message
          await AsyncStorage.setItem('userPin', newPin);
          await AsyncStorage.setItem('username', userId);
          await AsyncStorage.setItem('Password', password);
          Alert.alert('Success', 'Your new PIN has been set.');
          setModalVisible(false);
          setErrorMessage('');
          setUserId('');
          setPassword('');
          setNewPin('');
        } else {
          // Show error message if response is not successful
          setErrorMessage('Invalid credentials. Please try again.');
          triggerShake();
        }
      } catch (error) {
        console.error(error);
        setErrorMessage('An error occurred. Please check your credentials.');
        triggerShake();
      }
    };

  return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Reset Your PIN</Text>
            <TextInput
              style={styles.input}
              placeholder="User ID"
              value={userId}
              onChangeText={setUserId}
              placeholderTextColor="#bbb"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#bbb"
            />
            <TextInput
              style={styles.input}
              placeholder="New 4-Digit PIN"
              keyboardType="numeric"
              maxLength={4}
              value={newPin}
              onChangeText={setNewPin}
              secureTextEntry
              placeholderTextColor="#bbb"
            />
            {errorMessage ? (
              <Animated.Text style={[styles.error, { transform: [{ translateX: shakeAnim }] }]}>
                {errorMessage}
              </Animated.Text>
            ) : null}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleForgotPin}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
  );
};

export default PinPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotText: {
    fontSize: 16,
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
    color: '#333',
  },
  error: {
    color: '#ff6b6b',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});
