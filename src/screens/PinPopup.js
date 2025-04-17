import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const PinPopup = () => {
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const router = useRouter();
    useEffect(() => {
        const checkPopupPreference = async () => {
            const hasDeclinedPopup = await AsyncStorage.getItem('declinePinSetup');
            const userPin = await AsyncStorage.getItem('userPin');
            if (!hasDeclinedPopup&&!userPin) {
                setIsPopupVisible(true);
            }
        };
        checkPopupPreference();
    }, []);

    const handleYes = () => {
        setIsPopupVisible(false);
        router.push('ResetPassword'); // Navigate to PinSetup screen
    };

    const handleNo = async () => {
        await AsyncStorage.setItem('declinePinSetup', 'true');
        setIsPopupVisible(false);
    };

    const handleClose = () => {
        setIsPopupVisible(false);
    };

    return (
        <Modal isVisible={isPopupVisible} animationIn="zoomIn" animationOut="zoomOut">
            <View style={styles.popupContainer}>
                {/* Close Icon */}
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <Text style={styles.closeText}>X</Text>
                </TouchableOpacity>

                {/* Icon */}
                <Image source={require('../../assets/images/pin.png')}
                    style={styles.icon}
                />

                {/* Message */}
                <Text style={styles.message}>
                    Would you like to set your PIN?
                </Text>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.yesButton} onPress={handleYes}>
                        <Text style={styles.buttonText}>YES</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.noButton} onPress={handleNo}>
                        <Text style={styles.buttonText}>NO</Text>
                    </TouchableOpacity>
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
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    yesButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    noButton: {
        backgroundColor: '#F44336',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default PinPopup;
