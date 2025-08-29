import React, { useEffect, useState } from "react";
import { Modal, TouchableOpacity, View, Text, ScrollView, TextInput, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DropdownPicker from "./DropdownPicker";
import DatePicker from "./DatePicker";
import Loader from "./old_components/Loader";
import ConfirmationModal from "./ConfirmationModal";
import TimePicker from "./TimePicker";
import ErrorModal from "./ErrorModal";
import TabNavigation from "./TabNavigation";
import { colors } from "../Styles/appStyle";

const { height } = Dimensions.get("window");

const AddEditTaskModal = ({ visible, onClose, onSubmit, isLoading, formData, setFormData, editingTask, projects, activities, projectActiveTab, setProjectActiveTab, fetchProjectCategories, EmpId, hasProjects }) => {
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [timeManuallyChanged, setTimeManuallyChanged] = useState(false);


  // Helper: parse time string (e.g., '10:23 AM') to Date or null
  const parseTimeToDate = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return null;
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time ? time.split(':').map(Number) : [0, 0];
    if (period) {
      if (period.toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
    }
    const date = new Date();
    date.setHours(hours || 0, minutes || 0, 0, 0);
    return isNaN(date.getTime()) ? null : date;
  };
  // On mount or when editingTask changes, initialize formData
  useEffect(() => {
    if (editingTask) {
      const parseTaskDate = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') return new Date();
        const regex = /^(\d{2})-([A-Za-z]{3})-(\d{4})$/;
        const match = dateStr.match(regex);
        if (!match) return new Date();
        const [, day, mon, year] = match;
        const monthMap = {
          Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
          Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
        };
        const month = monthMap[mon.charAt(0).toUpperCase() + mon.slice(1).toLowerCase()];
        if (month === undefined) return new Date();
        const parsedDate = new Date(Number(year), month, Number(day));
        return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
      };

      setFormData(prev => ({
        ...prev,
        project: editingTask.project_code || "",
        activity: editingTask.activity_id || "",
        date: editingTask.a_date ? parseTaskDate(editingTask.a_date) : new Date(),
        startTime: editingTask.start_time ? parseTimeToDate(editingTask.start_time) : null,
        endTime: editingTask.end_time ? parseTimeToDate(editingTask.end_time) : null,
        hours: editingTask.effort ? editingTask.effort.toString() : "",
        remarks: editingTask.remarks || "",
      }));
    } else {
      setFormData({
        project: "",
        activity: "",
        date: new Date(),
        startTime: null,
        endTime: null,
        hours: "",
        remarks: "",
      });
    }
  }, [editingTask]);

  // Auto-calculate effort if both times are selected
  useEffect(() => {
    const hasStart = formData.startTime instanceof Date && !isNaN(formData.startTime);
    const hasEnd = formData.endTime instanceof Date && !isNaN(formData.endTime);
    if (hasStart && hasEnd && (!editingTask || timeManuallyChanged)) {
      const diffMs = formData.endTime - formData.startTime;
      if (diffMs > 0) {
        const hours = (diffMs / (1000 * 60 * 60)).toFixed(2);
        setFormData((prev) => ({ ...prev, hours }));
        setErrorMessage("");
      } else {
        setErrorMessage("End time cannot be before or equal to start time.");
      }
    } else {
      setErrorMessage("");
    }
  }, [formData.startTime, formData.endTime, editingTask, timeManuallyChanged]);


  // Validation: effort vs. time
  const validateAndSubmit = (mode) => {
    const hasEffort = formData.hours && parseFloat(formData.hours) > 0;
    const hasStart = formData.startTime instanceof Date && !isNaN(formData.startTime);
    const hasEnd = formData.endTime instanceof Date && !isNaN(formData.endTime);
    if (hasEffort && parseFloat(formData.hours) > 24) {
      setErrorMessage("Effort cannot be more than 24 hours.");
      setIsErrorModalVisible(true);
      return;
    }
    if (!hasEffort && !(hasStart && hasEnd)) {
      setErrorMessage("Please provide either Effort or Start and End time.");
      setIsErrorModalVisible(true);
      return;
    }
    if (hasStart && hasEnd && formData.endTime <= formData.startTime) {
      setErrorMessage("End time cannot be before or equal to start time.");
      setIsErrorModalVisible(true);
      return;
    }
    onSubmit(mode, { hasStart, hasEnd });
  };

  // Helper to check if all required fields are filled
  const isFormValid = () => {
    const hasProject = !!formData.project;
    const hasActivity = !!formData.activity;
    const hasDate = formData.date instanceof Date && !isNaN(formData.date);
    const hasEffort = formData.hours && parseFloat(formData.hours) > 0;
    const hasStart = formData.startTime instanceof Date && !isNaN(formData.startTime);
    const hasEnd = formData.endTime instanceof Date && !isNaN(formData.endTime);
    // Must have project, activity, date, and (effort or both times)
    return hasProject && hasActivity && hasDate && (hasEffort || (hasStart && hasEnd));
  };

  // Helper to get form validation state
  const getFormValidationState = () => {
    const isValid = isFormValid();
    return {
      isValid,
      showError: !isValid && !editingTask,
      buttonDisabled: isLoading || !isValid
    };
  };

  const formState = getFormValidationState();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        {/* TouchableOpacity for the overlay area outside modalContent */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingTask ? "Edit Task" : "Add New Task"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

               
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {hasProjects && (
              <TabNavigation
                tabs={[
                  { label: 'Assign Project', value: 'Assign Project' },
                  { label: 'Other Projects', value: 'Other Projects' }
                ]}
                activeTab={projectActiveTab}
                setActiveTab={(tab) => {
                  setProjectActiveTab(tab);
                  if (tab === 'Assign Project') {
                    fetchProjectCategories(EmpId); // With EmpId
                  } else {
                    fetchProjectCategories(""); // Without EmpId
                  }
                }}
              />
            )}  
            {projects.length > 0 && (
              <DropdownPicker
                label="Project *"
                data={projects.map((project) => ({
                  label: `${project.title} (${project.project_code})`,
                  value: project.project_code,
                }))}
                value={formData.project}
                setValue={(value) => setFormData((prev) => ({ ...prev, project: value }))}
              />
            )}
            <DropdownPicker
              label="Activity *"
              data={activities.map((activity) => ({
                label: activity.name,
                value: activity.activity_id,
              }))}
              value={formData.activity}
              setValue={(value) => setFormData((prev) => ({ ...prev, activity: value }))}
            />
            <DatePicker
              cDate={formData.date}
              label="Date *"
              setCDate={(date) => setFormData((prev) => ({ ...prev, date }))}
              // minimumDate={new Date(new Date().setDate(new Date().getDate() - 7))}
              maximumDate={new Date()}
            />
            <View style={styles.formGroup}>
              <TimePicker
                label="Start Time"
                cDate={formData.startTime}
                setCDate={(value) => {
                  setFormData((prev) => ({ ...prev, startTime: value }));
                  if (editingTask) setTimeManuallyChanged(true);
                }}
              />

            </View>
            <View style={styles.formGroup}>
              <TimePicker
              label="End Time"
              cDate={formData.endTime}
              setCDate={(value) => {
                setFormData((prev) => ({ ...prev, endTime: value }));
                if (editingTask) setTimeManuallyChanged(true);
              }}
            />

            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Efforts <Text style={{ fontSize: 12,color: '#888',fontWeight: '600',}}>(Please fill Start Time , End Time or Efforts)</Text></Text>
              <TextInput
                style={[
                  styles.input,
                  editingTask && formData.startTime && formData.endTime ? styles.disabledInput : null
                ]}
                value={formData.hours}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, hours: value }))
                }
                placeholder="Enter hours"
                keyboardType="numeric"
                placeholderTextColor="#999"
                editable={!(editingTask && formData.startTime && formData.endTime)}
              />

            </View>
            {errorMessage ? (
              <Text style={{ color: "red", marginTop: 4 }}>{errorMessage}</Text>
            ) : null}
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
          </ScrollView>
            {editingTask ? (
              <View style={styles.addButtonsContainer}>
                <TouchableOpacity
                  style={[styles.addButton, styles.addOnlyButton, formState.buttonDisabled && { opacity: 0.5 }]}
                  onPress={() => validateAndSubmit("UPDATE")}
                  disabled={formState.buttonDisabled}
                >
                  <Text style={styles.addButtonText}>Update</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.addButtonsContainer}>
                <TouchableOpacity
                  style={[styles.addButton, styles.addOnlyButton, formState.buttonDisabled && { opacity: 0.5 }]}
                  onPress={() => setIsConfirmModalVisible(true)}
                  disabled={formState.buttonDisabled}
                >
                  <Text style={styles.addButtonText}>Save</Text>
                </TouchableOpacity>
                {formState.showError && (
                  <Text style={styles.errorMessage}>Please fill the * mark fields</Text>
                )}
              </View>
            )}
        </View>
      </View>
      <ConfirmationModal
        visible={isConfirmModalVisible}
        message="Are you sure ? Do you want to save this task"
        onConfirm={() => {
          validateAndSubmit("ADD_AND_SAVE");
          setIsConfirmModalVisible(false);
        }}
        onCancel={() => setIsConfirmModalVisible(false)}
        confirmText="Save"
        cancelText="Cancel"
      />
      <ErrorModal
        visible={isErrorModalVisible}
        message={errorMessage}
        onClose={() => setIsErrorModalVisible(false)}
      />
      <Loader visible={isLoading} />
    </Modal>
  );
};

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
    paddingTop: 30,
    // paddingBottom: 30,
    maxHeight: height * 0.85,
  },
  scrollContent: {
    // paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
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
  },
  addButtonsContainer: {
    flexDirection: "column",
    gap: 12,
    marginVertical: 10,
  },
  addOnlyButton: {
    backgroundColor: "#8B5CF6",
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorMessage: {
    textAlign: "center",
    color: colors.red, 
    fontSize: 12
  },
  disabledInput: {
  backgroundColor: "#f0f0f0", // light grey
  color: "#888"               // greyed-out text
},
});

export default AddEditTaskModal;