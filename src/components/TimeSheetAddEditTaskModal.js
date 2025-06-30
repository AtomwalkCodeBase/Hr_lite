import React, { useState } from "react";
import { Modal, TouchableOpacity, View, Text, ScrollView, TextInput, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DropdownPicker from "./DropdownPicker";
import DatePicker from "./DatePicker";
import Loader from "./old_components/Loader";
import ConfirmationModal from "./ConfirmationModal";

const { height } = Dimensions.get("window");


const AddEditTaskModal = ({ visible, onClose, onSubmit, isLoading, formData, setFormData, editingTask, projects, activities}) => {

  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false)

  return(
  <Modal visible={visible} transparent animationType="slide">
    <TouchableOpacity
      activeOpacity={1}
      style={styles.modalOverlay}
      onPress={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={styles.modalContent}
        onPress={() => {}}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {editingTask ? "Edit Task" : "Add New Task"}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* <View style={styles.formGroup}> */}
            <DropdownPicker
              label="Project *"
              data={projects.map((project) => ({
                label: project.title,
                value: project.project_code,
              }))}
              value={formData.project}
              setValue={(value) => setFormData((prev) => ({ ...prev, project: value }))}
            />
          {/* </View> */}
          {/* <View style={styles.formGroup}> */}
            <DropdownPicker
              label="Activity *"
              data={activities.map((activity) => ({
                label: activity.name,
                value: activity.activity_id,
              }))}
              value={formData.activity}
              setValue={(value) => setFormData((prev) => ({ ...prev, activity: value }))}
            />
          {/* </View> */}
          {/* <View style={styles.formGroup}> */}
            <DatePicker
              cDate={formData.date}
              label="Date *"
              setCDate={(date) => setFormData((prev) => ({ ...prev, date }))}
            />
          {/* </View> */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Working Hours *</Text>
            <TextInput
              style={styles.input}
              value={formData.hours}
              onChangeText={(value) => setFormData((prev) => ({ ...prev, hours: value }))}
              placeholder="Enter hours"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Remarks</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.remarks}
              onChangeText={(value) => setFormData((prev) => ({ ...prev, remarks: value }))}
              placeholder="Add remarks..."
              multiline
              numberOfLines={3}
              placeholderTextColor="#999"
            />
          </View>
          {editingTask ? (
            <View style={{flexDirection: "row", gap: 10}}>
            <TouchableOpacity
              style={[styles.addButton, styles.addOnlyButton]}
              onPress={() => onSubmit("UPDATE")}
              disabled={isLoading}
            >
              <Text style={styles.addButtonText}>
                {/* {isLoading ? "UPDATING..." : "UPDATE"} */}
                Update
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.addButton, styles.addOnlyButton]}
              onPress={() => onSubmit("SUBMIT")}
              disabled={isLoading}
            >
              <Text style={styles.addButtonText}>
                {/* {isLoading ? "UPDATING..." : "UPDATE"} */}
                Submit and Update
              </Text>
            </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.addButtonsContainer}>
              <TouchableOpacity
                style={[styles.addButton, styles.addOnlyButton]}
                // onPress={() => onSubmit("ADD_AND_SAVE")}
                onPress={() => setIsConfirmModalVisible(true)}
                disabled={isLoading}
              >
                <Text style={styles.addButtonText}>
                  {/* {isLoading ? "SAVING..." : "SAVE"} */}
                  Save
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addButton, styles.addAndSaveButton]}
                onPress={() => onSubmit("SUBMIT")}
                disabled={isLoading}
              >
                <Text style={styles.addButtonText}>
                  {/* {isLoading ? "SUBMITTING..." : "SUBMIT"} */}
                  SUBMIT
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </TouchableOpacity>
    </TouchableOpacity>

      <ConfirmationModal
        visible={isConfirmModalVisible}
        message="Your timesheet will be saved but not submitted. You can edit and submit it later."
        onConfirm={() => {
          onSubmit("ADD_AND_SAVE")
          setIsConfirmModalVisible(false);
        }}
        onCancel={() => setIsConfirmModalVisible(false)}
        confirmText="Save"
        cancelText="Cancel"
      />
    <Loader visible={isLoading} />
  </Modal>
)}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    maxHeight: height * 0.9,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  formGroup: {
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  addButton: {
    backgroundColor: "#a970ff",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    flex: 1,
  },
  addButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  addOnlyButton: {
    backgroundColor: "#8B5CF6",
  },
  addAndSaveButton: {
    backgroundColor: "#a970ff",
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddEditTaskModal; 