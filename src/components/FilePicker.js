import React from "react";
import { TouchableOpacity, Text, Alert, Image } from "react-native";
import styled from "styled-components/native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { colors } from "../Styles/appStyle";
import { View } from "react-native";


const FileButton = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 8px;
  margin-top: 8px;
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
  flex: 1;
  flex-shrink: 1;
  margin-right: 10px;
  max-width: 80%;
`;

const Icon = styled.Image`
  width: 24px;
  height: 24px;
  flex-shrink: 0;
`;

const FilePicker = ({ label, fileName, fileUri, setFileName, setFileUri, setFileMimeType, error}) => {
  
  const handleFilePick = async () => {
    try {
      Alert.alert(
        "Select Option",
        "Choose a file from the library or capture a photo",
        [
          {
            text: "Capture Photo",
            onPress: async () => {
              const cameraPermission =
                await ImagePicker.requestCameraPermissionsAsync();
              if (cameraPermission.granted) {
                let result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  quality: 1,
                });

                if (!result.canceled) {
                  const compressedImage = await compressImage(
                    result.assets[0].uri
                  );
                  setFileName(
                    result.assets[0].fileName || "captured_image.jpg"
                  );
                  setFileUri(compressedImage.uri);
                  setFileMimeType(result.assets[0].mimeType || "image/jpeg");
                }
              } else {
                Alert.alert(
                  "Permission Required",
                  "Camera permission is required to capture photos"
                );
              }
            },
          },
          {
            text: "Choose File",
            onPress: async () => {
              try {
                let result = await DocumentPicker.getDocumentAsync({
                  type: ["image/*", "application/pdf"],
                  copyToCacheDirectory: true,
                });

                if (result.type !== "cancel") {
                  const fileUri = result.assets[0].uri;
                  const fileName = result.assets[0].name;
                  const mimeType = result.assets[0].mimeType || result.type;

                  let compressedImageUri = fileUri;
                  if (
                    result.assets[0].mimeType &&
                    result.assets[0].mimeType.startsWith("image/")
                  ) {
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
                console.error(
                  "Error while picking file or compressing:",
                  error
                );
              }
            },
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
        { cancelable: true }
      );
    } catch (err) {
      Alert.alert(
        "No File Selected",
        "You have not selected a file. Please select a file."
      );
    }
  };

  const clearData = () => {
    setFileName("");
    setFileUri("");
    setFileMimeType("");
  };

  const compressImage = async (uri) => {
    let compressQuality = 1;
    const targetSize = 200 * 1024; // 200 KB

    let compressedImage = await ImageManipulator.manipulateAsync(uri, [], {
      compress: compressQuality,
      format: ImageManipulator.SaveFormat.JPEG,
    });

    let imageInfo = await FileSystem.getInfoAsync(compressedImage.uri);

    while (imageInfo.size > targetSize && compressQuality > 0.1) {
      compressQuality -= 0.1;

      compressedImage = await ImageManipulator.manipulateAsync(uri, [], {
        compress: compressQuality,
        format: ImageManipulator.SaveFormat.JPEG,
      });

      imageInfo = await FileSystem.getInfoAsync(compressedImage.uri);
    }

    return compressedImage;
  };

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Label>{label}</Label>
        <TouchableOpacity onPress={clearData}>
          <Text
            style={{
              color: colors.primary,
              fontSize: 16,
              fontWeight: 600,
              marginTop: 12,
            }}
          >
            Clear
          </Text>
        </TouchableOpacity>
      </View>

      <FileButton onPress={handleFilePick}>
        <InputText numberOfLines={1} ellipsizeMode="middle">{fileName || "No file selected"}</InputText>
        <Icon source={require("../../assets/images/Upload-Icon.png")} />
      </FileButton>
      {error && (
        <Text style={{ marginTop: 7, color: colors.red, fontSize: 12 }}>
          {error}
        </Text>
      )}

      {fileUri && ( /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName)) && (
        <Image
          source={{ uri: fileUri }}
          style={{
            width: 120,
            height: 120,
            borderRadius: 12,
            resizeMode: "cover",
            borderWidth: 1,
            borderColor: "#eee",
            marginTop: 10,
            alignSelf: "center"
          }}
        />
      )}
    </>
  );
};

export default FilePicker;
