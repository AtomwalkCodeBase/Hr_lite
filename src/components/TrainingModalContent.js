import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Linking,
  Modal,
  Alert
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { MaterialIcons } from '@expo/vector-icons';
import HeaderComponent from './HeaderComponent';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const responsiveFontSize = (percentage) => Math.round(width * (percentage / 100));

const TrainingModalContent = ({ 
  session, 
  viewMode, 
  onDownloadCertificate,
  onSwitchToDetails,
  onSwitchToCertificate
}) => {
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  if (!session) return null;

  const handleViewFile = (fileUrl) => {
    const fileExtension = fileUrl.split('.').pop().split('?')[0].toLowerCase();

    if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
      setSelectedImageUrl(fileUrl);
      setImageViewerVisible(true);
    } else if (fileExtension === 'pdf') {
      Alert.alert('File Downloading', 'The file is being downloaded.');
      Linking.openURL(fileUrl).catch((err) =>
        console.error('Failed to open URL:', err)
      );
    } else {
      console.warn('Unsupported file type:', fileExtension);
    }
  };

  if (viewMode === 'certificate') {
    return (
      <View style={styles.modalCertificateContainer}>
        <TouchableOpacity 
          style={styles.certificateTouchable}
          activeOpacity={0.9}
          onPress={() => handleViewFile(session.image)}
        >
          <Image
            source={{ uri: session.image }}
            style={styles.certificateImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.downloadButton}
          onPress={onDownloadCertificate}
        >
          <MaterialIcons name="share" size={24} color="white" />
          <Text style={styles.downloadButtonText}>Share Certificate</Text>
        </TouchableOpacity>

        <Modal visible={imageViewerVisible} transparent={true}>
          <ImageViewer
            imageUrls={[{ url: selectedImageUrl }]}
            enableSwipeDown
            onSwipeDown={() => setImageViewerVisible(false)}
            enablePreload
            renderHeader={() => (
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setImageViewerVisible(false)}
              >
                <MaterialIcons name="close" size={30} color="white" />
              </TouchableOpacity>
            )}
          />
        </Modal>
      </View>
    );
  }

  return (
    <ScrollView style={styles.modalDetailsContainer}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>{session.name}</Text>
        <TouchableOpacity onPress={onSwitchToCertificate}>
          <Image
            source={{ uri: session.image }}
            style={styles.modalImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Module:</Text>
        <Text style={styles.detailValue}>{session.module}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Trainer:</Text>
        <Text style={styles.detailValue}>{session.trainer}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Date:</Text>
        <Text style={styles.detailValue}>{session.session_date}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Location:</Text>
        <Text style={styles.detailValue}>{session.location}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Status:</Text>
        <Text style={[styles.detailValue, styles.completedStatus]}>Completed</Text>
      </View>
      
      <View style={styles.descriptionContainer}>
        <Text style={styles.detailLabel}>Description:</Text>
        <Text style={styles.descriptionText}>{session.description}</Text>
      </View>
      
      <View style={styles.remarksContainer}>
        <Text style={styles.detailLabel}>Remarks:</Text>
        <Text style={styles.remarksText}>{session.remarks}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  modalDetailsContainer: {
    flex: 1,
    padding: 15,
  },
  modalCertificateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  certificateTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: responsiveFontSize(4.5),
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  modalImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginLeft: 15,
  },
  certificateImage: {
    width: width * 0.9,
    height: height * 0.7,
    borderRadius: 5,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#555',
    width: 100,
    fontSize: responsiveFontSize(3.8),
  },
  detailValue: {
    flex: 1,
    fontSize: responsiveFontSize(3.8),
    color: '#333',
  },
  completedStatus: {
    color: '#2e7d32',
    fontWeight: '500',
  },
  descriptionContainer: {
    marginTop: 15,
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: responsiveFontSize(3.8),
    color: '#555',
    marginTop: 5,
    lineHeight: 22,
  },
  remarksContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
  },
  remarksText: {
    fontSize: responsiveFontSize(3.8),
    color: '#333',
    marginTop: 5,
    fontStyle: 'italic',
  },
  downloadButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: '80%',
  },
  downloadButtonText: {
    color: 'white',
    fontSize: responsiveFontSize(3.8),
    marginLeft: 10,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    padding: 5,
  },
});

export default TrainingModalContent;