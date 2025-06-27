import React from "react";
import { Modal, TouchableOpacity, View, Text, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DropdownPicker from "./DropdownPicker";

const FilterModal = ({
  visible,
  onClose,
  filters,
  setFilters,
  projects,
  activities,
  statuses,
  clearFilters
}) => (
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
            <DropdownPicker
              label="Project"
              data={projects.map((project) => ({
                label: project[0],
                value: project[0],
              }))}
              value={filters.project}
              setValue={(value) => setFilters((prev) => ({ ...prev, project: value }))}
            />
          </View>
          <View style={styles.formGroup}>
            <DropdownPicker
              label="Activity"
              data={activities.map((activity) => ({
                label: activity.name,
                value: activity.name,
              }))}
              value={filters.activity}
              setValue={(value) => setFilters((prev) => ({ ...prev, activity: value }))}
            />
          </View>
          <View style={styles.formGroup}>
            <DropdownPicker
              label="Status"
              data={statuses.map((status) => ({
                label: status,
                value: status,
              }))}
              value={filters.status}
              setValue={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            />
          </View>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearButtonText}>Clear Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={onClose}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableOpacity>
    </TouchableOpacity>
  </Modal>
);

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
});

export default FilterModal; 