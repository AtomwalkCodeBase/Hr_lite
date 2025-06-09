import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Linking,
  Alert,
  Modal,
  TouchableOpacity,
  Text
} from 'react-native';
import { useRouter } from "expo-router";
import HeaderComponent from '../components/HeaderComponent';
import EmptyMessage from '../components/EmptyMessage';
import Loader from '../components/old_components/Loader';
import ApplyButton from '../components/ApplyButton';
import TrainingCard from '../components/TrainingCard';
import ImageViewer from 'react-native-image-zoom-viewer';
import TrainingModalContent from '../components/TrainingModalContent';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import ConfirmationModal from '../components/ConfirmationModal';

const { width, height } = Dimensions.get('window');

const responsiveWidth = (percentage) => width * (percentage / 100);
const responsiveHeight = (percentage) => height * (percentage / 100);

const ModalComponent = ({ 
  isVisible, 
  onClose, 
  title, 
  children, 
  showHeaderButtons = false, 
  headerButtons = [] 
}) => {
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{title}</Text>
          {showHeaderButtons && (
            <View style={styles.headerButtonsContainer}>
              {headerButtons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={button.onPress}
                  style={[
                    styles.headerButton,
                    button.active && styles.activeHeaderButton
                  ]}
                >
                  <MaterialIcons 
                    name={button.icon} 
                    size={24} 
                    color={button.active ? '#2196F3' : '#666'} 
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        {children}
      </SafeAreaView>
    </Modal>
  );
};

const TrainingScreen = (props) => {
  const router = useRouter();
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [empId, setEmpId] = useState(props?.data?.empId || ""); 
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('details');
  const [showShareModal, setShowShareModal] = useState(false);

  // Dummy data for training sessions
  const dummyTrainingSessions = [
    {
      id: 1,
      name: "Advanced React Native Development",
      module: "Mobile App Development",
      trainer: "John Smith",
      session_date: "10-06-2025",
      description: "Learn advanced techniques in React Native including performance optimization and native module integration.",
      status: "E",
      is_active: true,
      remarks: "Completed with distinction",
      location: "Virtual",
      created_date: "04-06-2025",
      t_score: "",
      image: "",
    },
    {
      id: 2,
      name: "Leadership Skills Workshop",
      module: "Soft Skills Development",
      trainer: "Sarah Johnson",
      session_date: "10-06-2025",
      description: "Develop essential leadership skills for managing teams and projects effectively.",
      status: "A",
      is_active: true,
      remarks: "Attendance 100%",
      location: "Office",
      created_date: "01-06-2025",
      t_score: "",
      image: "",
    },
    {
      id: 3,
      name: "Data Analytics Fundamentals",
      module: "Data Science",
      trainer: "Michael Chen",
      session_date: "10-06-2025",
      description: "Introduction to data analysis techniques using Python and popular libraries.",
      status: "S",
      is_active: true,
      remarks: "Final project pending",
      location: "Virtual",
      created_date: "10-05-2025",
      t_score: "85",
      image: "https://lh5.googleusercontent.com/x9e8XGrLZizhMaEXCSPVnmbSIe1E2CRnl28ozVy9yTE37GMoU9rFls0jR5I4GUT1JNiVND_nmGbachCt5rkvBRdxSoBZdOnAYYzCOoeqd81bIoyxlJ44SbkrkHnZlTBXwQ=w1280",
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTrainingSessions(dummyTrainingSessions);
      } catch (error) {
        console.error("Error fetching training sessions:", error);
        Alert.alert("Error", "Failed to load training sessions");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleBackPress = () => {
    router.push({
      pathname: 'MoreScreen' 
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setTrainingSessions([...dummyTrainingSessions]);
      setRefreshing(false);
    }, 1000);
  };

  const handleCardPress = (item) => {
    setSelectedSession(item);
    setViewMode('details');
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedSession(null);
  };
  
  const handleExploreTrainings = () => {  
    router.push({
      pathname: 'AvailableTrainings',
      params: {
        empId,
      },
    });
  };



const handleShareCertificate = () => {
  if (!selectedSession?.image) return;
  setShowShareModal(true);
};

const confirmShare = async () => {
  setShowShareModal(false);
  setLoading(true); // Show loading indicator
  
  try {
    const url = selectedSession.image;
    const filename = url.split('/').pop() || `certificate_${selectedSession.id}.jpg`;
    const fileUri = `${FileSystem.cacheDirectory}${filename}`;

    // Download the file first
    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      fileUri,
      {},
      (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        console.log(`Download progress: ${progress * 100}%`);
      }
    );

    const { uri } = await downloadResumable.downloadAsync();
    
    // Check if sharing is available
    if (await Sharing.isAvailableAsync()) {
      // Share the downloaded local file
      await Sharing.shareAsync(uri, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Share Certificate',
        UTI: 'public.image'
      });
    } else {
      Alert.alert("Sharing not available", "Your device doesn't support sharing this file");
    }
  } catch (error) {
    console.error('Sharing failed:', error);
    Alert.alert("Error", "Failed to share certificate");
  } finally {
    setLoading(false);
  }
};

const cancelShare = () => {
  setShowShareModal(false);
};

  const handleViewDetails = () => setViewMode('details');
  const handleViewCertificate = () => setViewMode('certificate');

  if (selectedImageUrl) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <HeaderComponent headerTitle="View Certificate" onBackPress={() => setSelectedImageUrl(null)} />
        <View style={{ flex: 1 }}>
          <ImageViewer 
            imageUrls={[{ url: selectedImageUrl }]}
            enableSwipeDown={true}
            onSwipeDown={() => setSelectedImageUrl(null)}
            enableImageZoom={true}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderComponent 
        headerTitle="My Trainings" 
        onBackPress={handleBackPress} 
        showActionButton={false}
      />
      <View style={styles.container}>
        {loading ? (
          <Loader visible={loading} />
        ) : (
          <ScrollView 
            style={styles.contentContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#9Bd35A', '#689F38']}
              />
            }
          >
            {trainingSessions.length > 0 ? (
              <FlatList
                data={trainingSessions}
                renderItem={({ item }) => (
                  <TrainingCard 
                    item={{
                      t_session: item,
                      training_status: item.status,
                      t_score: item.t_score,
                      is_qualified: true,
                      remarks: item.remarks,
                      certificate_file: item.image
                    }} 
                    onPress={() => handleCardPress(item)}
                  />
                )}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <EmptyMessage 
                message="No training sessions found"
                subMessage="You haven't enrolled in any training sessions yet"
                iconName="school"
                data="training"
              />
            )}
          </ScrollView>
        )}

        <ApplyButton             
          onPress={handleExploreTrainings}
          buttonText="Explore Available Trainings"
          iconName="search"
        />
      </View>

      <ModalComponent
        isVisible={isModalVisible}
        onClose={closeModal}
        title={selectedSession?.name || "Training Details"}
        showHeaderButtons={true}
        headerButtons={[
          {
            icon: 'info',
            onPress: handleViewDetails,
            active: viewMode === 'details'
          },
          {
            icon: 'picture-as-pdf',
            onPress: handleViewCertificate,
            active: viewMode === 'certificate'
          }
        ]}
      >
        <TrainingModalContent
          isVisible={isModalVisible}
          onClose={closeModal}
          session={selectedSession}
          viewMode={viewMode}
          onDownloadCertificate={handleShareCertificate}
          onSwitchToDetails={handleViewDetails}
          onSwitchToCertificate={handleViewCertificate}
        />
      </ModalComponent>

      <ConfirmationModal
      visible={showShareModal}
      message="Do you want to share this certificate?"
      onConfirm={confirmShare}
      onCancel={cancelShare}
      confirmText="Share"
      cancelText="Cancel"
    />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: responsiveWidth(4),
  },
  contentContainer: {
    flex: 1,
    paddingTop: responsiveWidth(5),
  },
  scrollContent: {
    paddingBottom: responsiveHeight(12),
  },
  listContent: {
    paddingBottom: responsiveHeight(2),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    flex: 1,
  },
  headerButtonsContainer: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 15,
    padding: 5,
  },
  activeHeaderButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
});

export default TrainingScreen;