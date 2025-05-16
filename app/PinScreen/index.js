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
    Dimensions,
    StatusBar,
    Image,
    SafeAreaView
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import Logos from '../../assets/images/Atom_walk_logo.jpg'
import Icon from 'react-native-vector-icons/Ionicons'; 
import PinPassword from '../../src/screens/PinPassword';
import { AppContext } from '../../context/AppContext';
import Loader from '../../src/components/old_components/Loader';
import ErrorModal from '../../src/components/ErrorModal';
import { LinearGradient } from 'expo-linear-gradient';
import ConfirmationModal from '../../src/components/ConfirmationModal';

const { width, height } = Dimensions.get('window');

const scaleWidth = (size) => (width / 375) * size;
const scaleHeight = (size) => (height / 812) * size;

const AuthScreen = () => {
    
    const { logout } = useContext(AppContext);
    const { login, setIsLoading, isLoading } = useContext(AppContext);
    const router = useRouter();
    const [value, setValue] = useState('');
    const [attemptsRemaining, setAttemptsRemaining] = useState(5);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [isNetworkError, setIsNetworkError] = useState(false);
    const [userName, setUserName] = useState('');
    const [showBiomatricOption, setShowBiomatricOption] = useState(false);
    const [showPinInput, setShowPinInput] = useState(!showBiomatricOption);
    const [showFingerprint, setShowFingerprint] = useState(false);
    const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

    const openPopup = () => setModalVisible(true);
    const maxAttempts = 5;
    // const inputRefs = Array(4).fill().map(() => useRef(null));

    useEffect(() => {
        const loadUserName = async () => {
            const name = await AsyncStorage.getItem('profilename');
            if (name) setUserName(name);
        };
        loadUserName();

        const getBioMatricS = async () => {
            const bioStatus = await AsyncStorage.getItem('useFingerprint');
            setShowBiomatricOption(bioStatus === 'true');
            setShowPinInput(bioStatus !== 'true');
        };
        getBioMatricS();
        
        NetInfo.fetch().then(netInfo => {
            if (netInfo.isConnected) {
                // Silent network check on load
            }
        });
    }, []);

    const checkNetworkAndAuthenticate = async () => {
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
            setIsNetworkError(true);
            return;
        }
        handleBiometricAuthentication();
    };

    const handleMPINChange = (text, index) => {
        // const updatedMPIN = [...mPIN];
        // updatedMPIN[index] = text;
        // setMPIN(updatedMPIN);

        // if (text && index < 3) inputRefs[index + 1].current.focus();
        // if (!text && index > 0) inputRefs[index - 1].current.focus();
        setValue(text);
    };

    const handleMPINSubmit = async () => {
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
            setIsNetworkError(true);
            return;
        }
    
        const correctMPIN = await AsyncStorage.getItem('userPin');
        const finalUsername = await AsyncStorage.getItem('empId');
        const userPassword = await AsyncStorage.getItem('userPin');
    
        // setTimeout(() => {
        //     if (mPIN.join('') === correctMPIN) {
        //         setIsAuthenticated(true);
        //         login(finalUsername, userPassword);
        //     } else {
        //         const remaining = attemptsRemaining - 1;
        //         setAttemptsRemaining(remaining);
        //          if (remaining > 0) {
        //              Alert.alert('Incorrect PIN', `${remaining} attempts remaining`);
        //          } else {
        //              Alert.alert('Account Locked', 'Too many incorrect attempts.');
        //          }
        //     }
        // }, 1000);
         if (value === correctMPIN) {
            setIsAuthenticated(true);
            login(finalUsername, userPassword);
        } else {
            const remaining = attemptsRemaining - 1;
            setAttemptsRemaining(remaining);
             if (remaining < 4 ) {
            setErrorMessage('Incorrect PIN,Try again...');
            triggerShake();
            return;
            }
        }
    };

    const handleBiometricAuthentication = async () => {
        const finalUsername = await AsyncStorage.getItem('empId');
        const userPassword = await AsyncStorage.getItem('userPin');

        try {
            const biometricAuth = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to login',
                fallbackLabel: 'Use PIN instead',
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
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#a970ff" barStyle="light-content" />
            
            {/* Bank Logo Area */}
            <LinearGradient
                colors={['#a970ff', '#8a5bda']}
                style={styles.header}
            >
                <View style={styles.logoContainer}>
                    {Logos ? (
                    <Image source={Logos} style={styles.logo} />
                    ) : (
                    <View style={styles.companyPlaceholder}>
                        <MaterialIcons name="business" size={scaleWidth(40)} color="#fff" />
                    </View>
                    )}
                </View>
                <Text style={styles.welcomeText}>Welcome to ATOMWALK HRM</Text>
                {userName && (
                    <View style={styles.userInfoContainer}>
                        <Icon name="person-circle-outline" size={24} color="#fff" />
                        <Text style={styles.userName}>{userName}</Text>
                    </View>
                )}
            </LinearGradient>

            <Loader visible={isLoading} />
            
            <View style={styles.contentContainer}>
                {!showPinInput && !showFingerprint ? (
                    <View style={styles.card}>
                        <Text style={styles.loginOptionsText}>Login Options</Text>
                        <TouchableOpacity 
                            style={styles.authButton}
                            onPress={() => setShowPinInput(true)}
                        >
                            <View style={styles.authButtonIconContainer}>
                                <Icon name="lock-closed-outline" size={22} color="#7722F9" />
                            </View>
                            <Text style={styles.authButtonText}>Login with PIN</Text>
                            <Icon name="chevron-forward-outline" size={20} color="#777" style={styles.authButtonArrow} />
                        </TouchableOpacity>
                        
                        {showBiomatricOption && (
                            <TouchableOpacity 
                                style={styles.authButton}
                                onPress={() => {
                                    setShowFingerprint(true);
                                    checkNetworkAndAuthenticate();
                                }}
                            >
                                <View style={styles.authButtonIconContainer}>
                                    <Icon name="finger-print-outline" size={22} color="#7722F9" />
                                </View>
                                <Text style={styles.authButtonText}>Login with Fingerprint</Text>
                                <Icon name="chevron-forward-outline" size={20} color="#777" style={styles.authButtonArrow} />
                            </TouchableOpacity>
                        )}
                    </View>
                ) : showPinInput ? (
                    <View style={styles.card}>
                        <Text style={styles.title}>Enter your 4-digit PIN</Text>
                        {/* <View style={styles.mPINContainer}>
                            {mPIN.map((value, index) => (
                                <TextInput
                                    key={index}
                                    ref={inputRefs[index]}
                                    style={[
                                        styles.mPINInput,
                                        value ? styles.mPINInputFilled : {}
                                    ]}
                                    maxLength={1}
                                    keyboardType="number-pad"
                                    secureTextEntry={true}
                                    value={value}
                                    onChangeText={(text) => handleMPINChange(text, index)}
                                />
                            ))}
                        </View> */}
                         <TextInput
                                style={[styles.input, { height: 50, width: '100%', backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 10 }]}
                                placeholder="Enter your PIN"
                                secureTextEntry
                                keyboardType="numeric"
                                maxLength={10}
                                value={value}
                                onChangeText={handleMPINChange}
                                placeholderTextColor="#888" // Ensure placeholder text is visible
                            />
                        {/* {attemptsRemaining < maxAttempts && (
                            <View style={styles.errorContainer}>
                                <Icon name="alert-circle-outline" size={16} color="#E02020" />
                                <Text style={styles.errorText}>
                                    Incorrect PIN. {attemptsRemaining} attempts remaining.
                                </Text>
                            </View>
                        )} */}
                        {attemptsRemaining < maxAttempts && (
                            <View style={styles.errorContainer}>
                                <Icon name="alert-circle-outline" size={16} color="#E02020" />
                                <Text style={styles.errorText}>
                                    Incorrect PIN. Please Try Again.
                                </Text>
                            </View>
                        )}

                        
                        <TouchableOpacity 
                            style={[
                                styles.submitButton,
                                value.length < 4  && {
                                    backgroundColor: '#fff',
                                    borderColor: 'rgb(207, 214, 221)',
                                    borderWidth: 1,
                                    shadowColor: 'transparent',
                                    elevation: 0,
                                }
                            ]}
                            onPress={handleMPINSubmit}
                            disabled={ value.length < 4 }
                        >
                            <Text style={[
                                styles.submitButtonText,
                                 value.length < 4 && { color: '#666' }
                            ]}>
                                LOGIN
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={() => setIsLogoutModalVisible(true)}
                            style={styles.forgotContainer}
                        // onPress={openPopup}
                        >
                            <Icon name="log-out-outline" size={16} color="#9C5EF9" />
                            <Text style={styles.forgotText}>Logout</Text>
                        </TouchableOpacity>
                        
                        {showBiomatricOption && (
                            <TouchableOpacity 
                                style={styles.backButton}
                                onPress={() => setShowPinInput(false)}
                            >
                                <Icon name="arrow-back-outline" size={16} color="#9C5EF9" style={styles.backIcon} />
                                <Text style={styles.backButtonText}>Back to Login Options</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <View style={styles.card}>
                        <Text style={styles.title}>Fingerprint Authentication</Text>
                        <TouchableOpacity 
                            style={styles.fingerprintIconContainer} 
                            onPress={() => {
                                checkNetworkAndAuthenticate();
                            }}
                        >
                            <Icon name="finger-print" size={80} color="#9C5EF9" />
                        </TouchableOpacity>

                        <Text style={styles.fingerprintHint}>
                            Place your finger on the sensor to authenticate
                        </Text>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={() => setShowFingerprint(false)}
                        >
                            <Icon name="arrow-back-outline" size={16} color="#9C5EF9" style={styles.backIcon} />
                            <Text style={styles.backButtonText}>Back to Login Options</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.securityNote}>
                    <Icon name="shield-checkmark-outline" size={20} color="#FFA726" style={styles.noteIcon} />
                    <View style={styles.noteContent}>
                        <Text style={styles.noteTitle}>Security Notice</Text>
                        <Text style={styles.noteText}>
                            <Text style={styles.bulletPoint}>• </Text>
                            Never share your PIN with anyone
                            {'\n'}
                            <Text style={styles.bulletPoint}>• </Text>
                            If you've updated your PIN using web app, please logout and login again with your new PIN
                            (Login with PIN - Logout)
                        </Text>
                    </View>
                </View>
                
                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2025 ATOMWALK. All rights reserved.</Text>
                    <Text style={styles.versionText}>Version 1.0.15</Text>
                </View>
            </View>

            <PinPassword setModalVisible={setModalVisible} modalVisible={modalVisible} />
            <ErrorModal
                visible={isNetworkError}
                message="No internet connection. Please check your network and try again."
                onClose={() => setIsNetworkError(false)}
                onRetry={checkNetworkAndAuthenticate}
            />
            <ConfirmationModal
            visible={isLogoutModalVisible}
            message="Are you sure you want to logout?"
            onConfirm={() => {
              setIsLogoutModalVisible(false);
              logout();
            }}
            onCancel={() => setIsLogoutModalVisible(false)}
            confirmText="Logout"
            cancelText="Cancel"
          />
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        paddingTop: 100,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        borderRadius: scaleWidth(10),
        overflow: 'hidden'
    },
    
    logo: {
        width: scaleWidth(150),
        height: scaleHeight(60),
        borderRadius: scaleWidth(10),
        resizeMode: 'contain',
        backgroundColor: '#fff',
    },
    
    
    logoText: {
        color: '#F37A20',
        fontSize: 16,
        fontWeight: 'bold',
    },
    welcomeText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '600',
        textAlign: 'center',
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    userName: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        justifyContent: 'space-between',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 25,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
    },
    loginOptionsText: {
        fontSize: 16,
        color: '#444',
        marginBottom: 20,
        fontWeight: '500',
        alignSelf: 'flex-start',
    },
    authButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 10,
        width: '100%',
        marginBottom: 15,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    authButtonIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F6F0FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    authButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
    authButtonArrow: {
        marginLeft: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 25,
        color: '#333',
        textAlign: 'center',
    },
    mPINContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
        width: '70%',
    },
    mPINInput: {
        width: 45,
        height: 50,
        borderWidth: 1,
        borderColor: '#AB74FD',
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 18,
        marginHorizontal: 5,
        backgroundColor: '#FFFFFF',
        color: '#333',
    },
    mPINInputFilled: {
        borderColor: '#AB74FD',
        backgroundColor: '#F4ECFF',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    errorText: {
        color: '#E02020',
        marginLeft: 5,
        fontSize: 14,
    },
    submitButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 8,
        marginBottom: 15,
        width: '100%',
        shadowColor: '#CDADFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    forgotContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    forgotText: {
        color: '#9C5EF9',
        marginLeft: 5,
        fontWeight: '500',
    },
    fingerprintIconContainer: {
        marginVertical: 30,
        padding: 20,
        backgroundColor: '#F6F0FF',
        borderRadius: 60,
    },
    fingerprintHint: {
        color: '#555',
        fontSize: 14,
        marginBottom: 30,
        textAlign: 'center',
        lineHeight: 20,
    },
    backButton: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backIcon: {
        marginRight: 5,
    },
    backButtonText: {
        color: '#9C5EF9',
        fontSize: 14,
        fontWeight: '500',
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
        paddingVertical: 15,
    },
    footerText: {
        color: '#888',
        fontSize: 12,
    },
    versionText: {
        color: '#888',
        fontSize: 12,
        marginTop: 5,
    },
    input: {
    color: '#9C5EF9',
    fontSize: 16,
    padding: 10, // Added padding for better visibility
    letterSpacing: 2, // Adds spacing between characters for PIN input
    borderWidth: 1, // Added border for visibility
    borderColor: '#ddd', // Light gray border
    borderRadius: 8, // Rounded corners
    backgroundColor: '#fff', // White background
    marginBottom:15
},
securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 167, 38, 0.1)', // 10% opacity of warning color
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA726',
    width: '100%',
},
noteIcon: {
    marginRight: 12,
    marginTop: 3,
},
noteContent: {
    flex: 1,
},
noteTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFA726',
    marginBottom: 6,
},
noteText: {
    fontSize: 13,
    color: '#757575',
    lineHeight: 20,
},
bulletPoint: {
    fontWeight: 'bold',
    color: '#FFA726',
},
});

export default AuthScreen;