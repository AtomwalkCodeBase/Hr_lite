import { useRouter } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import {
  Alert,
  ScrollView,
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Dimensions,
  useWindowDimensions
} from 'react-native';
import HeaderComponent from '../components/HeaderComponent';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import ImageViewer from 'react-native-image-zoom-viewer';
import { getEventsResponse, processEventResponse } from '../services/productServices';
import moment from 'moment';
import CommentInputInline from '../components/CommentInputInline';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SuccessModal from '../components/SuccessModal';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const EventDetailsScreen = (props) => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [empId, setEmpId] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserEmpId, setCurrentUserEmpId] = useState(""); 
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [responses, setResponses] = useState([]);
  const [editingResponse, setEditingResponse] = useState(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState("");
  const scrollViewRef = useRef(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchEmpId = async () => {
      try {
        const profileData = await AsyncStorage.getItem('empId');
        console.log("Parsed Data==",profileData)
        if (profileData) {
          setCurrentUserEmpId(profileData);
        }
      } catch (error) {
        console.error("Error fetching empId from AsyncStorage:", error);
      }
    };
  
    fetchEmpId();
    fetchResponse();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);
  
  console.log("Current user empid---",currentUserEmpId)
  
  // Parse the event details from props
  let eventDetails = {};
  try {
    const eventData = props?.event_data?.eventDetails;
    eventDetails = typeof eventData === 'string' ? JSON.parse(eventData) : eventData;
    
    // Set employee ID from event data if available
    if (eventDetails?.emp_id && !empId) {
      setEmpId(eventDetails.emp_id);
    }
  } catch (error) {
    console.error("Error parsing event details:", error);
  }

  const handleBackPress = () => {
    if (selectedImageUrl) {
      setSelectedImageUrl(null);
    } else {
      router.back();
    }
  };


  const fetchResponse = () => {
    setLoading(true);
    setRefreshing(true);
    
    const params = {
      event_id: eventDetails?.id || '',
    };
  
    getEventsResponse(params)
      .then((res) => {
        setResponses(res.data || []);
      })
      .catch((error) => {
        console.error("Fetch Event Responses Error:", error?.response?.data);
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  const handleAddResponse = async (text, fileUri = null, fileName = null, fileMimeType = null) => {
    if (!text.trim() && !fileUri) {
      Alert.alert("Empty Comment", "Please enter a comment or attach an image.");
      return;
    }

    setLoading(true);
    const date = moment();
    const response_date = `${date.format('DD-MM-YYYY')}`;
    
    const formData = new FormData();
    
    if (fileUri) {
      formData.append('r_file', {
        uri: fileUri,
        name: fileName || 'image.jpg',
        type: fileMimeType || 'image/jpeg',
      });
    }
    
    formData.append('emp_id', currentUserEmpId);
    formData.append('event_id', `${eventDetails.id}`);
    formData.append('call_mode', 'ADD');
    formData.append('r_text', text);
    
    try {
      const res = await processEventResponse(formData);
      if (res.status === 200) {
        fetchResponse(); // Refresh comments
        setSuccessModalMessage("Comment posted successfully!");
        setIsSuccessModalVisible(true);
      } else {
        console.error('Unexpected response:', res);
        Alert.alert('Comment Submission Error', 'Failed to add comment. Unexpected response.');
      }
    } catch (error) {
      Alert.alert('Comment Submission Failed', `Failed to add comment: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateResponse = async (responseId, text, fileUri = null, fileName = null, fileMimeType = null) => {
    setLoading(true);
    
    const formData = new FormData();
    
    if (fileUri) {
      formData.append('r_file', {
        uri: fileUri,
        name: fileName || 'image.jpg',
        type: fileMimeType || 'image/jpeg',
      });
    }
    
    formData.append('emp_id', currentUserEmpId);
    // formData.append('event_id', `${eventDetails.id}`);
    formData.append('event_id', `${responseId}`);
    formData.append('call_mode', 'UPDATE');
    formData.append('r_text', text);
    
    try {
      const res = await processEventResponse(formData);
      if (res.status === 200) {
        fetchResponse(); // Refresh comments
        setEditingResponse(null);
        setSuccessModalMessage("Comment updated successfully!");
        setIsSuccessModalVisible(true);
      } else {
        console.error('Unexpected response:', res);
        Alert.alert('Update Error', 'Failed to update comment. Unexpected response.');
      }
    } catch (error) {
      Alert.alert('Update Failed', `Failed to update comment: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResponse = async (responseId) => {
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            
            const formData = new FormData();
            formData.append('emp_id', currentUserEmpId);
            // formData.append('event_id', `${eventDetails.id}`);
            formData.append('event_id', `${responseId}`);
            formData.append('call_mode', 'DELETE');
            
            try {
              const res = await processEventResponse(formData);
              if (res.status === 200) {
                fetchResponse(); // Refresh comments
                setSuccessModalMessage("Comment deleted successfully!");
                setIsSuccessModalVisible(true);
              } else {
                console.error('Unexpected response:', res);
                Alert.alert('Delete Error', 'Failed to delete comment. Unexpected response.');
              }
            } catch (error) {
              Alert.alert('Delete Failed', `Failed to delete comment: ${error.response?.data?.detail || error.message}`);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleViewImage = (imageUrl) => {
    if (imageUrl) {
      setSelectedImageUrl(imageUrl);
    }
  };

  const statusConfig = {
    'A': { label: 'Active', color: '#4CAF50' },
    'P': { label: 'Planned', color: '#2196F3' },
    'C': { label: 'Completed', color: '#9C27B0' },
    'X': { label: 'Cancelled', color: '#F44336' }
  };

  

  const renderResponseItem = (response) => {
    const isCurrentUserResponse = response.r_emp_id === currentUserEmpId;
    const isEventCreator = eventDetails.emp_id === currentUserEmpId;
    const isEditing = editingResponse?.id === response.id;
    
    // Determine bubble width based on screen size
    const bubbleMaxWidth = width * 0.75;
    
    // Show actions if:
    // 1. It's the user's own comment (can edit/delete)
    // 2. OR if user is event creator (can only delete)
    const showActions = isCurrentUserResponse || isEventCreator;
    
    // Determine which buttons to show
    const showEditButton = isCurrentUserResponse && !isEditing;
    const showDeleteButton = isCurrentUserResponse || isEventCreator;
    
    return (
      <Animated.View 
        key={response.id} 
        style={[
          styles.commentContainer,
          isCurrentUserResponse ? styles.currentUserComment : styles.otherUserComment,
          { maxWidth: bubbleMaxWidth },
          { opacity: fadeAnim }
        ]}
      >
        <View style={styles.commentHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {response.r_emp_name?.charAt(0) || 'U'}
              </Text>
            </View>
            <View>
              <Text style={styles.userName}>{response.r_emp_name || 'Unknown User'}</Text>
              <Text style={styles.commentTime}>{response.response_date || 'Just now'}</Text>
            </View>
          </View>
          
          {showActions && (
            <View style={styles.commentActions}>
              {isEditing ? (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => setEditingResponse(null)}
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <Feather name="x" size={18} color="#666" />
                </TouchableOpacity>
              ) : (
                <>
                  {/* Show edit button only if it's the user's own comment */}
                  {showEditButton && (
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => setEditingResponse(response)}
                      hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                      <Feather name="edit-2" size={18} color="#666" />
                    </TouchableOpacity>
                  )}
                  {/* Show delete button for both own comments and if user is event creator */}
                  {showDeleteButton && (
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleDeleteResponse(response.id)}
                      hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                      <Feather name="trash-2" size={18} color="#666" />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          )}
        </View>
  
        {isEditing ? (
          <CommentInputInline
            initialValue={response.r_text}
            onSend={(text, fileUri, fileName, fileMimeType) => 
              handleUpdateResponse(response.id, text, fileUri, fileName, fileMimeType)
            }
            disabled={loading}
            buttonText="Update"
            autoFocus={true}
            placeholder="Edit your comment..."
            isEditing={true}
          />
        ) : (
          <>
            {response.r_text && (
              <Text style={styles.commentText}>{response.r_text}</Text>
            )}
            
            {response.r_file && (
              <TouchableOpacity
                style={styles.commentImageContainer}
                onPress={() => handleViewImage(response.r_file)}
              >
                <Image 
                  source={{ uri: response.r_file }}
                  style={styles.commentImage}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                  <MaterialIcons name="zoom-in" size={22} color="#fff" />
                </View>
              </TouchableOpacity>
            )}
          </>
        )}
      </Animated.View>
    );
  };

  if (selectedImageUrl) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <HeaderComponent headerTitle="View Image" onBackPress={handleBackPress} />
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <ImageViewer
            imageUrls={[{ url: selectedImageUrl }]}
            enableSwipeDown={true}
            onSwipeDown={handleBackPress}
            backgroundColor="#000"
            renderIndicator={() => null}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Determine event card padding based on screen size
  const eventCardPadding = width > 400 ? 20 : 16;
  const eventImageHeight = width > 400 ? 240 : 200;

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      
      <SafeAreaView style={styles.container}>
        <HeaderComponent 
        headerTitle={`Event Details`} 
        onBackPress={handleBackPress} 
      />
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={{ flexGrow: 1 }}
          onContentSizeChange={() => {
            if (responses.length > 0 && !editingResponse) {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }
          }}
        >
          <Animated.View 
            style={[
              styles.eventCard, 
              { 
                opacity: fadeAnim,
                margin: width > 400 ? 20 : 16,
              }
            ]}
          >
            {eventDetails.image && (
              <TouchableOpacity 
                style={[styles.eventImageContainer, { height: eventImageHeight }]}
                onPress={() => handleViewImage(eventDetails.image)}
              >
                <Image 
                  source={{ uri: eventDetails.image }}
                  style={styles.eventImage}
                  resizeMode="cover"
                />
                <View style={styles.viewButton}>
                  <MaterialIcons name="zoom-in" size={width > 400 ? 22 : 20} color="#fff" />
                </View>
              </TouchableOpacity>
            )}
            
            <View style={[styles.eventHeader, { padding: eventCardPadding }]}>
              <Text style={[styles.eventType, { fontSize: width > 400 ? 20 : 18 }]}>
                {eventDetails.event_text}
              </Text>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusIndicator, 
                  { backgroundColor: statusConfig[eventDetails.event_status].color }
                ]} />
                <Text style={styles.statusText}>
                  {statusConfig[eventDetails.event_status].label}
                </Text>
              </View>
            </View>
            
            <View style={[styles.eventInfo, { padding: eventCardPadding, paddingTop: eventCardPadding / 2 }]}>
              <View style={styles.infoItem}>
                <Feather name="calendar" size={width > 400 ? 18 : 16} color="#666" />
                <Text style={[styles.infoText, { fontSize: width > 400 ? 15 : 14 }]}>
                  {eventDetails.event_date || 'No date'}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Feather name="user" size={width > 400 ? 18 : 16} color="#666" />
                <Text style={[styles.infoText, { fontSize: width > 400 ? 15 : 14 }]}>
                  Emp Name: {eventDetails.emp_name || 'N/A'}
                </Text>
              </View>
              {eventDetails.event_type_display && (
                <View style={styles.infoItem}>
                  <Feather name="eye" size={width > 400 ? 18 : 16} color="#666" />
                  <Text style={[styles.infoText, { fontSize: width > 400 ? 15 : 14 }]}>
                    {eventDetails.event_type_display}
                  </Text>
                </View>
              )}
            </View>
            {eventDetails.remarks && (
            <View style={[styles.eventDescription, { padding: eventCardPadding }]}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={[styles.descriptionText, { fontSize: width > 400 ? 15 : 14 }]}>
                {eventDetails.remarks || 'No description available'}
              </Text>
            </View>
            )}
          </Animated.View>
          
          <View style={styles.responsesSection}>
            <Text style={styles.responsesSectionTitle}>Comments</Text>
            {loading && responses.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498db" />
              </View>
            ) : responses.length === 0 ? (
              <View style={styles.emptyResponsesContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={50} color="#ccc" />
                <Text style={styles.emptyResponsesText}>No comments yet</Text>
                <Text style={styles.emptyResponsesSubtext}>Be the first to add a comment</Text>
              </View>
            ) : (
              <View style={styles.responsesList}>
                {responses.map(response => renderResponseItem(response))}
              </View>
            )}
          </View>
        </ScrollView>
        
        {isSuccessModalVisible && (
          <Animated.View style={[styles.successModal, { opacity: fadeAnim }]}>
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.successModalText}>Comment posted successfully!</Text>
          </Animated.View>
        )}
        
        <View style={styles.commentInputContainer}>
          <CommentInputInline
            onSend={handleAddResponse}
            disabled={loading}
            placeholder="Add a comment..."
          />
        </View>
      </SafeAreaView>
      <SuccessModal
  visible={isSuccessModalVisible}
  onClose={() => setIsSuccessModalVisible(false)}
  message={successModalMessage}
/>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImageContainer: {
    width: '100%',
    height: 240,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  viewButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  eventType: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  eventInfo: {
    padding: 20,
    paddingTop: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#555',
  },
  eventDescription: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  descriptionText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  responsesSection: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  responsesSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
    marginLeft: 5,
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyResponsesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyResponsesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
    marginTop: 15,
  },
  emptyResponsesSubtext: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 5,
  },
  responsesList: {
    marginBottom: 20,
  },
  commentContainer: {
    borderRadius: 15,
    padding: 15,
    marginVertical: 8,
    maxWidth: '75%',
  },
  currentUserComment: {
    alignSelf: 'flex-end',
    backgroundColor: '#e3f2fd',
    borderTopRightRadius: 5,
  },
  otherUserComment: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderTopLeftRadius: 5,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  userName: {
    fontWeight: '600',
    color: '#444',
    fontSize: 14,
  },
  commentTime: {
    fontSize: 12,
    color: '#888',
  },
  commentActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 15,
  },
  commentText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  commentImageContainer: {
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  commentImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  successModal: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successModalText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default EventDetailsScreen;