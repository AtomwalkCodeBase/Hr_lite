import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  Modal,
  View,
  StyleSheet,
  Animated,
  Alert
} from "react-native";
import styled from "styled-components/native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system/legacy";
import { colors } from "../Styles/appStyle";
import { MaterialIcons } from "@expo/vector-icons";

/* ================= FUTURE-PROOF MEDIA TYPE ================= */
const getMediaTypes = () => {
  if (ImagePicker.MediaType) {
    return [ImagePicker.MediaType.IMAGE]; // New API
  }
  if (ImagePicker.MediaTypeOptions) {
    return ImagePicker.MediaTypeOptions.Images; // Old API
  }
  return undefined;
};

/* ================= STYLES ================= */
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
  flex: 1;
  margin-right: 10px;
  max-width: 80%;
`;

const Icon = styled.Image`
  width: 24px;
  height: 24px;
`;

/* ================= COMPONENT ================= */
const FilePicker = ({
  label,
  fileName,
  fileUri,
  setFileName,
  setFileUri,
  setFileMimeType,
  error,
  existingImgUri = null,
}) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [scaleValue] = useState(new Animated.Value(0));

  const openModal = () => {
    setShowModal(true);
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.spring(scaleValue, {
      toValue: 0,
      useNativeDriver: true,
    }).start(() => setShowModal(false));
  };

  /* ================= CAMERA ================= */
  const handleCameraCapture = async () => {
    closeModal();
    setLoading(true);

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission Required", "Camera permission is required");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: getMediaTypes(),
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];

        const compressedImage = await compressImage(asset.uri);

        setFileName(asset.fileName || `photo_${Date.now()}.jpg`);
        setFileUri(compressedImage.uri);
        setFileMimeType(asset.mimeType || "image/jpeg");
      }
    } catch (error) {
      console.error("Camera error:", error);
    }

    setLoading(false);
  };

  /* ================= FILE PICK ================= */
  const handleFileSelect = async () => {
    closeModal();
    setLoading(true);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];

        let finalUri = asset.uri;

        if (asset.mimeType?.startsWith("image/")) {
          const compressed = await compressImage(asset.uri);
          finalUri = compressed.uri;
        }

        setFileName(asset.name);
        setFileUri(finalUri);
        setFileMimeType(asset.mimeType || "application/octet-stream");
      }
    } catch (error) {
      console.error("File pick error:", error);
    }

    setLoading(false);
  };

  /* ================= IMAGE COMPRESSION ================= */
  const compressImage = async (uri) => {
    let compressQuality = 1;
    const targetSize = 200 * 1024;

    let compressedImage = await ImageManipulator.manipulateAsync(uri, [], {
      compress: compressQuality,
      format: ImageManipulator.SaveFormat.JPEG,
    });

    let imageInfo = await FileSystem.getInfoAsync(compressedImage.uri);

    while (imageInfo.size > targetSize && compressQuality > 0.1) {
      compressQuality -= 0.1;

      compressedImage = await ImageManipulator.manipulateAsync(
        compressedImage.uri, // ✅ FIXED
        [],
        {
          compress: compressQuality,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      imageInfo = await FileSystem.getInfoAsync(compressedImage.uri);
    }

    return compressedImage;
  };

  const clearData = () => {
    setFileName("");
    setFileUri("");
    setFileMimeType("");
  };

  /* ================= UI ================= */
  return (
    <>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Label>{label}</Label>
        {fileName && (
          <TouchableOpacity onPress={clearData}>
            <Text style={{ color: colors.primary }}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <FileButton onPress={openModal}>
        <InputText numberOfLines={1}>
          {fileName || "No file selected"}
        </InputText>
        <Icon source={require("../../assets/images/Upload-Icon.png")} />
      </FileButton>

      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}

      {error && <Text style={{ color: colors.red }}>{error}</Text>}

      {(fileUri || existingImgUri) &&
        /\.(jpg|jpeg|png|webp)$/i.test(fileName) && (
          <Image
            source={{ uri: fileUri || existingImgUri }}
            style={{ width: 250, height: 140, marginTop: 10 }}
          />
        )}

      {/* ================= MODAL ================= */}
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
        {/* CAMERA OPTION */}
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

        {/* FILE OPTION */}
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
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center" },
 modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },  modalBackground: {
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