import React, { useContext, useRef, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import NetInfo from '@react-native-community/netinfo';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ImageBackground,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import Icon from 'react-native-vector-icons/Ionicons'; 
import PinPassword from '../../src/screens/PinPassword';
import { AppContext } from '../../context/AppContext';
import Loader from '../../src/components/old_components/Loader';
import ErrorModal from '../../src/components/ErrorModal';  // import your ErrorModal

const AuthScreen = () => {
    const { login, setIsLoading, isLoading } = useContext(AppContext);
    const router = useRouter();
    const [mPIN, setMPIN] = useState(['', '', '', '']);
    const [attemptsRemaining, setAttemptsRemaining] = useState(5);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [isNetworkError, setIsNetworkError] = useState(false);   // new state for error modal

    const openPopup = () => setModalVisible(true);
    const maxAttempts = 5;
    const inputRefs = Array(4).fill().map(() => useRef(null));

    useEffect(() => {
        // Check network silently on the first load, without showing an error modal
        NetInfo.fetch().then(netInfo => {
            if (netInfo.isConnected) {
                handleBiometricAuthentication();
            }
        });
    }, []);

    const checkNetworkAndAuthenticate = async () => {
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
            setIsNetworkError(true);  // Show error modal only when the user clicks the button
            return;
        }
        handleBiometricAuthentication();
    };
    

    const handleMPINChange = (text, index) => {
        const updatedMPIN = [...mPIN];
        updatedMPIN[index] = text;
        setMPIN(updatedMPIN);

        if (text && index < 3) inputRefs[index + 1].current.focus();
        if (!text && index > 0) inputRefs[index - 1].current.focus();
    };

    const handleMPINSubmit = async () => {
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
            setIsNetworkError(true);
            return;
        }
    
        const correctMPIN = await AsyncStorage.getItem('userPin');
        const finalUsername = await AsyncStorage.getItem('mobileNumber');
        const userPassword = await AsyncStorage.getItem('userPin');
    
        setTimeout(() => {
            if (mPIN.join('') === correctMPIN) {
                setIsAuthenticated(true);
                login(finalUsername, userPassword);
            } else {
                const remaining = attemptsRemaining - 1;
                setAttemptsRemaining(remaining);
                if (remaining > 0) {
                    Alert.alert('Incorrect mPIN', `${remaining} attempts remaining`);
                } else {
                    Alert.alert('Account Locked', 'Too many incorrect attempts.');
                }
            }
        }, 1000);
    };

    const handleBiometricAuthentication = async () => {
        const finalUsername = await AsyncStorage.getItem('mobileNumber');
        const userPassword = await AsyncStorage.getItem('userPin');

        try {
            const biometricAuth = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate using biometrics',
                fallbackLabel: 'Enter mPIN',
            });
            if (biometricAuth.success) {
                setIsAuthenticated(true);
                login(finalUsername, userPassword);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <ImageBackground
            source={require('../../assets/images/Backgroundback.png')}
            style={styles.background}
        >
            <Loader visible={isLoading} />
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>Login with PIN</Text>
                    <View style={styles.mPINContainer}>
                        {mPIN.map((value, index) => (
                            <TextInput
                                key={index}
                                ref={inputRefs[index]}
                                style={styles.mPINInput}
                                maxLength={1}
                                keyboardType="number-pad"
                                value={value}
                                onChangeText={(text) => handleMPINChange(text, index)}
                            />
                        ))}
                    </View>
                    {attemptsRemaining < maxAttempts && (
                        <Text style={styles.errorText}>
                            Incorrect mPIN. {attemptsRemaining} attempts remaining.
                        </Text>
                    )}
                    <TouchableOpacity style={styles.submitButton} onPress={handleMPINSubmit}>
                        <Text style={styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                 {/*   <TouchableOpacity onPress={openPopup}>
                        <Text style={styles.forgotText}>Forgot PIN?</Text>
                    </TouchableOpacity>*/}
                    <TouchableOpacity
                        style={styles.fingerprintButton}
                        onPress={checkNetworkAndAuthenticate}
                    >
                        <Icon name="finger-print" size={30} color="#fff" />
                        <Text style={styles.fingerprintButtonText}>Use Fingerprint</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <PinPassword setModalVisible={setModalVisible} modalVisible={modalVisible} />
            <ErrorModal
                visible={isNetworkError}
                message="No internet connection. Please check your network and try again."
                onClose={() => setIsNetworkError(false)}
                onRetry={checkNetworkAndAuthenticate}  // Retry network check
            />

        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 30,
        width: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    mPINContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    mPINInput: {
        width: 50,
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        textAlign: 'center',
        fontSize: 18,
        marginHorizontal: 5,
        backgroundColor: '#f9f9f9',
        color: '#333',
    },
    errorText: {
        color: 'red',
        marginBottom: 20,
        fontSize: 14,
    },
    submitButton: {
        backgroundColor: '#4d88ff',
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 10,
        marginBottom: 15,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    forgotText: {
        color: '#007BFF',
        marginBottom: 20,
        textDecorationLine: 'underline',
    },
    fingerprintButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#333',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginTop: 10,
    },
    fingerprintButtonText: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 10,
    },
});

export default AuthScreen;
