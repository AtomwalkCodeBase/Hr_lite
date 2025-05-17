import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const PinPopup = () => {
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isMandatoryReset, setIsMandatoryReset] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkPopupPreference = async () => {
            const userPin = await AsyncStorage.getItem('userPin');
            console.log("Userr pin--",userPin)
            // Check if PIN is the default '9999'
            if (userPin === '9999') {
                setIsMandatoryReset(true);
                setIsPopupVisible(true);
            } else {
                const hasDeclinedPopup = await AsyncStorage.getItem('declinePinSetup');
                if (!hasDeclinedPopup && !userPin) {
                    setIsPopupVisible(true);
                }
            }
        };
        checkPopupPreference();
    }, []);

    const handleUpdatePin = () => {
        setIsPopupVisible(false);
        router.push({ pathname: 'ResetPassword' });
    };

    const handleYes = () => {
        setIsPopupVisible(false);
        router.push({ pathname: 'ResetPassword' });
    };

    const handleNo = async () => {
        await AsyncStorage.setItem('declinePinSetup', 'true');
        setIsPopupVisible(false);
    };

    const handleClose = () => {
        if (!isMandatoryReset) {
            setIsPopupVisible(false);
        }
        // Don't allow closing if it's mandatory reset
    };

    return (
        <Modal isVisible={isPopupVisible} animationIn="zoomIn" animationOut="zoomOut" backdropOpacity={isMandatoryReset ? 1 : 0.5}>
            <View style={styles.popupContainer}>
                {/* Only show close button if not mandatory reset */}
                {!isMandatoryReset && (
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <Text style={styles.closeText}>X</Text>
                    </TouchableOpacity>
                )}

                {/* Icon */}
                <Image 
                    source={require('../../assets/images/pin.png')}
                    style={styles.icon}
                />

                {/* Message */}
                <Text style={styles.message}>
                    {isMandatoryReset 
                        ? "For security reasons, you must update your default PIN to continue using the app."
                        : "Would you like to update your PIN?"}
                </Text>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    {isMandatoryReset ? (
                        <TouchableOpacity 
                            style={[styles.button, styles.mandatoryButton]} 
                            onPress={handleUpdatePin}
                        >
                            <Text style={styles.buttonText}>UPDATE PIN</Text>
                        </TouchableOpacity>
                    ) : (
                        <>
                            <TouchableOpacity style={[styles.button, styles.yesButton]} onPress={handleYes}>
                                <Text style={styles.buttonText}>YES</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.noButton]} onPress={handleNo}>
                                <Text style={styles.buttonText}>NO</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    popupContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 10,
    },
    closeText: {
        fontSize: 18,
        color: 'black',
    },
    icon: {
        width: 50,
        height: 50,
        marginBottom: 20,
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        padding: 12,
        borderRadius: 5,
        minWidth: 120,
        alignItems: 'center',
    },
    yesButton: {
        backgroundColor: '#4CAF50',
        marginRight: 10,
    },
    noButton: {
        backgroundColor: '#F44336',
    },
    mandatoryButton: {
        backgroundColor: '#2196F3',
        width: '100%',
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default PinPopup;