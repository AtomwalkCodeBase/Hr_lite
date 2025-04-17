import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import styled from 'styled-components/native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { colors } from '../Styles/appStyle';

const FileButton = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 8px;
`;

const Label = styled.Text`
  font-size: 16px;
  margin-top: 15px;
  margin-bottom: 5px;
`;

const InputText = styled.Text`
  color: black;
  font-size: 16px;
  font-weight: normal;
`;

const Icon = styled.Image`
  width: 24px;
  height: 24px;
`;

const FilePicker = ({ label, fileName, setFileName, setFileUri, setFileMimeType, error }) => {
  const handleFilePick = async () => {
    try {
      Alert.alert(
        'Select Option',
        'Choose a file from the library or capture a photo',
        [
          {
            text: 'Capture Photo',
            onPress: async () => {
              const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
              if (cameraPermission.granted) {
                let result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  quality: 1,
                });
  
                if (!result.canceled) {
                  const compressedImage = await compressImage(result.assets[0].uri);
                  setFileName(result.assets[0].fileName || 'captured_image.jpg');
                  setFileUri(compressedImage.uri);
                  setFileMimeType(result.assets[0].mimeType || 'image/jpeg');
                }
              } else {
                Alert.alert('Permission Required', 'Camera permission is required to capture photos');
              }
            },
          },
          {
            text: 'Choose File',
            onPress: async () => {
              try {
                let result = await DocumentPicker.getDocumentAsync({
                  type: ['image/*', 'application/pdf'],
                  copyToCacheDirectory: true,
                });
          
                if (result.type !== 'cancel') {
                  const fileUri = result.assets[0].uri;
                  const fileName = result.assets[0].name;
                  const mimeType = result.assets[0].mimeType || result.type;
          
                  let compressedImageUri = fileUri;
                  if (result.assets[0].mimeType && result.assets[0].mimeType.startsWith('image/')) {
                    const compressedImage = await compressImage(fileUri);
                    compressedImageUri = compressedImage.uri || compressedImage;
                  }
          
                  // setFile({
                  //   uri: fileUri,
                  //   name: fileName,
                  //   mimeType: mimeType
                  // });
                  setFileName(fileName);
                  setFileUri(compressedImageUri);
                  setFileMimeType(mimeType);
                }
              } catch (error) {
                console.error('Error while picking file or compressing:', error);
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        { cancelable: true }
      );
    } catch (err) {
      Alert.alert('No File Selected', 'You have not selected a file. Please select a file.');
    }
  };
  

  const compressImage = async (uri) => {
    let compressQuality = 1;
    const targetSize = 200 * 1024; // 200 KB

    let compressedImage = await ImageManipulator.manipulateAsync(
      uri,
      [],
      { compress: compressQuality, format: ImageManipulator.SaveFormat.JPEG }
    );

    let imageInfo = await FileSystem.getInfoAsync(compressedImage.uri);

    while (imageInfo.size > targetSize && compressQuality > 0.1) {
      compressQuality -= 0.1;

      compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [],
        { compress: compressQuality, format: ImageManipulator.SaveFormat.JPEG }
      );

      imageInfo = await FileSystem.getInfoAsync(compressedImage.uri);
    }

    return compressedImage;
  };

  return (
    <>
      <Label>{label}</Label>
      <FileButton onPress={handleFilePick}>
        <InputText>{fileName || 'No file selected'}</InputText>
        <Icon source={require('../../assets/images/Upload-Icon.png')} />
      </FileButton>
      {error && (
        <Text style={{ marginTop: 7, color: colors.red, fontSize: 12 }}>
          {error}
        </Text>
      )}
    </>
  );
};

export default FilePicker;
