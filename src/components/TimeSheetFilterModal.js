import React, { useEffect, useState } from "react";
import { Modal, TouchableOpacity, View, Text, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DropdownPicker from "./DropdownPicker";
import DatePicker from "./DatePicker";

const FilterModal = ({ visible, onClose, filters, setFilters, projects, activities, statuses, clearFilters, startDate, endDate, currentWeekStart, getCurrentWeekDates }) => {
  const [tempFilters, setTempFilters] = useState(filters);
  const [tempStartDate, setTempStartDate] = useState(startDate || getCurrentWeekDates(currentWeekStart).start);
  const [tempEndDate, setTempEndDate] = useState(endDate || getCurrentWeekDates(currentWeekStart).end);

  useEffect(() => {
    // Sync temp state with props when modal opens
    setTempFilters(filters);
    setTempStartDate(filters.startDate || getCurrentWeekDates(currentWeekStart).start);
    setTempEndDate(filters.endDate || getCurrentWeekDates(currentWeekStart).end);
  }, [visible, filters, currentWeekStart]);

  const areFiltersUnchanged = () => {
    const { start, end } = getCurrentWeekDates(currentWeekStart);
    return (
      !tempFilters.project &&
      !tempFilters.status &&
      !tempFilters.activity &&
      tempStartDate.toDateString() === start.toDateString() &&
      tempEndDate.toDateString() === end.toDateString()
    );
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setFilters((prev) => ({
      ...prev,
      startDate: tempStartDate,
      endDate: tempEndDate,
    }));
    onClose();
  };

  const handleClearFilters = () => {
    setTempFilters({
      startDate: null,
      endDate: null,
      project: "",
      status: "",
      activity: "",
    });
    setTempStartDate(getCurrentWeekDates(currentWeekStart).start);
    setTempEndDate(getCurrentWeekDates(currentWeekStart).end);
    clearFilters();
  };

  return (
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
            <Text style={styles.modalTitle}>Filter Tasks</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <DatePicker
                cDate={tempStartDate}
                label="Start Date"
                setCDate={setTempStartDate}
              />
            </View>

            <View style={styles.formGroup}>
              <DatePicker
                cDate={tempEndDate}
                label="End Date"
                setCDate={setTempEndDate}
              />
            </View>

            <View style={styles.formGroup}>
              <DropdownPicker
                label="Project"
                data={projects.map((project) => ({
                  label: `${project.title} (${project.project_code})`,
                  value: project.project_code,
                }))}
                value={tempFilters.project}
                setValue={(value) => setTempFilters((prev) => ({ ...prev, project: value }))}
              />
            </View>
            <View style={styles.formGroup}>
              <DropdownPicker
                label="Activity"
                data={activities.map((activity) => ({
                  label: activity.name,
                  value: activity.name,
                }))}
                value={tempFilters.activity}
                setValue={(value) => setTempFilters((prev) => ({ ...prev, activity: value }))}
              />
            </View>
            <View style={styles.formGroup}>
              <DropdownPicker
                label="Status"
                data={statuses.map((status) => ({
                  label: status,
                  value: status,
                }))}
                value={tempFilters.status}
                setValue={(value) => setTempFilters((prev) => ({ ...prev, status: value }))}
              />
            </View>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[styles.clearButton, areFiltersUnchanged() && styles.disabledButton]}
                onPress={handleClearFilters}
                disabled={areFiltersUnchanged()}
              >
                <Text style={[styles.clearButtonText, areFiltersUnchanged() && styles.disabledButtonText]}>
                  Clear Filters
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.applyButton, areFiltersUnchanged() && styles.disabledButton]}
                onPress={handleApplyFilters}
                disabled={areFiltersUnchanged()}
              >
                <Text style={[styles.applyButtonText, areFiltersUnchanged() && styles.disabledButtonText]}>
                  Apply Filters
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
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
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: 600,
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
    marginBottom: 10,
  },
  filterButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  clearButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#a970ff",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#a970ff",
    fontSize: 16,
    fontWeight: "600",
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#a970ff",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#e0e0e0",
    opacity: 0.5,
  },
  disabledButtonText: {
    color: "#999",
  },
});

export default FilterModal; 