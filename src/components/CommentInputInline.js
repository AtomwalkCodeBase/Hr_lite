import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CommentInputInline = ({ 
  onSend, 
  initialValue = '', 
  disabled = false, 
  buttonText = 'Send',
  autoFocus = false,
  placeholder = "Write a comment...",
  isEditing = false  // Add this new prop

}) => {
  const [text, setText] = useState(initialValue);
  const [imageUri, setImageUri] = useState(null);
  const [imageName, setImageName] = useState(null);
  const [imageMimeType, setImageMimeType] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);
  const animatedHeight = useRef(new Animated.Value(56)).current;

  const handleSend = () => {
    if ((text.trim() || imageUri) && !disabled) {
      onSend(text, imageUri, imageName, imageMimeType);
      setText('');
      setImageUri(null);
      setImageName(null);
      setImageMimeType(null);
    }
  };

  const pickImage = async () => {
    try {
      setIsUploading(true);
      
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'We need access to your photos to upload images.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled) {
        // Compress and resize the image
        const manipResult = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 800 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        // Get file info
        const fileInfo = await FileSystem.getInfoAsync(manipResult.uri);
        
        // Extract filename from URI or use a default
        let fileName = manipResult.uri.split('/').pop();
        if (!fileName || !fileName.includes('.')) {
          fileName = `image_${Date.now()}.jpg`;
        }

        setImageUri(manipResult.uri);
        setImageName(fileName);
        setImageMimeType('image/jpeg');
        
        // Animate input height to accommodate image preview
        Animated.timing(animatedHeight, {
          toValue: 140,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const takePhoto = async () => {
    try {
      setIsUploading(true);
      
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'We need access to your camera to take photos.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled) {
        // Compress and resize the photo
        const manipResult = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 800 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        // Create filename with timestamp
        const fileName = `photo_${Date.now()}.jpg`;

        setImageUri(manipResult.uri);
        setImageName(fileName);
        setImageMimeType('image/jpeg');
        
        // Animate input height
        Animated.timing(animatedHeight, {
          toValue: 140,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setImageUri(null);
    setImageName(null);
    setImageMimeType(null);
    
    // Animate input height back to normal
    Animated.timing(animatedHeight, {
      toValue: 56,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const showAttachmentOptions = () => {
    Alert.alert(
      "Add Attachment",
      "Choose an option to attach",
      [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Library", onPress: pickImage },
        { text: "Cancel", style: "cancel" }
      ],
      { cancelable: true }
    );
  };

  return (
    <Animated.View style={[
      styles.container, 
      { height: animatedHeight },
      isEditing && styles.editingContainer  // Apply editing styles when in edit mode
    ]}>
      {imageUri && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          <TouchableOpacity 
            style={styles.removeImageButton}
            onPress={removeImage}
          >
            <Ionicons name="close-circle" size={24} color="#ff4444" />
          </TouchableOpacity>
        </View>
      )}
      
      <View style={[
        styles.inputContainer,
        isEditing && styles.editingInputContainer  // Wider container in edit mode
      ]}>
        <View style={[
          styles.inputWrapper,
          isEditing && styles.editingInputWrapper  // Wider input wrapper in edit mode
        ]}>
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              isEditing && styles.editingInput  // Larger input in edit mode
            ]}
            placeholder={placeholder}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
            autoFocus={autoFocus}
            editable={!disabled}
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.attachmentButton}
            onPress={showAttachmentOptions}
            disabled={disabled || isUploading}
          >
            <Feather 
              name="paperclip" 
              size={20} 
              color={disabled ? "#ccc" : "#666"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              ((!text.trim() && !imageUri) || disabled) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={(!text.trim() && !imageUri) || disabled}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather 
                name="send" 
                size={18} 
                color="#fff" 
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  imagePreview: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    paddingHorizontal: 16,
    marginRight: 8,
    maxHeight: 120,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  input: {
    fontSize: 16,
    color: '#333',
    maxHeight: 80,
    padding: 0,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  attachmentButton: {
    padding: 8,
    marginRight: 4,
  },
  sendButton: {
    backgroundColor: '#6200ee',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  editingContainer: {
    minHeight: 100,
    paddingHorizontal: 0,  // Remove side padding to maximize width
  },
  editingInputContainer: {
    width: '100%',  // Take full width
    minHeight: 70,
  },
  editingInputWrapper: {
    flex: 1,
    // minHeight: 50,
    maxWidth: '100%',  // Allow to expand fully
    marginRight: 12,   // Slightly larger margin
  },
  editingInput: {
    minHeight: 50,    // Taller input for editing
    fontSize: 16,      // Slightly larger font
    lineHeight: 22,    // Better line spacing
  },
});

export default CommentInputInline;