import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const TimeSheetCard = ({ task, onEdit, formatDisplayDate, isSelfView, onApprove, onReject }) => {
  const statusConfig = {
    s: {
      color: '#2196F3',
      icon: 'schedule',
      label: 'SUBMITTED',
      bgColor: '#5AC8FA15'
    },
    a: {
      color: '#008000',
      icon: 'check-circle-outline',
      label: 'APPROVED',
      bgColor: '#4CD96415'
    },
    r: {
      color: '#FF6B6B',
      icon: 'clear',
      label: 'REJECTED',
      bgColor: '#FF6B6B15'
    },
    n: {
      color: '#888888',
      icon: 'schedule',
      label: 'Not Submitted',
      bgColor: '#88888815'
    },
    default: {
      color: '#888888',
      icon: 'help-outline',
      label: 'Unknown',
      bgColor: '#88888815'
    }
  };
  const statusKey = (task.status || 'default').toLowerCase();
  const status = statusConfig[statusKey] || statusConfig.default;
  const showActionButtons = !isSelfView && ['s'].includes(statusKey);

  return (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskProject}>{task.project_code}</Text>
        <View style={styles.taskHeaderRight}>
          {isSelfView && (
            <TouchableOpacity style={styles.editButton} onPress={() => onEdit(task)}>
              <Ionicons name="create-outline" size={20} color="#a970ff" />
            </TouchableOpacity>
          )}
          <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}> 
            <MaterialIcons name={status.icon} size={14} color={status.color} /> 
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.taskActivity}>{task.activity_name}</Text>
      <View style={styles.taskDetails}>
        <View style={styles.taskDetailItem}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.taskDetailText}>{formatDisplayDate(task.a_date)}</Text>
        </View>
        <View style={styles.taskDetailItem}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.taskDetailText}>{task.effort}h</Text>
        </View>
      </View>
      {task.remarks && <Text style={styles.taskRemarks}>{task.remarks}</Text>}
      {showActionButtons && (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={() => onReject(task, 'REJECT')}>
            <MaterialIcons name="close" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.approveButton]} onPress={() => onApprove(task, 'APPROVE')}>
            <MaterialIcons name="check" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  taskProject: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    color: "white",
  },
  taskActivity: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  taskDetails: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 8,
  },
  taskDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  taskDetailText: {
    fontSize: 14,
    color: "#666",
  },
  taskRemarks: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
    marginTop: 4,
  },
  taskHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editButton: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: "#f8f4ff",
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TimeSheetCard; 