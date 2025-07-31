import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import ConfirmationModal from "./ConfirmationModal";
import TaskDetailsModal from "./TaskDetailsModal ";

const TimeSheetCard = ({ task, onEdit, isSelfView, onApprove, onReject, onDelete, EditView }) => {

  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
   const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const statusConfig = {
    s: {
      color: '#2196F3',
      icon: 'schedule',
      label: 'SUBMITTED',
      bgColor: '#E3F2FD',
      borderColor: '#2196F3'
    },
    a: {
      color: '#4CAF50',
      icon: 'check-circle',
      label: 'APPROVED',
      bgColor: '#E8F5E8',
      borderColor: '#4CAF50'
    },
    r: {
      color: '#f44336',
      icon: 'cancel',
      label: 'REJECTED',
      bgColor: '#FFEBEE',
      borderColor: '#f44336'
    },
    n: {
      color: '#EF6C00',
      icon: 'schedule',
      label: 'DRAFT',
      bgColor: '#FFF3E0',
      borderColor: '#FF9800'
    },
    default: {
      color: '#9E9E9E',
      icon: 'help-outline',
      label: 'UNKNOWN',
      bgColor: '#F5F5F5',
      borderColor: '#9E9E9E'
    }
  };

  const statusKey = (task.status || 'default').toLowerCase();
  const status = statusConfig[statusKey] || statusConfig.default;
  const showActionButtons = !isSelfView && ['s'].includes(statusKey);

    const handleCardPress = () => {
    setIsDetailsModalVisible(true);
  };

  return (
    <View style={[styles.taskCard, { borderLeftColor: status.borderColor }]}>
      {/* Header with Project and Status */}
      <View style={styles.cardHeader}>
        <View style={styles.projectSection}>
          <Text style={styles.projectCode}>{task.project_code}</Text>
          <Text style={styles.projectTitle} numberOfLines={1}>
            {task.project_title || "Project Title"}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: status.bgColor,
              borderColor: status.borderColor,
            },
          ]}
        >
          <MaterialIcons name={status.icon} size={16} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
      </View>

      {/* Activity Section */}
      <View style={styles.activitySection}>
        <MaterialIcons name="work" size={16} color="#666" />
        <Text style={styles.activityText}>{task.activity_name}</Text>
      </View>

      {/* Time and Date Section */}
      <View style={styles.timeSection}>
        <View style={styles.timeItem}>
          <View style={styles.timeIcon}>
            <Ionicons name="calendar" size={16} color="#a970ff" />
          </View>
          <View>
            <Text style={styles.timeLabel}>Date</Text>
            <Text style={styles.timeValue}>{task.a_date}</Text>
          </View>
        </View>

        <View style={styles.timeItem}>
          <View style={styles.timeIcon}>
            <Ionicons name="time" size={16} color="#a970ff" />
          </View>
          <View>
            <Text style={styles.timeLabel}>Hours</Text>
            <Text style={styles.timeValue}>{task.effort}h</Text>
          </View>
        </View>
      </View>

      {/* Remarks Section */}
      {task.remarks && (
        <View style={styles.remarksSection}>
          <View style={styles.remarksHeader}>
            <Ionicons name="chatbubble-outline" size={14} color="#666" />
            <Text style={styles.remarksLabel}>Notes</Text>
          </View>
          <Text style={styles.remarksText}>{task.remarks}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {isSelfView && !["s", "a", "r"].includes(statusKey) && EditView !== "T" && (
          <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => onEdit(task)}
              >
                <Ionicons name="create-outline" size={20} color="#fff" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>

            {isSelfView && ["n"].includes(statusKey) && (
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: "#f44336" }]}
                onPress={() => setIsConfirmModalVisible(true)}
              >
                <MaterialIcons name="delete-outline" size={20} color="#fff" />
                <Text style={styles.editButtonText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {showActionButtons && (
          <View style={styles.approvalButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => onReject(task, "REJECT")}
            >
              <MaterialIcons name="close" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => onApprove(task, "APPROVE")}
            >
              <MaterialIcons name="check" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.tapIndicator} onPress={handleCardPress}>
          <Text style={styles.tapText}>Tap to view details</Text>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color="#a970ff"
          />
        </TouchableOpacity>
      </View>
      <ConfirmationModal
        visible={isConfirmModalVisible}
        message="Your task will be Deleted. Are you sure ?"
        onConfirm={() => {
          onDelete(task);
          setIsConfirmModalVisible(false);
        }}
        onCancel={() => setIsConfirmModalVisible(false)}
        confirmText="Delete"
        cancelText="Cancel"
        color="red"
      />

      <TaskDetailsModal
        visible={isDetailsModalVisible}
        onClose={() => setIsDetailsModalVisible(false)}
        task={task}
        status={status}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  projectSection: {
    flex: 1,
    marginRight: 12,
  },
  projectCode: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 2,
  },
  projectTitle: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  activitySection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    gap: 8,
  },
  activityText: {
    fontSize: 14,
    color: "#444",
    fontWeight: "500",
    flex: 1,
  },
  timeSection: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 24,
  },
  timeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f0ff",
    justifyContent: "center",
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  timeValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  remarksSection: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  remarksHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  remarksLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  remarksText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    fontStyle: "italic",
  },
  actionSection: {
    marginTop: 8,
    // position: "absolute",
    // right: 15,
    // bottom: 15,
  },
  editButton: {
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#a970ff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  approvalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  approveButton: {
    backgroundColor: "#4CAF50",
  },
  rejectButton: {
    backgroundColor: "#f44336",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
    tapIndicator: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  tapText: {
    fontSize: 12,
    color: '#a970ff',
    fontWeight: '500',
  },
});

export default TimeSheetCard;