import React, { useState } from "react";
import { TouchableOpacity, Text, Image, ActivityIndicator, Modal, View, StyleSheet, Animated } from "react-native";
import styled from "styled-components/native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { colors } from "../Styles/appStyle";
import { MaterialIcons } from "@expo/vector-icons";


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

const FilePicker = ({ label, fileName, fileUri, setFileName, setFileUri, setFileMimeType, error, existingImgUri= null}) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [scaleValue] = useState(new Animated.Value(0));
  
  // const handleFilePick = async () => {
  //   try {
  //     Alert.alert(
  //       "Select Option",
  //       "Choose a file from the library or capture a photo",
  //       [
  //         {
  //           text: "Capture Photo",
  //           onPress: async () => {
  //             setLoading(true);
  //             const cameraPermission =
  //               await ImagePicker.requestCameraPermissionsAsync();
  //             if (cameraPermission.granted) {
  //               let result = await ImagePicker.launchCameraAsync({
  //                 mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //                 allowsEditing: true,
  //                 quality: 1,
  //               });

  //               if (!result.canceled) {
  //                 const compressedImage = await compressImage(
  //                   result.assets[0].uri
  //                 );
  //                 setFileName(
  //                   result.assets[0].fileName || "captured_image.jpg"
  //                 );
  //                 setFileUri(compressedImage.uri);
  //                 setFileMimeType(result.assets[0].mimeType || "image/jpeg");
  //               }
  //             } else {
  //               Alert.alert(
  //                 "Permission Required",
  //                 "Camera permission is required to capture photos"
  //               );
  //             }
  //             setLoading(false);
  //           },
  //         },
  //         {
  //           text: "Choose File",
  //           onPress: async () => {
  //             setLoading(true);
  //             try {
  //               let result = await DocumentPicker.getDocumentAsync({
  //                 type: ["image/*", "application/pdf"],
  //                 copyToCacheDirectory: true,
  //               });

  //               if (result.type !== "cancel") {
  //                 const fileUri = result.assets[0].uri;
  //                 const fileName = result.assets[0].name;
  //                 const mimeType = result.assets[0].mimeType || result.type;

  //                 let compressedImageUri = fileUri;
  //                 if (
  //                   result.assets[0].mimeType &&
  //                   result.assets[0].mimeType.startsWith("image/")
  //                 ) {
  //                   const compressedImage = await compressImage(fileUri);
  //                   compressedImageUri = compressedImage.uri || compressedImage;
  //                 }

  //                 // setFile({
  //                 //   uri: fileUri,
  //                 //   name: fileName,
  //                 //   mimeType: mimeType
  //                 // });
  //                 setFileName(fileName);
  //                 setFileUri(compressedImageUri);
  //                 setFileMimeType(mimeType);
  //               }
  //             } catch (error) {
  //               console.error(
  //                 "Error while picking file or compressing:",
  //                 error
  //               );
  //             }
  //             setLoading(false);
  //           },
  //         },
  //         {
  //           text: "Cancel",
  //           style: "cancel",
  //         },
  //       ],
  //       { cancelable: true }
  //     );
  //   } catch (err) {
  //     Alert.alert(
  //       "No File Selected",
  //       "You have not selected a file. Please select a file."
  //     );
  //   }
  // };

    const openModal = () => {
    setShowModal(true);
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const closeModal = () => {
    Animated.spring(scaleValue, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      setShowModal(false);
    });
  };

  const handleFilePick = async () => {
    openModal();
  };

  const handleCameraCapture = async () => {
    closeModal();
    setLoading(true)
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraPermission.granted) {
        let result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });

        if (!result.canceled) {
          const compressedImage = await compressImage(result.assets[0].uri);
          setFileName(result.assets[0].fileName || "captured_image.jpg");
          setFileUri(compressedImage.uri);
          setFileMimeType(result.assets[0].mimeType || "image/jpeg");
        }
      } else {
         Alert.alert(
                  "Permission Required",
                  "Camera permission is required to capture photos"
                );
        // Show custom permission modal instead of alert
        console.log("Camera permission denied");
      }
    } catch (error) {
      console.error("Camera error:", error);
    }
    setLoading(false);
  };

  const handleFileSelect = async () => {
    closeModal();
    setLoading(true)
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

        setFileName(fileName);
        setFileUri(compressedImageUri);
        setFileMimeType(mimeType);
      }
    } catch (error) {
      console.error("Error while picking file or compressing:", error);
    }
    setLoading(false);
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
       {fileName && <TouchableOpacity onPress={clearData}>
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
        </TouchableOpacity>}
      </View>

      <FileButton onPress={handleFilePick}>
        <InputText numberOfLines={1} ellipsizeMode="middle">{fileName || "No file selected"}</InputText>
        <Icon source={require("../../assets/images/Upload-Icon.png")} />
      </FileButton>

      {loading && (
        <View style={{ marginTop: 16, alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {error && (
        <Text style={{ marginTop: 7, color: colors.red, fontSize: 12 }}>
          {error}
        </Text>
      )}

      {(fileUri || existingImgUri) && ( /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName)) && (
        <Image
          source={{ uri: fileUri ? fileUri : existingImgUri }}
          style={{
            width: 250,
            height: 140,
            borderRadius: 12,
            resizeMode: "cover",
            objectFit: "contain",
            marginTop: 10,
            alignSelf: "center"
          }}
        />
      )}
      <Modal visible={showModal} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackground} 
            onPress={closeModal}
            activeOpacity={1}
          />
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [{ scale: scaleValue }]
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Option</Text>
              <Text style={styles.modalSubtitle}>
                Choose a file from the library or capture a photo
              </Text>
            </View>

            <View style={styles.optionContainer}>
              <TouchableOpacity 
                style={styles.optionButton}
                onPress={handleCameraCapture}
              >
                <View style={styles.optionIconContainer}>
                  <MaterialIcons name="camera-alt" size={24} color="#a970ff" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Capture Photo</Text>
                  <Text style={styles.optionSubtitle}>Take a new photo</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.optionButton}
                onPress={handleFileSelect}
              >
                <View style={styles.optionIconContainer}>
                  <MaterialIcons name="folder" size={24} color="#a970ff" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Choose File</Text>
                  <Text style={styles.optionSubtitle}>Select from library</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#ccc" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={closeModal}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f0ebff",
  },
  clearText: {
    color: "#a970ff",
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    marginTop: 7,
    color: "#f44336",
    fontSize: 12,
  },
  imageContainer: {
    alignItems: "center",
    marginTop: 12,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    resizeMode: "cover",
    borderWidth: 2,
    borderColor: "#a970ff",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    margin: 20,
    maxWidth: 320,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  optionContainer: {
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#f8f6ff",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e8e0ff",
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0ebff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
});

export default FilePicker;
