import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { LinearGradient } from 'expo-linear-gradient';

const NetworkErrorModal = ({ visible, onNetworkRestore, onRetry }) => {
    const [isVisible, setIsVisible] = useState(visible);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            if (state.isConnected) {
                setIsVisible(false);
                onNetworkRestore(); // Notify parent that network is back
            } else {
                setIsVisible(true);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <Modal visible={isVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.modalContainer}>
                    {/* Ensure Image Path is Correct */}
                    <Image source={require('../../assets/images/no-internet.png')} style={styles.image} />

                    <Text style={styles.title}>No Internet Connection</Text>
                    <Text style={styles.subtitle}>
                        Please check your internet connection. The app will resume when the connection is restored.
                    </Text>

                    <ActivityIndicator size="large" color="white" style={{ marginBottom: 10 }} />

                    {/* Retry Button */}
                    {onRetry && (
                        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    )}
                </LinearGradient>
            </View>
        </Modal>
    );
};

const styles = {
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        width: 320,
        padding: 25,
        borderRadius: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    image: {
        width: 100,
        height: 100,
        marginBottom: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: 'white',
        opacity: 0.9,
        textAlign: 'center',
        marginBottom: 15,
    },
    retryButton: {
        marginTop: 10,
        backgroundColor: '#28a745',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
};

export default NetworkErrorModal;
